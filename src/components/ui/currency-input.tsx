
import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    const [isFocused, setIsFocused] = React.useState(false)
    
    // Debounce para evitar conflitos
    const debouncedValue = useDebounce(displayValue, 300)

    React.useEffect(() => {
      if (!isFocused) {
        // Quando não está focado, mostrar valor formatado
        if (value === 0) {
          setDisplayValue("")
        } else {
          setDisplayValue(formatCurrency(value))
        }
      }
    }, [value, isFocused])

    React.useEffect(() => {
      if (isFocused && debouncedValue) {
        // Quando focado e há mudança no valor, processar
        const numericValue = parseCurrency(debouncedValue)
        if (numericValue !== value) {
          onChange(numericValue)
        }
      }
    }, [debouncedValue, isFocused, onChange, value])

    const formatCurrency = (num: number): string => {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num)
    }

    const parseCurrency = (str: string): number => {
      // Remove tudo exceto números, vírgulas e pontos
      const cleaned = str.replace(/[^\d,.]/g, '')
      
      // Se tem vírgula, considera como separador decimal
      if (cleaned.includes(',')) {
        const parts = cleaned.split(',')
        if (parts.length === 2) {
          const integerPart = parts[0].replace(/\./g, '') // Remove pontos da parte inteira
          const decimalPart = parts[1].substring(0, 2) // Máximo 2 casas decimais
          return parseFloat(`${integerPart}.${decimalPart}`) || 0
        }
      }
      
      // Se tem apenas ponto, considera como separador de milhares ou decimal
      if (cleaned.includes('.')) {
        const parts = cleaned.split('.')
        if (parts.length === 2 && parts[1].length <= 2) {
          // Provavelmente é decimal
          return parseFloat(cleaned) || 0
        } else {
          // Provavelmente são milhares
          return parseFloat(cleaned.replace(/\./g, '')) || 0
        }
      }
      
      return parseFloat(cleaned) || 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setDisplayValue(rawValue)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      // Quando foca, mostrar apenas números para facilitar edição
      if (value > 0) {
        const numericString = value.toString().replace('.', ',')
        setDisplayValue(numericString)
      }
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      
      // Processar valor final
      const numericValue = parseCurrency(displayValue)
      onChange(numericValue)
      
      // Formatar para exibição
      if (numericValue > 0) {
        setDisplayValue(formatCurrency(numericValue))
      } else {
        setDisplayValue("")
      }
      
      props.onBlur?.(e)
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
          R$
        </span>
        <Input
          className={cn("pl-10", className)}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0,00"
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }
