"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { medicationApi } from "@/lib/api-service"

export default function NewMedicationPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await medicationApi.create(data)

      toast({
        title: "Medication created",
        description: "The medication has been created successfully.",
      })

      router.push("/admin/medications")
    } catch (error) {
      console.error("Error creating medication:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the medication.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "name",
      label: "Medication Name",
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
      name: "indications",
      label: "Indications",
      type: "textarea" as const,
    },
    {
      name: "counselling",
      label: "Counselling",
      type: "textarea" as const,
    },
    {
      name: "adverse_effect",
      label: "Adverse Effects",
      type: "textarea" as const,
    },
    {
      name: "practice_points",
      label: "Practice Points",
      type: "textarea" as const,
    },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/medications"
      title="Add New Medication"
    />
  )
}

