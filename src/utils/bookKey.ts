import { uniqueId } from './misc';

/**
 * 🔑 bookKey 统一生成器
 * 
 * 为什么需要集中管理？
 * 1. 确保格式一致性
 * 2. 便于修改和维护
 * 3. 避免重复代码
 * 4. 类型安全
 */

/**
 * 生成书籍的唯一标识符
 * @param bookHash 书籍的哈希值
 * @returns 格式为 ${bookHash}-${uniqueId} 的bookKey
 */
export function generateBookKey(bookHash: string): string {
  if (!bookHash) {
    throw new Error('bookHash cannot be empty');
  }
  
  const key = `${bookHash}-${uniqueId()}`;
  console.log('📖 生成bookKey:', { bookHash, bookKey: key });
  return key;
}

/**
 * 从bookKey中提取书籍哈希
 * @param bookKey 完整的bookKey
 * @returns 书籍哈希值
 */
export function extractBookHash(bookKey: string): string {
  const lastDashIndex = bookKey.lastIndexOf('-');
  if (lastDashIndex === -1) {
    return bookKey; // 如果没有找到连字符，返回整个字符串
  }
  return bookKey.substring(0, lastDashIndex);
}

/**
 * 验证bookKey格式是否正确
 * @param bookKey 要验证的bookKey
 * @returns 是否符合预期格式
 */
export function validateBookKey(bookKey: string): boolean {
  if (!bookKey) return false;
  
  // 格式应该是: hash-uniqueId
  // uniqueId通常是6-8个字符的随机字符串
  const parts = bookKey.split('-');
  if (parts.length < 2) return false;
  
  const uniqueIdPart = parts[parts.length - 1];
  return uniqueIdPart.length >= 6 && uniqueIdPart.length <= 8;
}

/**
 * 比较两个bookKey是否指向同一本书
 * @param bookKey1 第一个bookKey
 * @param bookKey2 第二个bookKey
 * @returns 是否指向同一本书
 */
export function isSameBook(bookKey1: string, bookKey2: string): boolean {
  return extractBookHash(bookKey1) === extractBookHash(bookKey2);
} 