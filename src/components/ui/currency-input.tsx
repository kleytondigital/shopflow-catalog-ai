
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)

    React.useEffect(() => {
      if (!isFocused) {
        if (value === 0) {
          setDisplayValue("")
        } else {
          setDisplayValue(formatCurrency(value))
        }
      }
    }, [value, isFocused])

    const formatCurrency = (num: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num)
    }

    const parseCurrency = (str: string): number => {
      const cleaned = str.replace(/[^\d,]/g, '')
      if (cleaned.includes(',')) {
        const parts = cleaned.split(',')
        if (parts.length === 2) {
          const integerPart = parts[0]
          const decimalPart = parts[1].substring(0, 2)
          return parseFloat(`${integerPart}.${decimalPart}`) || 0
        }
      }
      return parseFloat(cleaned) || 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setDisplayValue(rawValue)
      
      if (isFocused) {
        const numericValue = parseCurrency(rawValue)
        onChange(numericValue)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      if (value > 0) {
        const numericString = value.toString().replace('.', ',')
        setDisplayValue(numericString)
      } else {
        setDisplayValue("")
      }
      e.target.select()
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      const numericValue = parseCurrency(displayValue)
      onChange(numericValue)
      
      if (numericValue > 0) {
        setDisplayValue(formatCurrency(numericValue))
      } else {
        setDisplayValue("")
      }
      props.onBlur?.(e)
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
          R$
        </span>
        <Input
          className={cn("pl-10", className)}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputMode="decimal"
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
