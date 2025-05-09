"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { allergyApi, type Allergy } from "@/lib/api-service"

export default function EditAllergyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [allergy, setAllergy] = useState<Allergy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchAllergy = async () => {
      try {
        setLoading(true)
        const response = await allergyApi.getById(params.id)
        setAllergy(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching allergy:", err)
        setError("Failed to load allergy details. Please try again later.")
        setLoading(false)
      }
    }

    fetchAllergy()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await allergyApi.update(params.id, data)

      toast({
        title: "Allergy updated",
        description: "The allergy has been updated successfully.",
      })

      router.push("/admin/allergies")
    } catch (error) {
      console.error("Error updating allergy:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the allergy.",
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading allergy details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Allergy</h1>
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

  if (!allergy) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Allergy Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested allergy could not be found.</p>
          <button
            onClick={() => router.push("/admin/allergies")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Allergies
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={allergy}
      isLoading={saving}
      backUrl="/admin/allergies"
      title={`Edit Allergy: ${allergy.name}`}
    />
  )
}

