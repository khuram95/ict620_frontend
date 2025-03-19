"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { allergyApi } from "@/lib/api-service"

export default function NewAllergyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await allergyApi.create(data)

      toast({
        title: "Allergy created",
        description: "The allergy has been created successfully.",
      })

      router.push("/admin/allergies")
    } catch (error) {
      console.error("Error creating allergy:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the allergy.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "name",
      label: "Allergy Name",
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
      name: "severity",
      label: "Severity",
      type: "select" as const,
      options: [
        { value: "mild", label: "Mild" },
        { value: "moderate", label: "Moderate" },
        { value: "severe", label: "Severe" },
      ],
    },
    {
      name: "symptoms",
      label: "Common Symptoms",
      type: "textarea" as const,
    },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/allergies"
      title="Add New Allergy"
    />
  )
}

