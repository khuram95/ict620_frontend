"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { complementaryMedicineApi, type ComplementaryMedicine } from "@/lib/api-service"

export default function EditComplementaryMedicinePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medicine, setMedicine] = useState<ComplementaryMedicine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchMedicine = async () => {
      try {
        setLoading(true)
        const response = await complementaryMedicineApi.getById(params.id)
        setMedicine(response.data || null)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching complementary medicine:", err)
        setError("Failed to load complementary medicine details. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedicine()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await complementaryMedicineApi.update(params.id, data)

      toast({
        title: "Complementary medicine updated",
        description: "The complementary medicine has been updated successfully.",
      })

      router.push("/admin/complementary-medicines")
    } catch (error) {
      console.error("Error updating complementary medicine:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the complementary medicine.",
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading complementary medicine details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Complementary Medicine</h1>
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

  if (!medicine) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Complementary Medicine Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested complementary medicine could not be found.</p>
          <button
            onClick={() => router.push("/admin/complementary-medicines")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Complementary Medicines
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={medicine}
      isLoading={saving}
      backUrl="/admin/complementary-medicines"
      title={`Edit Complementary Medicine: ${medicine.name}`}
    />
  )
}

