import React, { useEffect, useState } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'

interface NumberInputProps {
  className?: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  disabled?: boolean
  onChange: (value: number) => void
}

const NumberInput: React.FC<NumberInputProps> = ({
  className,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty string or valid numbers without leading zeros
    if (inputValue === '' || /^[1-9]\d*\.?\d*$|^0?\.?\d*$/.test(inputValue)) {
      const newValue = inputValue === '' ? 0 : parseFloat(inputValue)
      setLocalValue(newValue)

      if (!isNaN(newValue)) {
        const roundedValue = Math.round(newValue * 10) / 10
        onChange(Math.max(min, Math.min(max, roundedValue)))
      }
    }
  }

  const increment = () => {
    const newValue = Math.min(max, localValue + step)
    const roundedValue = Math.round(newValue * 10) / 10
    setLocalValue(roundedValue)
    onChange(roundedValue)
  }

  const decrement = () => {
    const newValue = Math.max(min, localValue - step)
    const roundedValue = Math.round(newValue * 10) / 10
    setLocalValue(roundedValue)
    onChange(roundedValue)
  }

  const handleOnBlur = () => {
    const newValue = Math.max(min, Math.min(max, localValue))
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <div className={`config-item ${className || ''}`}>
      <span className="text-base-content line-clamp-2">{label}</span>
      <div className="text-base-content flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onBlur={handleOnBlur}
          className="input input-ghost settings-content text-base-content w-16 max-w-xs rounded border-0 bg-transparent py-1 pe-3 ps-1 text-right !outline-none"
          onFocus={(e) => e.target.select()}
          disabled={disabled}
        />
        <button
          onClick={decrement}
          disabled={value <= min || disabled}
          className={`btn btn-circle btn-sm ${value <= min || disabled ? 'btn-disabled !bg-opacity-5' : ''}`}
        >
          <FiMinus className="h-4 w-4" />
        </button>
        <button
          onClick={increment}
          disabled={value >= max || disabled}
          className={`btn btn-circle btn-sm ${value >= max || disabled ? 'btn-disabled !bg-opacity-5' : ''}`}
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default NumberInput 