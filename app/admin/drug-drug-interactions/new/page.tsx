"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { drugDrugInteractionApi, medicationApi, type Medication } from "@/lib/api-service"

export default function NewDrugDrugInteractionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true)
        const response = await medicationApi.getAll()
        setMedications(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medications:", err)
        setError("Failed to load medications. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedications()
  }, [])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await drugDrugInteractionApi.create(data)

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

  const medicationOptions = medications.map((med) => ({
    value: med.medication_id.toString(),
    label: med.name,
  }))

  const formFields = [
    {
      name: "medication1_id",
      label: "Medication 1",
      type: "select" as const,
      required: true,
      options: medicationOptions,
    },
    {
      name: "medication2_id",
      label: "Medication 2",
      type: "select" as const,
      required: true,
      options: medicationOptions,
    },
    {
      name: "severity",
      label: "Severity",
      type: "select" as const,
      required: true,
      options: [
        { value: "Major", label: "Major" },
        { value: "Moderate", label: "Moderate" },
        { value: "Minor", label: "Minor" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      required: true,
    },
    {
      name: "recommendation",
      label: "Recommendation",
      type: "textarea" as const,
      required: true,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading medications...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Add New Drug-Drug Interaction</h1>
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

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/drug-drug-interactions"
      title="Add New Drug-Drug Interaction"
    />
  )
}

