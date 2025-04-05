"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { drugComplementaryInteractionApi, type DrugComplementaryInteraction } from "@/lib/api-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import MedicationSearchBox from "@/components/ui/medication-search-box"
import ComplementaryMedicineSearchBox from "@/components/ui/complementary-medicine-search-box"
import SeveritySelectBox from "@/components/ui/severity-select-box"

export default function EditDrugComplementaryInteractionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [interaction, setInteraction] = useState<DrugComplementaryInteraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({
    medication_id: "",
    compl_med_id: "",
    severity: "",
    description: "",
    recommendation: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        setLoading(true)
        const data = await drugComplementaryInteractionApi.getById(params.id)
        setInteraction(data)

        // Initialize form data
        setFormData({
          medication_id: data.medication_id.toString(),
          compl_med_id: data.compl_med_id.toString(),
          severity: data.severity || "",
          description: data.description || "",
          recommendation: data.recommendation || "",
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching drug-complementary interaction:", err)
        setError("Failed to load drug-complementary interaction details. Please try again later.")
        setLoading(false)
      }
    }

    fetchInteraction()
  }, [params.id])

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

    if (!formData.medication_id) {
      newErrors.medication_id = "Medication is required"
    }

    if (!formData.compl_med_id) {
      newErrors.compl_med_id = "Complementary medicine is required"
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
      await drugComplementaryInteractionApi.update(params.id, formData)

      toast({
        title: "Interaction updated",
        description: "The interaction has been updated successfully.",
      })

      router.push("/admin/drug-complementary-interactions")
    } catch (error) {
      console.error("Error updating interaction:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the interaction.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading interaction details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Drug-Complementary Interaction</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!interaction) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Interaction Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested drug-complementary interaction could not be found.</p>
          <button
            onClick={() => router.push("/admin/drug-complementary-interactions")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Drug-Complementary Interactions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Drug-Complementary Interaction</h1>
        <Link
          href="/admin/drug-complementary-interactions"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medication */}
              <div>
                <div className="space-y-2">
                  <MedicationSearchBox
                    name="medication_id"
                    label="Medication"
                    // defaultValue={
                    //   interaction.medication_name
                    //     ? { value: formData.medication_id, label: interaction.medication_name }
                    //     : null
                    // }
                    onChange={(selected) => handleChange("medication_id", selected ? selected.value : "")}
                  />
                  {errors.medication_id && <p className="text-sm text-red-500">{errors.medication_id}</p>}
                </div>
              </div>

              {/* Complementary Medicine */}
              <div>
                <div className="space-y-2">
                  <ComplementaryMedicineSearchBox
                    name="compl_med_id"
                    label="Complementary Medicine"
                    // defaultValue={
                    //   interaction.complementary_name
                    //     ? { value: formData.compl_med_id, label: interaction.complementary_name }
                    //     : null
                    // }
                    onChange={(selected) => handleChange("compl_med_id", selected ? selected.value : "")}
                  />
                  {errors.compl_med_id && <p className="text-sm text-red-500">{errors.compl_med_id}</p>}
                </div>
              </div>

              {/* Severity */}
              <div>
                <div className="space-y-2">
                  <SeveritySelectBox
                    name="severity"
                    label="Severity"
                    defaultValue={
                      interaction.severity ? { value: interaction.severity, label: interaction.severity } : null
                    }
                    onChange={(selected) => handleChange("severity", selected ? selected.value : "")}
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

