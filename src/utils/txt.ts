import JSZip from 'jszip'

/**
 * TXT转EPUB转换器
 * 完整实现 - 将TXT文件转换为标准EPUB格式
 */
export class TxtToEpubConverter {
  private static readonly CHAPTER_PATTERNS = [
    /^第[一二三四五六七八九十百千万\d]+章[\s\S]*$/i,
    /^Chapter\s*\d+[\s\S]*$/i,
    /^CHAPTER\s*\d+[\s\S]*$/i,
    /^第\d+章[\s\S]*$/i,
    /^序章|序言|前言|楔子|引言/i,
    /^尾声|后记|结语|番外/i,
    /^卷[一二三四五六七八九十\d]+[\s\S]*$/i,
    /^Volume\s*\d+[\s\S]*$/i,
    /^VOLUME\s*\d+[\s\S]*$/i,
  ]

  private static readonly ENCODING_PATTERNS = {
    'utf-8': [0xEF, 0xBB, 0xBF],
    'utf-16le': [0xFF, 0xFE],
    'utf-16be': [0xFE, 0xFF],
  }

  async convert({ file }: { file: File }): Promise<{ file: File }> {
    try {
      // 检测文本编码并读取内容
      const { text, encoding } = await this.readTextWithEncoding(file)
      
      // 从文件名提取标题和可能的作者
      const { title, author } = this.extractMetadataFromFilename(file.name)

      // 检测和分割章节
      const chapters = this.detectAndSplitChapters(text, title)

      // 生成完整的EPUB文件
      const epubBlob = await this.generateEpubFile(title, author, chapters, encoding)

      // 创建新的EPUB文件对象
      const epubFile = new File([epubBlob], `${title}.epub`, { 
        type: 'application/epub+zip',
        lastModified: Date.now() 
      })

      return { file: epubFile }
    } catch (error) {
      console.error('TXT转EPUB失败:', error)
      throw new Error(`TXT转EPUB失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 检测文本编码并读取内容
   */
  private async readTextWithEncoding(file: File): Promise<{ text: string; encoding: string }> {
    const buffer = await file.arrayBuffer()
    const encoding = this.detectEncoding(buffer)
    
    try {
      // 尝试使用检测到的编码解码
      const decoder = new TextDecoder(encoding)
      const text = decoder.decode(buffer)
      return { text, encoding }
    } catch (error) {
      console.warn(`编码 ${encoding} 解码失败，尝试使用 UTF-8`)
      // 回退到UTF-8
      const decoder = new TextDecoder('utf-8')
      const text = decoder.decode(buffer)
      return { text, encoding: 'utf-8' }
    }
  }

  /**
   * 检测文本编码（增强版）
   */
  private detectEncoding(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)

    // 检测BOM
    for (const [encoding, pattern] of Object.entries(TxtToEpubConverter.ENCODING_PATTERNS)) {
      if (bytes.length >= pattern.length) {
        const match = pattern.every((byte, index) => bytes[index] === byte)
        if (match) return encoding
      }
    }

    // 检测中文编码（简化版）
    const sample = bytes.slice(0, Math.min(1024, bytes.length))
    
    // 检测UTF-8模式
    let utf8Score = 0
    for (let i = 0; i < sample.length; i++) {
      const byte = sample[i]
      if (byte >= 0x80) {
        // 多字节UTF-8序列
        let continuationBytes = 0
        if ((byte & 0xE0) === 0xC0) continuationBytes = 1
        else if ((byte & 0xF0) === 0xE0) continuationBytes = 2
        else if ((byte & 0xF8) === 0xF0) continuationBytes = 3
        
        if (continuationBytes > 0) {
          let valid = true
          for (let j = 1; j <= continuationBytes && i + j < sample.length; j++) {
            if ((sample[i + j] & 0xC0) !== 0x80) {
              valid = false
              break
            }
          }
          if (valid) {
            utf8Score += continuationBytes + 1
            i += continuationBytes
          }
        }
      }
    }

    // 如果UTF-8分数足够高，认为是UTF-8
    if (utf8Score > sample.length * 0.1) {
      return 'utf-8'
    }

    // 默认使用UTF-8
    return 'utf-8'
  }

  /**
   * 从文件名提取元数据
   */
  private extractMetadataFromFilename(filename: string): { title: string; author: string } {
    const nameWithoutExt = filename.replace(/\.(txt|TXT)$/, '')
    
    // 尝试匹配 "作者 - 书名" 或 "书名 - 作者" 格式
    const dashMatch = nameWithoutExt.match(/^(.+?)\s*[-—–]\s*(.+)$/)
    if (dashMatch) {
      const [, part1, part2] = dashMatch
      // 简单启发式：较短的可能是作者，较长的可能是标题
      if (part1.length < part2.length && part1.length < 20) {
        return { title: part2.trim(), author: part1.trim() }
      } else {
        return { title: part1.trim(), author: part2.trim() }
      }
    }

    // 尝试匹配作者名模式（例如：[作者名]书名）
    const authorBracketMatch = nameWithoutExt.match(/^[\[【](.+?)[\]】]\s*(.+)$/)
    if (authorBracketMatch) {
      const [, author, title] = authorBracketMatch
      return { title: title.trim(), author: author.trim() }
    }

    // 默认情况：文件名作为标题
    return { title: nameWithoutExt.trim(), author: '未知作者' }
  }

  /**
   * 增强的章节检测和分割
   */
  private detectAndSplitChapters(text: string, defaultTitle: string): Array<{ title: string; content: string; id: string }> {
    const lines = text.split(/\r?\n/)
    const chapters: Array<{ title: string; content: string; id: string }> = []
    let currentChapter: { title: string; content: string; id: string } | null = null
    let chapterCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 检测章节标题
      const isChapterTitle = this.isChapterTitle(line)
      
      if (isChapterTitle && line.length < 100) { // 章节标题通常不会太长
        // 保存上一章节
        if (currentChapter && currentChapter.content.trim()) {
          chapters.push(currentChapter)
        }
        
        // 开始新章节
        chapterCount++
        currentChapter = {
          title: line || `第${chapterCount}章`,
          content: '',
          id: `chapter-${chapterCount}`
        }
      } else if (currentChapter) {
        // 添加内容到当前章节
        currentChapter.content += lines[i] + '\n'
      } else {
        // 如果还没有章节，创建默认章节
        if (!currentChapter) {
          currentChapter = {
            title: defaultTitle,
            content: '',
            id: 'chapter-1'
          }
        }
        currentChapter.content += lines[i] + '\n'
      }
    }

    // 添加最后一个章节
    if (currentChapter && currentChapter.content.trim()) {
      chapters.push(currentChapter)
    }

    // 如果没有检测到章节，创建单个章节
    if (chapters.length === 0) {
      chapters.push({
        title: defaultTitle,
        content: text,
        id: 'chapter-1'
      })
    }

    return chapters
  }

  /**
   * 检测是否为章节标题
   */
  private isChapterTitle(line: string): boolean {
    if (!line || line.length < 2) return false
    
    return TxtToEpubConverter.CHAPTER_PATTERNS.some(pattern => pattern.test(line))
  }

  /**
   * 生成完整的EPUB文件
   */
  private async generateEpubFile(
    title: string, 
    author: string, 
    chapters: Array<{ title: string; content: string; id: string }>,
    encoding: string
  ): Promise<Blob> {
    const zip = new JSZip()
    
    // EPUB文件必需的文件结构
    
    // 1. mimetype文件
    zip.file('mimetype', 'application/epub+zip')
    
    // 2. META-INF目录
    const metaInf = zip.folder('META-INF')!
    metaInf.file('container.xml', this.generateContainerXml())
    
    // 3. OEBPS目录（内容目录）
    const oebps = zip.folder('OEBPS')!
    
    // 4. 生成content.opf（包文件）
    oebps.file('content.opf', this.generateContentOpf(title, author, chapters))
    
    // 5. 生成toc.ncx（目录文件）
    oebps.file('toc.ncx', this.generateTocNcx(title, author, chapters))
    
    // 6. 生成样式文件
    oebps.file('styles.css', this.generateStylesCss())
    
    // 7. 生成章节HTML文件
    for (const chapter of chapters) {
      const htmlContent = this.generateChapterHtml(chapter, title)
      oebps.file(`${chapter.id}.xhtml`, htmlContent)
    }
    
    // 生成EPUB文件
    return await zip.generateAsync({ 
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
  }

  /**
   * 生成container.xml
   */
  private generateContainerXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  }

  /**
   * 生成content.opf
   */
  private generateContentOpf(title: string, author: string, chapters: Array<{ title: string; id: string }>): string {
    const bookId = `book-${Date.now()}`
    const now = new Date().toISOString()
    
    const manifest = chapters.map(chapter => 
      `<item id="${chapter.id}" href="${chapter.id}.xhtml" media-type="application/xhtml+xml"/>`
    ).join('\n    ')
    
    const spine = chapters.map(chapter => 
      `<itemref idref="${chapter.id}"/>`
    ).join('\n    ')

    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookid">${bookId}</dc:identifier>
    <dc:title>${this.escapeXml(title)}</dc:title>
    <dc:creator opf:role="aut">${this.escapeXml(author)}</dc:creator>
    <dc:language>zh-CN</dc:language>
    <dc:date>${now}</dc:date>
    <meta name="generator" content="new-x-project TXT to EPUB Converter"/>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="styles" href="styles.css" media-type="text/css"/>
    ${manifest}
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`
  }

  /**
   * 生成toc.ncx
   */
  private generateTocNcx(title: string, author: string, chapters: Array<{ title: string; id: string }>): string {
    const navPoints = chapters.map((chapter, index) => 
      `<navPoint id="${chapter.id}" playOrder="${index + 1}">
      <navLabel>
        <text>${this.escapeXml(chapter.title)}</text>
      </navLabel>
      <content src="${chapter.id}.xhtml"/>
    </navPoint>`
    ).join('\n    ')

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="book-${Date.now()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${this.escapeXml(title)}</text>
  </docTitle>
  <docAuthor>
    <text>${this.escapeXml(author)}</text>
  </docAuthor>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`
  }

  /**
   * 生成CSS样式
   */
  private generateStylesCss(): string {
    return `
body {
  font-family: "宋体", "SimSun", "Times New Roman", serif;
  line-height: 1.8;
  margin: 2em;
  font-size: 16px;
  color: #333;
}

h1 {
  text-align: center;
  margin: 2em 0 1em 0;
  font-size: 1.5em;
  font-weight: bold;
  color: #000;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5em;
}

p {
  margin: 1em 0;
  text-indent: 2em;
  text-align: justify;
}

.chapter {
  page-break-before: always;
  margin-bottom: 2em;
}

.chapter:first-child {
  page-break-before: auto;
}

/* 对话处理 */
p:has(")、")::before,
p:has(""、")::before {
  content: "";
  margin-left: -2em;
}

/* 空行处理 */
.empty-line {
  height: 1em;
}
`
  }

  /**
   * 生成章节HTML
   */
  private generateChapterHtml(chapter: { title: string; content: string; id: string }, bookTitle: string): string {
    const formattedContent = this.formatChapterContent(chapter.content)
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <title>${this.escapeXml(chapter.title)} - ${this.escapeXml(bookTitle)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="chapter" id="${chapter.id}">
    <h1>${this.escapeXml(chapter.title)}</h1>
    ${formattedContent}
  </div>
</body>
</html>`
  }

  /**
   * 格式化章节内容
   */
  private formatChapterContent(content: string): string {
    return content
      .split(/\r?\n/)
      .map(line => line.trim())
      .map(line => {
        if (line.length === 0) {
          return '<div class="empty-line"></div>'
        }
        return `<p>${this.escapeXml(line)}</p>`
      })
      .join('\n    ')
  }

  /**
   * XML转义
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
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