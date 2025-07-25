import { BookFormat, BookMetadata, BookDoc } from '@/types/book'

// 为foliate-js提供Polyfills（如果需要的话）
// 这些是新的JavaScript功能，在较老的环境中可能需要polyfill

export type DocumentFile = File

export const EXTS: Record<BookFormat, string> = {
  EPUB: 'epub',
  PDF: 'pdf',
  MOBI: 'mobi',
  CBZ: 'cbz',
  FB2: 'fb2',
  FBZ: 'fbz',
  TXT: 'txt',
  AZW3: 'azw3'
}

export { type BookDoc } from '@/types/book';

export class DocumentLoader {
  private file: File

  constructor(file: File) {
    this.file = file
  }

  private async isZip(): Promise<boolean> {
    const arr = new Uint8Array(await this.file.slice(0, 4).arrayBuffer())
    return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04
  }

  private async isPDF(): Promise<boolean> {
    const arr = new Uint8Array(await this.file.slice(0, 5).arrayBuffer())
    return (
      arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2d
    )
  }

  private isTXT(): boolean {
    return (
      this.file.type === 'text/plain' || 
      this.file.name.endsWith('.txt') ||
      this.file.name.endsWith('.TXT')
    )
  }

  private isEPUB(): boolean {
    return (
      this.file.type === 'application/epub+zip' || 
      this.file.name.endsWith('.epub') ||
      this.file.name.endsWith('.EPUB')
    )
  }

  private isCBZ(): boolean {
    return (
      this.file.type === 'application/vnd.comicbook+zip' || 
      this.file.name.endsWith('.cbz') ||
      this.file.name.endsWith('.CBZ')
    )
  }

  private isFB2(): boolean {
    return (
      this.file.type === 'application/x-fictionbook+xml' || 
      this.file.name.endsWith('.fb2') ||
      this.file.name.endsWith('.FB2')
    )
  }

  private isMOBI(): boolean {
    return (
      this.file.name.endsWith('.mobi') ||
      this.file.name.endsWith('.MOBI') ||
      this.file.name.endsWith('.azw3') ||
      this.file.name.endsWith('.AZW3')
    )
  }

  public async open(): Promise<{ book: BookDoc; format: BookFormat }> {
    if (!this.file.size) {
      throw new Error('文件为空')
    }

    let book: BookDoc
    let format: BookFormat

    try {
      if (this.isTXT()) {
        // 处理TXT文件 - 创建简单的元数据
        const text = await this.file.text()
        book = await this.createTXTBook(text)
        format = 'TXT'
      } else if (await this.isPDF()) {
        // PDF格式处理（目前简化实现）
        book = await this.createPDFBook()
        format = 'PDF'
      } else if (await this.isZip()) {
        if (this.isEPUB()) {
          book = await this.createEPUBBook()
          format = 'EPUB'
        } else if (this.isCBZ()) {
          book = await this.createCBZBook()
          format = 'CBZ'
        } else {
          throw new Error('不支持的ZIP格式')
        }
      } else if (this.isFB2()) {
        book = await this.createFB2Book()
        format = 'FB2'
      } else if (this.isMOBI()) {
        book = await this.createMOBIBook()
        format = this.file.name.toLowerCase().endsWith('.azw3') ? 'AZW3' : 'MOBI'
      } else {
        throw new Error('不支持的文件格式')
      }

      return { book, format }
    } catch (error) {
      console.error('解析书籍失败:', error)
      throw new Error(`解析书籍失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private async createTXTBook(text: string): Promise<BookDoc> {
    // 从文件名提取标题
    const title = this.file.name.replace(/\.(txt|TXT)$/, '')
    
    // 简单的章节检测 - 查找以"第X章"、"Chapter"等开头的行
    const lines = text.split('\n')
    const chapters: any[] = []
    let currentChapter = 0

    lines.forEach((line, index) => {
      if (line.match(/^(第[一二三四五六七八九十\d]+章|Chapter\s*\d+|CHAPTER\s*\d+)/)) {
        chapters.push({
          id: currentChapter++,
          label: line.trim(),
          href: `#chapter-${currentChapter}`,
          location: { current: index, total: lines.length }
        })
      }
    })

    // 如果没有检测到章节，创建一个默认章节
    if (chapters.length === 0) {
      chapters.push({
        id: 0,
        label: title,
        href: '#chapter-0',
        location: { current: 0, total: lines.length }
      })
    }

    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从TXT文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: chapters,
      sections: [{
        id: 'main',
        cfi: '',
        size: text.length,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }

  private async createPDFBook(): Promise<BookDoc> {
    const title = this.file.name.replace(/\.(pdf|PDF)$/, '')
    
    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从PDF文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: [{
        id: 0,
        label: title,
        href: '#page-1'
      }],
      sections: [{
        id: 'main',
        cfi: '',
        size: this.file.size,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }

  private async createEPUBBook(): Promise<BookDoc> {
    // 简化的EPUB处理 - 实际项目中应该使用foliate-js
    const title = this.file.name.replace(/\.(epub|EPUB)$/, '')
    
    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从EPUB文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: [{
        id: 0,
        label: title,
        href: '#chapter-1'
      }],
      sections: [{
        id: 'main',
        cfi: '',
        size: this.file.size,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }

  private async createCBZBook(): Promise<BookDoc> {
    const title = this.file.name.replace(/\.(cbz|CBZ)$/, '')
    
    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从CBZ文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: [{
        id: 0,
        label: title,
        href: '#page-1'
      }],
      sections: [{
        id: 'main',
        cfi: '',
        size: this.file.size,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }

  private async createFB2Book(): Promise<BookDoc> {
    const title = this.file.name.replace(/\.(fb2|FB2)$/, '')
    
    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从FB2文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: [{
        id: 0,
        label: title,
        href: '#chapter-1'
      }],
      sections: [{
        id: 'main',
        cfi: '',
        size: this.file.size,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }

  private async createMOBIBook(): Promise<BookDoc> {
    const title = this.file.name.replace(/\.(mobi|MOBI|azw3|AZW3)$/, '')
    
    return {
      metadata: {
        title: title,
        author: '未知作者',
        language: 'zh-CN',
        description: `从${this.file.name.split('.').pop()?.toUpperCase()}文件导入: ${this.file.name}`
      },
      dir: 'ltr',
      toc: [{
        id: 0,
        label: title,
        href: '#chapter-1'
      }],
      sections: [{
        id: 'main',
        cfi: '',
        size: this.file.size,
        linear: 'yes'
      }],
      transformTarget: new EventTarget(),
      splitTOCHref: (href: string) => [href, 0],
      getCover: async () => null
    }
  }
}

// 工具函数：获取文件名（不含扩展名）
export const getBaseFilename = (filename: string): string => {
  return filename.replace(/\.[^/.]+$/, '')
}

// 工具函数：获取文件名（含扩展名）
export const getFilename = (path: string): string => {
  return path.split('/').pop() || path
} 