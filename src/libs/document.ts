import { BookFormat, BookMetadata, BookDoc } from '@/types/book'

// Polyfills for foliate-js
if (!(Object as any).groupBy) {
  (Object as any).groupBy = (iterable: any, callbackfn: any) => {
    const obj = Object.create(null);
    let i = 0;
    for (const value of iterable) {
      const key = callbackfn(value, i++);
      if (key in obj) {
        obj[key].push(value);
      } else {
        obj[key] = [value];
      }
    }
    return obj;
  };
}

if (!(Map as any).groupBy) {
  (Map as any).groupBy = (iterable: any, callbackfn: any) => {
    const map = new Map();
    let i = 0;
    for (const value of iterable) {
      const key = callbackfn(value, i++);
      const list = map.get(key);
      if (list) {
        list.push(value);
      } else {
        map.set(key, [value]);
      }
    }
    return map;
  };
}

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

  private async makeZipLoader() {
    // 使用JSZip作为替代
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(this.file);
    
    const entries = Object.keys(zipContent.files).map(filename => ({
      filename,
      ...zipContent.files[filename]
    }));

    const loadText = (name: string) => {
      const file = zipContent.files[name];
      return file ? file.async('text') : null;
    };

    const loadBlob = (name: string, type?: string) => {
      const file = zipContent.files[name];
      return file ? file.async('blob') : null;
    };

    const getSize = (name: string) => {
      const file = zipContent.files[name];
      return file ? (file as any).uncompressedSize ?? 0 : 0;
    };

    return { entries, loadText, loadBlob, getSize, sha1: undefined };
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

  private isCBZ(): boolean {
    return (
      this.file.type === 'application/vnd.comicbook+zip' || 
      this.file.name.endsWith(`.${EXTS.CBZ}`)
    )
  }

  private isFB2(): boolean {
    return (
      this.file.type === 'application/x-fictionbook+xml' || 
      this.file.name.endsWith(`.${EXTS.FB2}`)
    )
  }

  private isFBZ(): boolean {
    return (
      this.file.type === 'application/x-zip-compressed-fb2' ||
      this.file.name.endsWith('.fb2.zip') ||
      this.file.name.endsWith(`.${EXTS.FBZ}`)
    )
  }

  public async open(): Promise<{ book: BookDoc; format: BookFormat }> {
    let book = null;
    let format: BookFormat = 'EPUB';
    
    if (!this.file.size) {
      throw new Error('File is empty');
    }

    try {
      if (await this.isZip()) {
        const loader = await this.makeZipLoader();
        const { entries } = loader;

        if (this.isCBZ()) {
          const { makeComicBook } = await import('foliate-js/comic-book.js');
          book = makeComicBook(loader, this.file);
          format = 'CBZ';
        } else if (this.isFBZ()) {
          const entry = entries.find((entry: any) => entry.filename.endsWith(`.${EXTS.FB2}`));
          const blob = await loader.loadBlob((entry ?? entries[0]).filename);
          const { makeFB2 } = await import('foliate-js/fb2.js');
          book = await makeFB2(blob);
          format = 'FBZ';
        } else {
          const { EPUB } = await import('foliate-js/epub.js');
          book = await new EPUB(loader).init();
          format = 'EPUB';
        }
      } else if (await this.isPDF()) {
        const { makePDF } = await import('foliate-js/pdf.js');
        book = await makePDF(this.file);
        format = 'PDF';
      } else if (await (await import('foliate-js/mobi.js')).isMOBI(this.file)) {
        const fflate = await import('foliate-js/vendor/fflate.js');
        const { MOBI } = await import('foliate-js/mobi.js');
        book = await new MOBI({ unzlib: fflate.unzlibSync }).open(this.file);
        format = 'MOBI';
      } else if (this.isFB2()) {
        const { makeFB2 } = await import('foliate-js/fb2.js');
        book = await makeFB2(this.file);
        format = 'FB2';
      } else if (this.file.name.toLowerCase().endsWith('.txt')) {
        // 处理TXT文件：转换为EPUB然后使用foliate-js处理
        const { TxtToEpubConverter } = await import('../utils/txt');
        const converter = new TxtToEpubConverter();
        const { file: epubFile } = await converter.convert({ file: this.file });
        
        // 使用foliate-js的EPUB处理器处理转换后的文件
        const loader = await this.makeZipLoader.call({ file: epubFile });
        const { EPUB } = await import('foliate-js/epub.js');
        book = await new EPUB(loader).init();
        format = 'EPUB'; // 转换后是EPUB格式
      } else {
        throw new Error('Unsupported file format');
      }

      return { book, format } as { book: BookDoc; format: BookFormat };
    } catch (error) {
      console.error('Failed to parse book:', error);
      throw new Error(`Failed to parse book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }












}

 