"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { complementaryMedicineApi } from "@/lib/api-service"

export default function NewComplementaryMedicinePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await complementaryMedicineApi.create(data)

      toast({
        title: "Complementary medicine created",
        description: "The complementary medicine has been created successfully.",
      })

      router.push("/admin/complementary-medicines")
    } catch (error) {
      console.error("Error creating complementary medicine:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the complementary medicine.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "name",
      label: "Complementary Medicine Name",
      type: "text" as const,
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      required: true,
    },
    {
      name: "evidence_level",
      label: "Evidence Level",
      type: "select" as const,
      options: [
        { value: "high", label: "High" },
        { value: "moderate", label: "Moderate" },
        { value: "low", label: "Low" },
        { value: "insufficient", label: "Insufficient" },
      ],
    },
    {
      name: "common_uses",
      label: "Common Uses",
      type: "textarea" as const,
    },
    {
      name: "safety_concerns",
      label: "Safety Concerns",
      type: "textarea" as const,
    },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/complementary-medicines"
      title="Add New Complementary Medicine"
    />
  )
}

