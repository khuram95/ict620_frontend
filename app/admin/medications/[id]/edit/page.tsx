"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { medicationApi, type Medication } from "@/lib/api-service"

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medication, setMedication] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        setLoading(true)
        const data = await medicationApi.getById(params.id)
        setMedication(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medication:", err)
        setError("Failed to load medication details. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedication()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await medicationApi.update(params.id, data)

      toast({
        title: "Medication updated",
        description: "The medication has been updated successfully.",
      })

      router.push("/admin/medications")
    } catch (error) {
      console.error("Error updating medication:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the medication.",
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading medication details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Medication</h1>
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

  if (!medication) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Medication Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested medication could not be found.</p>
          <button
            onClick={() => router.push("/admin/medications")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Medications
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={medication}
      isLoading={saving}
      backUrl="/admin/medications"
      title={`Edit Medication: ${medication.name}`}
    />
  )
}

