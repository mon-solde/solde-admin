import { useEffect, useState } from 'react'

// Delays reflecting `value` until it stops changing for `delayMs` — use
// this for the value driving a network request (e.g. a search query),
// never for the value bound to the input itself, which must stay instant.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debounced
}
