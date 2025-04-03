"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { drugDrugInteractionApi } from "@/lib/api-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import MedicationSearchBox from "@/components/ui/medication-search-box"
import AsyncSelect from "react-select/async"

export default function NewDrugDrugInteractionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({
    medication1_id: "",
    medication2_id: "",
    severity: "",
    description: "",
    recommendation: "",
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

    if (!formData.medication1_id) {
      newErrors.medication1_id = "Medication 1 is required"
    }

    if (!formData.medication2_id) {
      newErrors.medication2_id = "Medication 2 is required"
    }

    if (!formData.severity) {
      newErrors.severity = "Severity is required"
    }

    if (!formData.description) {
      newErrors.description = "Description is required"
    }

    if (!formData.recommendation) {
      newErrors.recommendation = "Recommendation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      await drugDrugInteractionApi.create(formData)

      toast({
        title: "Interaction created",
        description: "The interaction has been created successfully.",
      })

      router.push("/admin/drug-drug-interactions")
    } catch (error) {
      console.error("Error creating interaction:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the interaction.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Drug-Drug Interaction</h1>
        <Link href="/admin/drug-drug-interactions" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medication 1 */}
              <div>
                <div className="space-y-2">
                  <MedicationSearchBox
                    name="medication1_id"
                    label="Medication 1"
                    onChange={(selected) => handleChange("medication1_id", selected ? selected.value : "")}
                  />
                  {errors.medication1_id && <p className="text-sm text-red-500">{errors.medication1_id}</p>}
                </div>
              </div>

              {/* Medication 2 */}
              <div>
                <div className="space-y-2">
                  <MedicationSearchBox
                    name="medication2_id"
                    label="Medication 2"
                    onChange={(selected) => handleChange("medication2_id", selected ? selected.value : "")}
                  />
                  {errors.medication2_id && <p className="text-sm text-red-500">{errors.medication2_id}</p>}
                </div>
              </div>

              {/* Severity */}
              <div>
                <div className="space-y-2">
                  <Label htmlFor="severity">
                    Severity <span className="text-red-500">*</span>
                  </Label>
                  <AsyncSelect
                    cacheOptions
                    name="severity"
                    isClearable
                    placeholder="Select severity..."
                    onChange={(selected) => handleChange("severity", selected ? selected.value : "")}
                    loadOptions={async (inputValue) => {
                      const options = [
                        { value: "Major", label: "Major" },
                        { value: "Moderate", label: "Moderate" },
                        { value: "Minor", label: "Minor" },
                      ]

                      if (!inputValue) return options

                      return options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                    }}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        borderColor: errors.severity ? "#ef4444" : state.isFocused ? "#0f766e" : "#e2e8f0",
                        boxShadow: state.isFocused ? "0 0 0 1px #0f766e" : "none",
                        "&:hover": {
                          borderColor: state.isFocused ? "#0f766e" : "#cbd5e1",
                        },
                      }),
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isSelected ? "#0f766e" : state.isFocused ? "#e6fffa" : "white",
                        color: state.isSelected ? "white" : "#1e293b",
                        "&:hover": {
                          backgroundColor: state.isSelected ? "#0f766e" : "#e6fffa",
                        },
                      }),
                    }}
                  />
                  {errors.severity && <p className="text-sm text-red-500">{errors.severity}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation">
                Recommendation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="recommendation"
                value={formData.recommendation}
                onChange={(e) => handleChange("recommendation", e.target.value)}
                className={errors.recommendation ? "border-red-500" : ""}
                rows={4}
              />
              {errors.recommendation && <p className="text-sm text-red-500">{errors.recommendation}</p>}
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

