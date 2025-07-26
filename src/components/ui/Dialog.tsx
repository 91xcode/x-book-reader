import clsx from 'clsx'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md'

const VELOCITY_THRESHOLD = 0.5
const SNAP_THRESHOLD = 0.2

interface DialogProps {
  id?: string
  isOpen: boolean
  children: ReactNode
  snapHeight?: number
  header?: ReactNode
  title?: string
  className?: string
  bgClassName?: string
  boxClassName?: string
  contentClassName?: string
  onClose: () => void
}

const Dialog: React.FC<DialogProps> = ({
  id,
  isOpen,
  children,
  snapHeight,
  header,
  title,
  className,
  bgClassName,
  boxClassName,
  contentClassName,
  onClose,
}) => {
  const [isFullHeightInMobile, setIsFullHeightInMobile] = useState(!snapHeight)
  const [isRtl] = useState(false) // Simplified for now
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  // 检测设备和方向
  useEffect(() => {
    setIsMounted(true)
    
    const checkViewport = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 640 || window.innerHeight < 640
        const portrait = window.innerWidth < window.innerHeight
        setIsMobile(mobile)
        setIsPortrait(portrait)
        setIsFullHeightInMobile(!snapHeight && mobile)
      }
    }

    checkViewport()
    window.addEventListener('resize', checkViewport)

    return () => {
      window.removeEventListener('resize', checkViewport)
    }
  }, [snapHeight])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // 计算响应式样式类 - 只在客户端应用
  const getResponsiveClasses = () => {
    if (!isMounted) {
      // 服务器端渲染时使用默认样式
      return 'sm:h-[65%] sm:w-1/2 sm:max-w-[600px]'
    }
    
    // 客户端渲染时根据屏幕方向决定样式
    return isPortrait
      ? 'sm:h-[50%] sm:w-3/4'
      : 'sm:h-[65%] sm:w-1/2 sm:max-w-[600px]'
  }

  // 计算移动端内联样式 - 只在客户端应用
  const getMobileInlineStyles = () => {
    if (!isMounted || !isMobile) {
      return {}
    }
    
    return {
      height: snapHeight ? `${snapHeight * 100}%` : '100%',
      bottom: 0
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id={id ?? 'dialog'}
      open={isOpen}
      className={clsx(
        'modal sm:min-w-90 z-50 h-full w-full !items-start !bg-transparent sm:w-full sm:!items-center',
        className,
      )}
      dir={isRtl ? 'rtl' : undefined}
    >
      <div
        className={clsx(
          'overlay fixed inset-0 z-10 bg-black/50 sm:bg-black/20',
          bgClassName,
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'modal-box settings-content absolute z-20 flex flex-col rounded-none rounded-tl-2xl rounded-tr-2xl p-0 sm:rounded-2xl',
          'h-full max-h-full w-full max-w-full',
          getResponsiveClasses(),
          boxClassName,
        )}
        style={getMobileInlineStyles()}
      >
        <div
          className={clsx(
            'drag-handle h-10 max-h-10 min-h-10 w-full cursor-row-resize items-center justify-center',
            'transition-padding-top flex duration-300 ease-out sm:hidden',
          )}
        >
          <div className='bg-base-content/50 h-1 w-10 rounded-full'></div>
        </div>
        <div className='dialog-header bg-base-100 sticky top-1 z-10 flex items-center justify-between px-2 sm:px-4'>
          {header ? (
            header
          ) : (
            <div className='flex h-11 w-full items-center justify-between'>
              <button
                tabIndex={-1}
                onClick={onClose}
                className='btn btn-ghost btn-circle flex h-8 min-h-8 w-8 hover:bg-transparent focus:outline-none sm:hidden'
              >
                {isRtl ? (
                  <MdArrowForwardIos className="w-[22px] h-[22px]" />
                ) : (
                  <MdArrowBackIosNew className="w-[22px] h-[22px]" />
                )}
              </button>
              <div className='z-15 pointer-events-none absolute inset-0 flex h-11 items-center justify-center'>
                <span className='line-clamp-1 text-center font-bold'>{title ?? ''}</span>
              </div>
              <button
                tabIndex={-1}
                onClick={onClose}
                className='bg-base-300/65 btn btn-ghost btn-circle ml-auto hidden h-6 min-h-6 w-6 focus:outline-none sm:flex'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='1em'
                  height='1em'
                  viewBox='0 0 24 24'
                >
                  <path
                    fill='currentColor'
                    d='M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          className={clsx(
            'text-base-content my-2 flex-grow overflow-y-auto px-6 sm:px-[10%]',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-base-300 hover:scrollbar-thumb-base-content/20',
            contentClassName,
          )}
          style={{
            WebkitOverflowScrolling: 'touch', // iOS平滑滚动
            scrollBehavior: 'smooth'
          }}
        >
          {children}
        </div>
      </div>
    </dialog>
  )
}

export default Dialog 