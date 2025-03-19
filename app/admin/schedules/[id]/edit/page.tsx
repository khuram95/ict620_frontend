"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { scheduleApi, type Schedule } from "@/lib/api-service"

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const data = await scheduleApi.getById(params.id)
        setSchedule(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching schedule:", err)
        setError("Failed to load schedule details. Please try again later.")
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await scheduleApi.update(params.id, data)

      toast({
        title: "Schedule updated",
        description: "The schedule has been updated successfully.",
      })

      router.push("/admin/schedules")
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the schedule.",
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading schedule details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Schedule</h1>
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

  if (!schedule) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Schedule Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested schedule could not be found.</p>
          <button
            onClick={() => router.push("/admin/schedules")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Schedules
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={schedule}
      isLoading={saving}
      backUrl="/admin/schedules"
      title={`Edit Schedule: ${schedule.ScheduleName}`}
    />
  )
}

