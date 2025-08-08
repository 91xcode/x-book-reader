import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

interface DropdownProps {
  children: React.ReactNode
  toggleButton: React.ReactNode
  className?: string
  buttonClassName?: string
  align?: 'left' | 'right' | 'center'
  position?: 'top' | 'bottom'
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  toggleButton,
  className,
  buttonClassName,
  align = 'right',
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const closeDropdown = () => {
    setIsOpen(false)
  }

  return (
    <div className='dropdown-container flex'>
      {/* 全屏遮罩层 - 参考 readest 实现 */}
      {isOpen && (
        <div 
          className='fixed inset-0 bg-transparent' 
          onClick={closeDropdown}
        />
      )}
      <div
        ref={dropdownRef}
        className={clsx('dropdown', className, {
          'dropdown-open': isOpen,
          'dropdown-end': align === 'right',
          'dropdown-top': position === 'top',
          'dropdown-bottom': position === 'bottom'
        })}
      >
        <div
          tabIndex={0}
          role="button"
          className={clsx('dropdown-toggle', buttonClassName, isOpen && 'bg-base-300/50')}
          onClick={toggleDropdown}
        >
          {toggleButton}
        </div>
        {isOpen && (
          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box min-w-48 max-w-64 z-10">
            {children}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Dropdown 