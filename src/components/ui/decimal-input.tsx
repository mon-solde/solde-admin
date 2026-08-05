import * as React from 'react'
import { Input } from './input'

type DecimalInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'value' | 'onChange'
> & {
  value: number | null | undefined
  onChange: (value: number) => void
}

// Keeps only digits and a single decimal separator (whichever one — comma
// or period — the user actually typed), so mid-typing input like "240,"
// is never rejected outright.
function sanitizeDecimalString(raw: string): string {
  const cleaned = raw.replace(/[^\d,.]/g, '')
  const separatorIndex = cleaned.search(/[,.]/)
  if (separatorIndex === -1) return cleaned
  const separator = cleaned[separatorIndex]
  const integerPart = cleaned.slice(0, separatorIndex).replace(/[,.]/g, '')
  const fractionPart = cleaned.slice(separatorIndex + 1).replace(/[,.]/g, '')
  return `${integerPart}${separator}${fractionPart}`
}

// Mirrors what a native `type="number"` input already reports for an empty
// value (`valueAsNumber` is NaN) — existing Zod "Requis" validation keeps
// working unchanged. A trailing separator ("240,") parses as the integer
// part rather than NaN, so it's never flagged invalid mid-typing.
function parseDecimalString(value: string): number {
  if (value.trim() === '') return NaN
  return Number(value.replace(',', '.'))
}

function formatForDisplay(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return String(value).replace('.', ',')
}

// A `type="number"` input rejects a typed comma outright (the HTML spec
// only accepts a period), which is exactly what French mobile keyboards
// send — the field goes blank mid-typing. This renders as `type="text"`
// with a decimal-friendly mobile keyboard instead, and only ever reports a
// real number outward via `onChange`.
function DecimalInput({
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}: DecimalInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() =>
    formatForDisplay(value)
  )
  const isFocusedRef = React.useRef(false)
  const lastReportedRef = React.useRef(value ?? NaN)

  React.useEffect(() => {
    if (isFocusedRef.current) return
    const external = value ?? NaN
    // Skip re-syncing when this is just the echo of our own last onChange —
    // otherwise every keystroke would get immediately overwritten on the
    // next render.
    if (Object.is(external, lastReportedRef.current)) return
    setDisplayValue(formatForDisplay(value))
    lastReportedRef.current = external
  }, [value])

  return (
    <Input
      type='text'
      inputMode='decimal'
      value={displayValue}
      onChange={(e) => {
        const sanitized = sanitizeDecimalString(e.target.value)
        setDisplayValue(sanitized)
        const parsed = parseDecimalString(sanitized)
        lastReportedRef.current = parsed
        onChange(parsed)
      }}
      onFocus={(e) => {
        isFocusedRef.current = true
        onFocus?.(e)
      }}
      onBlur={(e) => {
        isFocusedRef.current = false
        onBlur?.(e)
      }}
      {...props}
    />
  )
}

export { DecimalInput }
