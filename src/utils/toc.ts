import { BookDoc, TOCItem } from '@/types/book';

export const findParentPath = (toc: TOCItem[], href: string): TOCItem[] => {
  for (const item of toc) {
    if (item.href === href) {
      return [item];
    }
    if (item.subitems) {
      const path = findParentPath(item.subitems, href);
      if (path.length) {
        return [item, ...path];
      }
    }
  }
  return [];
};

export const findTocItemBS = (toc: TOCItem[], cfi: string): TOCItem | null => {
  let left = 0;
  let right = toc.length - 1;
  let result: TOCItem | null = null;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const currentCfi = toc[mid]!.cfi || '';
    // For now, simple string comparison - can be enhanced with CFI.compare if needed
    const comparison = currentCfi.localeCompare(cfi);
    if (comparison === 0) {
      return toc[mid]!;
    } else if (comparison < 0) {
      result = toc[mid]!;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
};

/**
 * Update table of contents for a book document
 * @param bookDoc - The book document
 * @param sortedTOC - Whether to sort the TOC
 */
export const updateToc = (bookDoc: BookDoc, sortedTOC = false) => {
  if (!bookDoc?.toc) return;

  try {
    // If sorting is requested, sort the TOC items
    if (sortedTOC && Array.isArray(bookDoc.toc)) {
      const sortTocRecursively = (items: TOCItem[]): TOCItem[] => {
        return items
          .sort((a, b) => {
            // Sort by title if available
            const titleA = a.label || a.href || '';
            const titleB = b.label || b.href || '';
            return titleA.localeCompare(titleB);
          })
          .map(item => ({
            ...item,
            subitems: item.subitems ? sortTocRecursively(item.subitems) : undefined,
          }));
      };

      bookDoc.toc = sortTocRecursively(bookDoc.toc);
    }

    // Additional TOC processing can be added here
    // For example: filtering, validation, etc.
    
    console.log('TOC updated successfully', {
      sorted: sortedTOC,
      itemCount: Array.isArray(bookDoc.toc) ? bookDoc.toc.length : 0,
    });
  } catch (error) {
    console.error('Failed to update TOC:', error);
  }
}; 