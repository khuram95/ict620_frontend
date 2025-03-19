"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { drugDrugInteractionApi, medicationApi, type DrugDrugInteraction, type Medication } from "@/lib/api-service"

export default function EditDrugDrugInteractionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [interaction, setInteraction] = useState<DrugDrugInteraction | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [interactionData, medsData] = await Promise.all([
          drugDrugInteractionApi.getById(params.id),
          medicationApi.getAll(),
        ])

        setInteraction(interactionData)
        setMedications(medsData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load interaction details. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await drugDrugInteractionApi.update(params.id, data)

      toast({
        title: "Interaction updated",
        description: "The interaction has been updated successfully.",
      })

      router.push("/admin/drug-drug-interactions")
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
    return <div className="flex justify-center items-center h-64">Loading interaction details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Drug-Drug Interaction</h1>
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
          <p>The requested drug-drug interaction could not be found.</p>
          <button
            onClick={() => router.push("/admin/drug-drug-interactions")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Drug-Drug Interactions
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={{
        ...interaction,
        medication1_id: interaction.medication1_id.toString(),
        medication2_id: interaction.medication2_id.toString(),
      }}
      isLoading={saving}
      backUrl="/admin/drug-drug-interactions"
      title="Edit Drug-Drug Interaction"
    />
  )
}

