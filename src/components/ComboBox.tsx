"use client"

import { useState, useRef, useEffect } from "react"

interface ComboBoxProps {
  options: string[]
  placeholder?: string
  value: string
  onChange: (value: string) => void
}

export function ComboBox({ options, placeholder, value, onChange }: ComboBoxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-primary outline-none focus:border-blue-dim"
        autoComplete="off"
      />
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface2 border border-border rounded-md z-50 max-h-40 overflow-y-auto shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-blue-glow hover:text-blue transition-colors"
                onMouseDown={() => {
                  onChange(opt)
                  setQuery(opt)
                  setOpen(false)
                }}
              >
                {opt}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted">
              No match — type a custom value
            </div>
          )}
        </div>
      )}
    </div>
  )
}
