interface StressSliderProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function StressSlider({ value, onChange, disabled }: StressSliderProps) {
  const labels = ['Not at all', 'Extremely']
  
  const getColor = (val: number) => {
    if (val <= 3) return 'bg-green-500'
    if (val <= 6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer
                   disabled:cursor-not-allowed disabled:opacity-50
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-7
                   [&::-webkit-slider-thumb]:h-7
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-ocean-500
                   [&::-webkit-slider-thumb]:shadow-lg
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-moz-range-thumb]:w-7
                   [&::-moz-range-thumb]:h-7
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-ocean-500
                   [&::-moz-range-thumb]:border-0
                   [&::-moz-range-thumb]:shadow-lg
                   [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
      </div>
      
      <div className="text-center">
        <span className={`inline-flex items-center justify-center w-14 h-14 
                        rounded-full text-white text-2xl font-bold ${getColor(value)}`}>
          {value}
        </span>
      </div>
    </div>
  )
}
