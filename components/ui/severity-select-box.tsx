"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { X, Search, ChevronDown } from "lucide-react"

export interface OptionType {
  value: string
  label: string
}

interface SeveritySelectBoxProps {
  name: string
  label: string
  defaultValue?: OptionType | null
  onChange: (selected: OptionType | null) => void
}

const SeveritySelectBox: React.FC<SeveritySelectBoxProps> = ({ name, label, defaultValue, onChange }) => {
  const [inputValue, setInputValue] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(defaultValue || null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options: OptionType[] = [
    { value: "Major", label: "Major" },
    { value: "Moderate", label: "Moderate" },
    { value: "Minor", label: "Minor" },
  ]

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // If we had a selection and now we're editing, update the selection
    if (selectedOption && e.target.value !== selectedOption.label) {
      setSelectedOption(null)
      onChange(null)
    }

    setIsOpen(true)
  }

  const handleOptionSelect = (option: OptionType) => {
    setSelectedOption(option)
    setInputValue(option.label)
    onChange(option)
    setIsOpen(false)
  }

  const handleClear = () => {
    setSelectedOption(null)
    setInputValue("")
    onChange(null)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id={name}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Select severity..."
            className="pl-8 pr-16"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center">
            {inputValue && (
              <button type="button" onClick={handleClear} className="mr-2" aria-label="Clear input">
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <button type="button" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle dropdown">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={index}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedOption?.value === option.value ? "bg-teal-50" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeveritySelectBox

