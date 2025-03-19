"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { scheduleApi } from "@/lib/api-service"

export default function NewSchedulePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await scheduleApi.create(data)

      toast({
        title: "Schedule created",
        description: "The schedule has been created successfully.",
      })

      router.push("/admin/schedules")
    } catch (error) {
      console.error("Error creating schedule:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the schedule.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "ScheduleName",
      label: "Schedule Name",
      type: "text" as const,
      required: true,
    },
    {
      name: "Description",
      label: "Description",
      type: "textarea" as const,
      required: true,
    },
    {
      name: "Frequency",
      label: "Frequency",
      type: "select" as const,
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "as_needed", label: "As Needed" },
      ],
    },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/schedules"
      title="Add New Schedule"
    />
  )
}

