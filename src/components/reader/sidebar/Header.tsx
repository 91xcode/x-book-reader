import clsx from 'clsx';
import React from 'react';
import { GiBookshelf } from 'react-icons/gi';
import { FiSearch } from 'react-icons/fi';
import { MdOutlineMenu, MdOutlinePushPin, MdPushPin } from 'react-icons/md';
import { MdArrowBackIosNew } from 'react-icons/md';

import Dropdown from '@/components/ui/Dropdown';

const SidebarHeader: React.FC<{
  isPinned: boolean;
  isSearchBarVisible: boolean;
  onGoToLibrary: () => void;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleSearchBar: () => void;
}> = ({ isPinned, isSearchBarVisible, onGoToLibrary, onClose, onTogglePin, onToggleSearchBar }) => {
  return (
    <div className='sidebar-header flex h-11 items-center justify-between pe-2 ps-1.5' dir='ltr'>
      <div className='flex items-center gap-x-8'>
        <button
          onClick={onClose}
          className={'btn btn-ghost btn-circle flex h-6 min-h-6 w-6 hover:bg-transparent sm:hidden'}
        >
          <MdArrowBackIosNew className='w-5 h-5' />
        </button>
        <button
          className='btn btn-ghost hidden h-8 min-h-8 w-8 p-0 sm:flex'
          onClick={onGoToLibrary}
        >
          <GiBookshelf className='fill-base-content' />
        </button>
      </div>
      <div className='flex min-w-24 max-w-32 items-center justify-between sm:w-[70%]'>
        <button
          onClick={onToggleSearchBar}
          className={clsx(
            'btn btn-ghost h-8 min-h-8 w-8 p-0',
            isSearchBarVisible ? 'bg-base-300' : '',
          )}
        >
          <FiSearch className='w-4 h-4 text-base-content' />
        </button>
        <Dropdown
          className='dropdown-bottom flex justify-center'
          buttonClassName='btn btn-ghost h-8 min-h-8 w-8 p-0'
          toggleButton={<MdOutlineMenu className='w-4 h-4 fill-base-content' />}
        >
          <div className='menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52'>
            <li><a>书籍信息</a></li>
            <li><a>导出注释</a></li>
            <li><a>重新加载</a></li>
          </div>
        </Dropdown>
        <div className='right-0 hidden h-8 w-8 items-center justify-center sm:flex'>
          <button
            onClick={onTogglePin}
            className={clsx(
              'sidebar-pin-btn btn btn-ghost h-8 min-h-8 w-8 p-0',
              isPinned ? 'bg-base-300' : 'bg-base-300/65',
            )}
            aria-label={isPinned ? '取消固定' : '固定侧边栏'}
          >
            {isPinned ? (
              <MdPushPin className='w-4 h-4' />
            ) : (
              <MdOutlinePushPin className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidebarHeader; 