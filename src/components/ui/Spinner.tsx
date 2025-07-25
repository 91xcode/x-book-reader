import React from 'react'
import clsx from 'clsx'

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  loading?: boolean
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className,
  loading = true 
}) => {
  if (!loading) return null

  return (
    <div
      className={clsx(
        'loading loading-spinner',
        {
          'loading-xs': size === 'xs',
          'loading-sm': size === 'sm',
          'loading-md': size === 'md',
          'loading-lg': size === 'lg',
          'loading-xl': size === 'xl',
        },
        className
      )}
    />
  )
}

export default Spinner 