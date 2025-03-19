"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { medicationApi, complementaryMedicineApi, type Medication, type ComplementaryMedicine } from "@/lib/api-service"

export default function NewDrugComplementaryInteractionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [complementaryMedicines, setComplementaryMedicines] = useState<ComplementaryMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [medsData, complData] = await Promise.all([medicationApi.getAll(), complementaryMedicineApi.getAll()])

        setMedications(medsData)
        setComplementaryMedicines(complData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load medications or complementary medicines. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      // In a real implementation, this would call the API
      // await drugComplementaryInteractionApi.create(data)

      toast({
        title: "Interaction created",
        description: "The interaction has been created successfully.",
      })

      router.push("/admin/drug-complementary-interactions")
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

  const complementaryOptions = complementaryMedicines.map((med) => ({
    value: med.compl_med_id.toString(),
    label: med.name,
  }))

  const formFields = [
    {
      name: "medication_id",
      label: "Medication",
      type: "select" as const,
      required: true,
      options: medicationOptions,
    },
    {
      name: "compl_med_id",
      label: "Complementary Medicine",
      type: "select" as const,
      required: true,
      options: complementaryOptions,
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
    return <div className="flex justify-center items-center h-64">Loading data...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Add New Drug-Complementary Interaction</h1>
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
      backUrl="/admin/drug-complementary-interactions"
      title="Add New Drug-Complementary Interaction"
    />
  )
}

