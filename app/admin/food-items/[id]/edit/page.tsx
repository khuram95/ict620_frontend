"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { foodItemApi, type FoodItem } from "@/lib/api-service"

export default function EditFoodItemPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would call the API
        // const data = await foodItemApi.getById(params.id)

        // For now, use mock data
        const allFoodItems = await foodItemApi.getAll()
        const foodItem = allFoodItems.find((item) => item.food_id.toString() === params.id)

        setFoodItem(foodItem || null)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching food item:", err)
        setError("Failed to load food item details. Please try again later.")
        setLoading(false)
      }
    }

    fetchFoodItem()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      // In a real implementation, this would call the API
      // await foodItemApi.update(params.id, data)

      toast({
        title: "Food item updated",
        description: "The food item has been updated successfully.",
      })

      router.push("/admin/food-items")
    } catch (error) {
      console.error("Error updating food item:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the food item.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "name",
      label: "Food Item Name",
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
      name: "notes",
      label: "Additional Notes",
      type: "textarea" as const,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading food item details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Food Item</h1>
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

  if (!foodItem) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Food Item Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested food item could not be found.</p>
          <button
            onClick={() => router.push("/admin/food-items")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Food Items
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={foodItem}
      isLoading={saving}
      backUrl="/admin/food-items"
      title={`Edit Food Item: ${foodItem.name}`}
    />
  )
}

