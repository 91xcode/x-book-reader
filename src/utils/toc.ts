import { SectionItem, TOCItem } from '@/types/book';

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