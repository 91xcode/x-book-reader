import React from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import { TOCItem } from '@/types/book';
import clsx from 'clsx';

interface FlatTOCItem {
  item: TOCItem;
  level: number;
}

interface TOCItemViewProps {
  flatItem: FlatTOCItem;
  isActive: boolean;
  onToggleExpand: (item: TOCItem) => void;
  onItemClick: (item: TOCItem) => void;
}

const TOCItemView: React.FC<TOCItemViewProps> = ({
  flatItem,
  isActive,
  onToggleExpand,
  onItemClick,
}) => {
  const { item, level } = flatItem;
  const hasSubitems = item.subitems && item.subitems.length > 0;
  const isExpanded = hasSubitems;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSubitems) {
      onToggleExpand(item);
    }
  };

  const handleItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onItemClick(item);
  };

  return (
    <div
      className={clsx(
        'toc-item group relative cursor-pointer transition-colors duration-150',
        isActive && 'bg-primary/10 border-r-2 border-primary',
        'hover:bg-base-200',
      )}
      data-href={item.href}
      data-level={level}
      onClick={handleItemClick}
    >
      <div
        className={clsx(
          'flex items-center py-2 px-1 text-sm leading-relaxed',
          level > 0 && 'ml-4',
          level > 1 && 'ml-8',
          level > 2 && 'ml-12',
        )}
        style={{
          paddingLeft: `${level * 16 + 8}px`,
        }}
      >
        {/* 展开/收起按钮 */}
        {hasSubitems ? (
          <button
            className="flex-shrink-0 mr-2 p-0.5 rounded hover:bg-base-300 transition-colors"
            onClick={handleToggleClick}
            aria-label={isExpanded ? '收起' : '展开'}
          >
            {isExpanded ? (
              <MdKeyboardArrowDown className="w-4 h-4 text-base-content/70" />
            ) : (
              <MdKeyboardArrowRight className="w-4 h-4 text-base-content/70" />
            )}
          </button>
        ) : (
          <div className="w-6 h-6 flex-shrink-0" />
        )}

        {/* 标题 */}
        <div
          className={clsx(
            'flex-1 min-w-0',
            isActive ? 'text-primary font-medium' : 'text-base-content/90',
            'group-hover:text-base-content',
          )}
        >
          <div
            className="truncate"
            title={item.label}
            dangerouslySetInnerHTML={{ __html: item.label || '未命名章节' }}
          />
        </div>

        {/* 活动指示器 */}
        {isActive && (
          <div className="flex-shrink-0 ml-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
        )}
      </div>

      {/* 键盘焦点指示器 */}
      <div className="absolute inset-0 pointer-events-none border-2 border-transparent focus-within:border-primary/50 rounded" />
    </div>
  );
};

export default TOCItemView; 