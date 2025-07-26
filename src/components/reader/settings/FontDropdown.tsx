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
    <div className='dropdown dropdown-top'>
      <button
        tabIndex={0}
        className='btn btn-sm flex items-center px-[10px] font-normal normal-case sm:px-[20px]'
        onClick={(e) => e.currentTarget.focus()}
      >
        <div className='flex items-center gap-x-1'>
          <span
            className='text-ellipsis'
            style={{
              fontFamily: onGetFontFamily(selectedOption.option, family ?? ''),
            }}
          >
            {selectedOption.label || selectedOption.option}
          </span>
          <FiChevronUp size={16} />
        </div>
      </button>
      <ul
        tabIndex={0}
        className='dropdown-content bgcolor-base-200 no-triangle menu rounded-box absolute z-[1] mt-4 shadow right-[-32px] w-[46vw] !px-0 sm:right-0 sm:w-44'
      >
        {options.map((option) => (
          <li
            key={option.option}
            className='px-1 sm:px-2'
            onClick={() => onSelect(option.option)}
          >
            <div className='flex w-full items-center overflow-hidden !px-0 text-sm'>
              <span style={{ minWidth: '16px' }}>
                {selected === option.option && (
                  <MdCheck className='text-base-content' size={16} />
                )}
              </span>
              <span style={{ fontFamily: onGetFontFamily(option.option, family ?? '') }}>
                {option.label || option.option}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FontDropdown; 