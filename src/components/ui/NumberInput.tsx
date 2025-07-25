import React from 'react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <div className="config-item p-4 flex items-center justify-between">
      <span className="flex-1">{label}</span>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-base-content/70 w-8">{min}</span>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="range range-sm flex-1 w-32" 
        />
        <span className="text-sm text-base-content/70 w-8">{max}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="input input-sm input-bordered w-20 text-center"
        />
      </div>
    </div>
  )
}

export default NumberInput 