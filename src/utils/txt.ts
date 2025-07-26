import { getBaseFilename } from './book';

interface Metadata {
  bookTitle: string;
  author: string;
  language: string;
  identifier: string;
}

interface Chapter {
  title: string;
  content: string;
}

interface Txt2EpubOptions {
  file: File;
  author?: string;
  language?: string;
}

interface ExtractChapterOptions {
  linesBetweenSegments: number;
  paragraphsPerChapter?: number;
}

interface ConversionResult {
  file: File;
  bookTitle: string;
  chapterCount: number;
  language: string;
}

const zipWriteOptions = {
  lastAccessDate: new Date(0),
  lastModDate: new Date(0),
};

const escapeXml = (str: string) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// 简化的MD5计算函数
const partialMD5 = async (file: File): Promise<string> => {
  const chunk = file.slice(0, Math.min(1024 * 1024, file.size)); // 1MB或文件大小
  const buffer = await chunk.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
};

export class TxtToEpubConverter {
  public async convert(options: Txt2EpubOptions): Promise<ConversionResult> {
    const { file: txtFile, author: providedAuthor, language: providedLanguage } = options;

    const fileContent = await txtFile.arrayBuffer();
    const detectedEncoding = this.detectEncoding(fileContent) || 'utf-8';
    const decoder = new TextDecoder(detectedEncoding);
    const txtContent = decoder.decode(fileContent).trim();

    const bookTitle = this.extractBookTitle(getBaseFilename(txtFile.name));
    const fileName = `${bookTitle}.epub`;

    const fileHeader = txtContent.slice(0, 1024);
    const authorMatch =
      fileHeader.match(/[【\[]?作者[】\]]?[:：\s]\s*(.+)\r?\n/) ||
      fileHeader.match(/[【\[]?\s*(.+)\s+著\s*[】\]]?\r?\n/);
    const author = authorMatch ? authorMatch[1]!.trim() : providedAuthor || '';
    const language = providedLanguage || this.detectLanguage(fileHeader);
    const identifier = await partialMD5(txtFile);
    const metadata = { bookTitle, author, language, identifier };

    let chapters: Chapter[] = [];
    for (let i = 4; i >= 3; i--) {
      chapters = this.extractChapters(txtContent, metadata, {
        linesBetweenSegments: i,
      });

      if (chapters.length === 0) {
        throw new Error('No chapters detected.');
      } else if (chapters.length > 1) {
        break;
      }
    }
    if (chapters.length === 1) {
      chapters = this.extractChapters(txtContent, metadata, {
        linesBetweenSegments: 4,
        paragraphsPerChapter: 100,
      });
    }

    const blob = await this.createEpub(chapters, metadata);
    return {
      file: new File([blob], fileName),
      bookTitle,
      chapterCount: chapters.length,
      language,
    };
  }

  private extractChapters(
    txtContent: string,
    metadata: Metadata,
    option: ExtractChapterOptions,
  ): Chapter[] {
    const { language } = metadata;
    const { linesBetweenSegments, paragraphsPerChapter } = option;
    const segmentRegex = new RegExp(`(?:\\r?\\n){${linesBetweenSegments},}|-{8,}\r?\n`);
    let chapterRegex: RegExp;
    if (language === 'zh') {
      chapterRegex = new RegExp(
        String.raw`(?:^|\n|\s)` +
          '(' +
          [
            String.raw`第[零〇一二三四五六七八九十0-9][零〇一二三四五六七八九十百千万0-9]*(?:[章卷节回讲篇封])(?:[：:、 　\(\)0-9]*[^\n-]{0,24})(?!\S)`,
            String.raw`(?:^|\n|\s|《[^》]+》)[一二三四五六七八九十][零〇一二三四五六七八九十百千万]*(?:[：: 　][^\n-]{0,24})(?!\S)`,
            String.raw`(?:楔子|前言|引言|序言|序章|总论|概论)(?:[：: 　][^\n-]{0,24})?(?!\S)`,
          ].join('|') +
          ')',
        'gu',
      );
      } else {
      chapterRegex =
        /(?:^|\n|\s)(?:(Chapter|Part)\s+(\d+|[IVXLCDM]+)(?:[:.\-–—]?\s+[^\n]*)?|(?:Prologue|Epilogue|Introduction|Foreword)(?:[:.\-–—]?\s+[^\n]*)?)(?=\s|$)/gi;
    }

    const formatSegment = (segment: string): string => {
      segment = escapeXml(segment);
      return segment
        .replace(/-{8,}|_{8,}/g, '\n')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line)
        .join('</p><p>');
    };

    const joinAroundUndefined = (arr: (string | undefined)[]) =>
      arr.reduce<string[]>((acc, curr, i, src) => {
        if (
          curr === undefined &&
          i > 0 &&
          i < src.length - 1 &&
          src[i - 1] !== undefined &&
          src[i + 1] !== undefined
        ) {
          acc[acc.length - 1] += src[i + 1]!;
          return acc;
        }
        if (curr !== undefined && (i === 0 || src[i - 1] !== undefined)) {
          acc.push(curr);
        }
        return acc;
      }, []);

    const chapters: Chapter[] = [];
    const segments = txtContent.split(segmentRegex);
    for (const segment of segments) {
      const trimmedSegment = segment.replace(/<!--.*?-->/g, '').trim();
      if (!trimmedSegment) continue;

      if (paragraphsPerChapter && paragraphsPerChapter > 0) {
        const paragraphs = trimmedSegment.split(/\n+/);
        const totalParagraphs = paragraphs.length;
        for (let i = 0; i < totalParagraphs; i += paragraphsPerChapter) {
          const chunks = paragraphs.slice(i, i + paragraphsPerChapter);
          const formattedSegment = formatSegment(chunks.join('\n'));
          const title = `${chapters.length + 1}`;
          const content = `<h2>${title}</h2><p>${formattedSegment}</p>`;
          chapters.push({ title, content });
        }
        continue;
      }

      const segmentChapters = [];
      const matches = joinAroundUndefined(trimmedSegment.split(chapterRegex));
      for (let j = 1; j < matches.length; j += 2) {
        const title = matches[j]?.trim() || '';
        const content = matches[j + 1]?.trim() || '';

        let isVolume = false;
        if (language === 'zh') {
          isVolume = /第[零〇一二三四五六七八九十百千万0-9]+卷/.test(title);
        } else {
          isVolume = /\b(Part|Volume|Book)\b/i.test(title);
        }

        const headTitle = isVolume ? `<h1>${title}</h1>` : `<h2>${title}</h2>`;
        const formattedSegment = formatSegment(content);
        segmentChapters.push({
          title: escapeXml(title),
          content: `${headTitle}<p>${formattedSegment}</p>`,
        });
      }

      if (matches[0] && matches[0].trim()) {
        const initialContent = matches[0].trim();
        const firstLine = initialContent.split('\n')[0]!.trim();
        const segmentTitle =
          (firstLine.length > 16 ? initialContent.split(/[\n\s\p{P}]/u)[0]!.trim() : firstLine) ||
          initialContent.slice(0, 16);
        const formattedSegment = formatSegment(initialContent);
        segmentChapters.unshift({
          title: escapeXml(segmentTitle),
          content: `<h3></h3><p>${formattedSegment}</p>`,
        });
      }
      chapters.push(...segmentChapters);
    }

    return chapters;
  }

  private async createEpub(chapters: Chapter[], metadata: Metadata): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const { bookTitle, author, language, identifier } = metadata;

    const zip = new JSZip();
    
    // Add mimetype
    zip.file('mimetype', 'application/epub+zip');

    // Add META-INF/container.xml
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

    zip.file('META-INF/container.xml', containerXml);

    // Create navigation points for TOC
    const navPoints = chapters
      .map((chapter, index) => {
        const id = `chapter${index + 1}`;
        const playOrder = index + 1;
        return `
        <navPoint id="navPoint-${id}" playOrder="${playOrder}">
      <navLabel>
            <text>${chapter.title}</text>
      </navLabel>
          <content src="./OEBPS/${id}.xhtml" />
        </navPoint>`;
      })
      .join('\n');

    // Add NCX file (table of contents)
    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="book-id" />
    <meta name="dtb:depth" content="1" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle>
    <text>${escapeXml(bookTitle)}</text>
  </docTitle>
  <docAuthor>
    <text>${escapeXml(author)}</text>
  </docAuthor>
  <navMap>
    ${navPoints}
  </navMap>
</ncx>`;

    zip.file('toc.ncx', tocNcx);

    // Create manifest and spine items
    const manifest = chapters
      .map(
        (_, index) => `
      <item id="chap${index + 1}" href="OEBPS/chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`,
      )
      .join('\n');

    const spine = chapters
      .map(
        (_, index) => `
      <itemref idref="chap${index + 1}"/>`,
      )
      .join('\n');

    // Add CSS stylesheet
    const css = `
      body { line-height: 1.6; font-size: 1em; font-family: 'Arial', sans-serif; text-align: justify; }
      p { text-indent: 2em; margin: 0; }
    `;

    zip.file('style.css', css);

    // Add chapter files
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i]!;
      const chapterContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh">
<head>
    <title>${chapter.title}</title>
    <link rel="stylesheet" type="text/css" href="../style.css"/>
</head>
  <body>${chapter.content}</body>
</html>`;

      zip.file(`OEBPS/chapter${i + 1}.xhtml`, chapterContent);
    }

    const tocManifest = `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`;

    // Add content.opf file
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:language>${language}</dc:language>
    <dc:creator>${escapeXml(author)}</dc:creator>
    <dc:identifier id="book-id">${identifier}</dc:identifier>
  </metadata>
  <manifest>
    ${manifest}
    ${tocManifest}
  </manifest>
  <spine toc="ncx">
    ${spine}
  </spine>
</package>`;

    zip.file('content.opf', contentOpf);

    return await zip.generateAsync({ type: 'blob' });
  }

  private detectEncoding(buffer: ArrayBuffer): string | undefined {
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      return 'utf-8';
    } catch {
      // If UTF-8 decoding fails, try to detect other encodings
    }

    const headerBytes = new Uint8Array(buffer.slice(0, 4));

    if (headerBytes[0] === 0xff && headerBytes[1] === 0xfe) {
      return 'utf-16le';
    }

    if (headerBytes[0] === 0xfe && headerBytes[1] === 0xff) {
      return 'utf-16be';
    }

    if (headerBytes[0] === 0xef && headerBytes[1] === 0xbb && headerBytes[2] === 0xbf) {
      return 'utf-8';
    }

    // Analyze a sample of the content to guess between common East Asian encodings
    const sample = new Uint8Array(buffer.slice(0, Math.min(1024, buffer.byteLength)));
    let highByteCount = 0;

    for (let i = 0; i < sample.length; i++) {
      if (sample[i]! >= 0x80) {
        highByteCount++;
      }
    }

    const highByteRatio = highByteCount / sample.length;
    if (highByteRatio > 0.3) {
      return 'gbk';
    }

    return 'utf-8';
  }

  private detectLanguage(fileHeader: string): string {
    const sample = fileHeader;
    let chineseCount = 0;
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i);
      if (
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0x3400 && code <= 0x4dbf) ||
        (code >= 0x20000 && code <= 0x2a6df)
      ) {
        chineseCount++;
      }
    }
    if (chineseCount / sample.length > 0.05) {
      return 'zh';
    }

    return 'en';
  }

  private extractBookTitle(filename: string): string {
    const match = filename.match(/《([^》]+)》/);
    return match ? match[1]! : filename.split('.')[0]!;
  }
} 