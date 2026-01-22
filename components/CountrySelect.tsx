"use client"

import Select from "react-select"
import countryList from "react-select-country-list"
import { useMemo } from "react"

type Option = {
  label: string
  value: string
}

interface CountrySelectProps {
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
}

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  const options = useMemo(() => countryList().getData(), [])

  const selected = options.find((o) => o.value === value) ?? null

  return (
    <Select
      options={options}
      value={selected}
      onChange={(opt) => onChange((opt as Option).value)}
      isDisabled={disabled}
      placeholder="Seleccioná un país"
      isSearchable
      classNamePrefix="react-select"
      formatOptionLabel={(option: Option) => (
        <div className="flex items-center gap-2">
          <span className={`fi fi-${option.value.toLowerCase()}`} />
          <span>{option.label}</span>
        </div>
      )}
    />
  )
}
