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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
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
        className={clsx('btn', buttonClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {toggleButton}
      </div>
      {isOpen && (
        <ul 
          tabIndex={0} 
          className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          onClick={() => setIsOpen(false)}
        >
          {children}
        </ul>
      )}
    </div>
  )
}

export default Dropdown 