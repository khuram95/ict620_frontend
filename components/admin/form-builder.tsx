"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import MedicationSearchBox from "@/components/ui/medication-search-box"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

type FieldType = "text" | "textarea" | "number" | "select" | "checkbox" | "date" | "email" | "password" | "custom" | "medication_typesense"

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select fields
  defaultValue?: any;
  disabled?: boolean;
  rows?: number; // For textarea

  // For "custom" fields:
  render?: (fieldProps: {
    value: any;
    onChange: (val: any) => void;
    error?: string;
    isLoading?: boolean;
  }) => React.ReactNode;
}

interface FormBuilderProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  initialData?: Record<string, any>
  isLoading?: boolean
  backUrl: string
  title: string
}

export default function FormBuilder({
  fields,
  onSubmit,
  initialData = {},
  isLoading = false,
  backUrl,
  title,
}: FormBuilderProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize form data with initial data or default values
    const data: Record<string, any> = {}
    fields.forEach((field) => {
      data[field.name] =
        initialData[field.name] !== undefined
          ? initialData[field.name]
          : field.defaultValue !== undefined
            ? field.defaultValue
            : field.type === "checkbox"
              ? false
              : ""
    })
    return data
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name]
        if (
          value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "") ||
          (field.type === "select" && value === "")
        ) {
          newErrors[field.name] = `${field.label} is required`
        }
      }

      // Add more validation as needed (email format, etc.)
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid email address"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const renderField = (field: FormField) => {
    const { name, label, type, required, placeholder, options, disabled, rows,render  } = field
    const value = formData[name]
    const error = errors[name]

    switch (type) {
      case "custom":
        // If a custom render function was provided, call it here.
      // Pass it the current value, onChange, and any relevant props.
      return render ? (
        <div className="space-y-2">
          <Label htmlFor={name}>
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          {render({
            value,
            onChange: (val) => handleChange(name, val),
            error,
            isLoading,
          })}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : null
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "textarea":
        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={name}
              name={name}
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={error ? "border-red-500" : ""}
              rows={rows || 4}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleChange(name, val)} disabled={disabled || isLoading}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        )

        case "medication_typesense":
          return (
            <div className="space-y-2">
              <MedicationSearchBox
                name="medication_id"
                label="Associated Medication *"
                defaultValue={ {value: initialData["medication_id"], label: initialData["medication_name"]} }
                onChange={(selected) => handleChange("medication_id", selected ? selected.value : "")}
              />
            {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )

      case "checkbox":
        return (
          <div className="flex items-start space-x-2">
            <Checkbox
              id={name}
              checked={value}
              onCheckedChange={(checked) => handleChange(name, checked)}
              disabled={disabled || isLoading}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link href={backUrl} className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
                disabled={isLoading}
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

