import { Book } from '@/types/book'

// Get directory name for a book (using hash)
export const getDir = (book: Book) => {
  return `${book.hash}`
}

// Get filename without extension
export const getBaseFilename = (filename: string): string => {
  const normalizedPath = filename.replace(/\\/g, '/')
  const baseName = normalizedPath.split('/').pop()?.split('.').slice(0, -1).join('.') || ''
  return baseName
}

// Get filename from path
export const getFilename = (path: string): string => {
  const normalizedPath = path.replace(/\\/g, '/')
  const parts = normalizedPath.split('/')
  const lastPart = parts.pop()!
  return lastPart.split('?')[0]!
}

// Get library filename
export const getLibraryFilename = () => {
  return 'library.json'
}

// Get local book filename
export const getLocalBookFilename = (book: Book) => {
  return `${book.hash}/${book.title}.${getFileExtensionFromFormat(book.format)}`
}

// Get cover filename
export const getCoverFilename = (book: Book) => {
  return `${book.hash}/cover.png`
}

// Get config filename  
export const getConfigFilename = (book: Book) => {
  return `${book.hash}/config.json`
}

// Helper function to get file extension from format
const getFileExtensionFromFormat = (format: string): string => {
  const formatMap: Record<string, string> = {
    EPUB: 'epub',
    PDF: 'pdf', 
    MOBI: 'mobi',
    CBZ: 'cbz',
    FB2: 'fb2',
    FBZ: 'fbz',
    TXT: 'txt',
    AZW3: 'azw3'
  }
  return formatMap[format] || 'epub'
}

// Format authors
export const formatAuthors = (authors: string | string[]): string => {
  if (Array.isArray(authors)) {
    return authors.join(', ')
  }
  return authors || ''
}

// Format title
export const formatTitle = (title: string): string => {
  return title || ''
}

// Format file size
export const formatFileSize = (size: number | null): string => {
  if (size === null) return ''
  const formatter = new Intl.NumberFormat('en', {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
    notation: 'compact',
    compactDisplay: 'short',
  })
  return formatter.format(size)
}

// Get primary language from language array or string
export const getPrimaryLanguage = (lang: string | string[] | undefined): string | undefined => {
  return Array.isArray(lang) ? lang[0] : lang
} 

// 🧭 检测文档的书写方向
export const getDirection = (doc: Document) => {
  const htmlElement = doc.documentElement;
  const bodyElement = doc.body;
  
  // 检查HTML元素的方向属性
  const htmlDir = htmlElement?.getAttribute('dir');
  const htmlWritingMode = htmlElement?.style.writingMode || 
                         window.getComputedStyle(htmlElement).writingMode;
  
  // 检查body元素的方向属性
  const bodyDir = bodyElement?.getAttribute('dir');
  const bodyWritingMode = bodyElement?.style.writingMode || 
                         window.getComputedStyle(bodyElement).writingMode;
  
  // 优先使用body的设置，其次是html的设置
  const dir = bodyDir || htmlDir;
  const writingMode = bodyWritingMode || htmlWritingMode;
  
  // 检测是否为从右到左
  const rtl = dir === 'rtl' || 
              writingMode.includes('vertical-rl') ||
              htmlElement?.getAttribute('class')?.includes('rtl');
  
  // 检测是否为垂直书写
  const vertical = writingMode.includes('vertical') ||
                   htmlElement?.getAttribute('class')?.includes('vertical');
  
  return {
    rtl,
    vertical,
    dir,
    writingMode
  };
}; 