
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuantityInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

const QuantityInput = React.forwardRef<HTMLInputElement, QuantityInputProps>(
  ({ className, value, onChange, min = 0, max, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value > 0 ? value.toString() : "")
      }
    }, [value, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setDisplayValue(rawValue)
      
      if (isFocused) {
        let numericValue = parseInt(rawValue) || 0
        
        if (numericValue < min) numericValue = min
        if (max && numericValue > max) numericValue = max
        
        onChange(numericValue)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      setDisplayValue("")
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      let numericValue = parseInt(displayValue) || 0
      
      if (numericValue < min) numericValue = min
      if (max && numericValue > max) numericValue = max
      
      onChange(numericValue)
      setDisplayValue(numericValue > 0 ? numericValue.toString() : "")
      props.onBlur?.(e)
    }

    return (
      <Input
        className={cn(className)}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputMode="numeric"
        ref={ref}
        {...props}
      />
    )
  }
)
QuantityInput.displayName = "QuantityInput"

export { QuantityInput }
