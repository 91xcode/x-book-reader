import clsx from 'clsx';
import React from 'react';
import { FiChevronUp } from 'react-icons/fi';
import { MdCheck } from 'react-icons/md';

interface DropdownProps {
  family?: string;
  selected: string;
  options: { option: string; label?: string }[];
  onSelect: (option: string) => void;
  onGetFontFamily: (option: string, family: string) => string;
}

const FontDropdown: React.FC<DropdownProps> = ({
  family,
  selected,
  options,
  onSelect,
  onGetFontFamily,
}) => {
  const allOptions = [...options];
  const selectedOption = allOptions.find((option) => option.option === selected) ?? allOptions[0]!;

  return (
    <div className='dropdown dropdown-top font-dropdown'>
      <button
        tabIndex={0}
        className='btn btn-sm flex items-center px-[10px] font-normal normal-case sm:px-[20px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        onClick={(e) => e.currentTarget.focus()}
      >
        <div className='flex items-center gap-x-1'>
          <span
            className='text-ellipsis font-medium'
            style={{
              fontFamily: onGetFontFamily(selectedOption.option, family ?? ''),
            }}
          >
            {selectedOption.label || selectedOption.option}
          </span>
          <FiChevronUp size={16} className='text-gray-600 dark:text-gray-400' />
        </div>
      </button>
      <ul
        tabIndex={0}
        className={clsx(
          'dropdown-content no-triangle menu rounded-lg',
          'absolute z-[1] mt-2 shadow-xl border',
          'right-[-32px] w-[50vw] !px-0 sm:right-0 sm:w-52',
          'max-h-60 overflow-y-auto',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600',
          'backdrop-blur-sm',
          'flex flex-col'
        )}
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          minWidth: '200px'
        }}
      >
        {options.map((option) => (
          <li
            key={option.option}
            className={clsx(
              'font-dropdown-item transition-colors duration-150 cursor-pointer',
              'w-full block',
              selected === option.option 
                ? 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            onClick={() => onSelect(option.option)}
            tabIndex={0}
          >
            <div className='flex w-full items-center justify-between px-3 py-2 text-sm min-h-[40px]'>
              <span 
                className={clsx(
                  'flex-1 font-option-text text-left',
                  selected === option.option
                    ? 'text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-gray-900 dark:text-gray-100 font-medium'
                )}
                style={{ fontFamily: onGetFontFamily(option.option, family ?? '') }}
              >
                {option.label || option.option}
              </span>
              <span className='flex items-center justify-center w-4 h-4 ml-2 flex-shrink-0'>
                {selected === option.option && (
                  <MdCheck className='text-blue-600 dark:text-blue-400 drop-shadow-sm' size={16} />
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FontDropdown; 