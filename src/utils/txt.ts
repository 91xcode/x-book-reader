/**
 * TXT转EPUB转换器
 * 简化实现 - 将TXT文件内容包装成基本的EPUB结构
 */
export class TxtToEpubConverter {
  async convert({ file }: { file: File }): Promise<{ file: File }> {
    try {
      // 读取TXT文件内容
      const text = await file.text()
      
      // 从文件名提取标题
      const title = file.name.replace(/\.(txt|TXT)$/, '')
      
      // 检测文本编码并进行简单的章节分割
      const chapters = this.detectChapters(text, title)
      
      // 生成EPUB结构
      const epubContent = this.generateEpubContent(title, chapters)
      
      // 创建新的文件对象
      const epubBlob = new Blob([epubContent], { type: 'text/html' })
      const epubFile = new File([epubBlob], `${title}.epub`, { type: 'application/epub+zip' })
      
      return { file: epubFile }
    } catch (error) {
      console.error('TXT转EPUB失败:', error)
      throw new Error(`TXT转EPUB失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 检测章节
   */
  private detectChapters(text: string, title: string): Array<{ title: string; content: string }> {
    const lines = text.split('\n')
    const chapters: Array<{ title: string; content: string }> = []
    let currentChapter: { title: string; content: string } | null = null
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 检测章节标题 - 匹配多种格式
      const chapterMatch = trimmedLine.match(/^(第[一二三四五六七八九十\d]+章|Chapter\s*\d+|CHAPTER\s*\d+|第\d+章)/i)
      
      if (chapterMatch && trimmedLine.length < 50) {
        // 保存上一章节
        if (currentChapter) {
          chapters.push(currentChapter)
        }
        
        // 开始新章节
        currentChapter = {
          title: trimmedLine,
          content: ''
        }
      } else if (currentChapter) {
        // 添加内容到当前章节
        currentChapter.content += line + '\n'
      } else {
        // 如果还没有章节，创建默认章节
        if (!currentChapter) {
          currentChapter = {
            title: title,
            content: ''
          }
        }
        currentChapter.content += line + '\n'
      }
    }
    
    // 添加最后一个章节
    if (currentChapter) {
      chapters.push(currentChapter)
    }
    
    // 如果没有检测到章节，创建单个章节
    if (chapters.length === 0) {
      chapters.push({
        title: title,
        content: text
      })
    }
    
    return chapters
  }

  /**
   * 生成EPUB内容（简化的HTML格式）
   */
  private generateEpubContent(title: string, chapters: Array<{ title: string; content: string }>): string {
    const html = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8"/>
    <title>${this.escapeHtml(title)}</title>
    <style>
        body {
            font-family: "宋体", "SimSun", serif;
            line-height: 1.6;
            margin: 20px;
            font-size: 16px;
        }
        h1 {
            text-align: center;
            margin: 20px 0;
            font-size: 1.5em;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        h2 {
            margin: 30px 0 15px 0;
            font-size: 1.3em;
            color: #333;
        }
        p {
            margin: 10px 0;
            text-indent: 2em;
        }
        .chapter {
            page-break-before: always;
            margin-bottom: 30px;
        }
        .chapter:first-child {
            page-break-before: auto;
        }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(title)}</h1>
    ${chapters.map((chapter, index) => `
    <div class="chapter" id="chapter-${index}">
        <h2>${this.escapeHtml(chapter.title)}</h2>
        ${this.formatContent(chapter.content)}
    </div>
    `).join('')}
</body>
</html>
    `.trim()
    
    return html
  }

  /**
   * 格式化内容 - 将文本转换为HTML段落
   */
  private formatContent(content: string): string {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<p>${this.escapeHtml(line)}</p>`)
      .join('\n        ')
  }

  /**
   * HTML转义
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 检测文本编码（简化实现）
   */
  private detectEncoding(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    
    // 检测BOM
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'utf-8'
    }
    
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'utf-16le'
    }
    
    if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'utf-16be'
    }
    
    // 默认假设UTF-8
    return 'utf-8'
  }
}

/**
 * 工具函数：格式化标题
 */
export const formatTitle = (title: string | undefined): string => {
  if (!title) return '未命名书籍'
  return title.trim().replace(/[<>:"/\\|?*]/g, '_')
}

/**
 * 工具函数：格式化作者
 */
export const formatAuthors = (author: any): string => {
  if (typeof author === 'string') {
    return author.trim()
  }
  if (Array.isArray(author)) {
    return author.map(a => typeof a === 'string' ? a : a.name || '').join(', ')
  }
  if (typeof author === 'object' && author !== null) {
    return author.name || '未知作者'
  }
  return '未知作者'
}

/**
 * 工具函数：获取主要语言
 */
export const getPrimaryLanguage = (language: any): string => {
  if (typeof language === 'string') {
    return language
  }
  if (Array.isArray(language) && language.length > 0) {
    return language[0]
  }
  return 'zh-CN'
} 