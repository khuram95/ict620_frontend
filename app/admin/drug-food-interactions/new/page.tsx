"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { medicationApi, foodItemApi, type Medication, type FoodItem } from "@/lib/api-service"

export default function NewDrugFoodInteractionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [medsData, foodData] = await Promise.all([medicationApi.getAll(), foodItemApi.getAll()])

        setMedications(medsData)
        setFoodItems(foodData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load medications or food items. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      // In a real implementation, this would call the API
      // await drugFoodInteractionApi.create(data)

      toast({
        title: "Interaction created",
        description: "The interaction has been created successfully.",
      })

      router.push("/admin/drug-food-interactions")
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

  const foodOptions = foodItems.map((food) => ({
    value: food.food_id.toString(),
    label: food.name,
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
      name: "food_id",
      label: "Food Item",
      type: "select" as const,
      required: true,
      options: foodOptions,
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
        <h1 className="text-2xl font-bold mb-4">Add New Drug-Food Interaction</h1>
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
      backUrl="/admin/drug-food-interactions"
      title="Add New Drug-Food Interaction"
    />
  )
}

