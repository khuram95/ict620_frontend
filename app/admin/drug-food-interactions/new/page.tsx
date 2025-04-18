"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { foodItemApi, type FoodItem } from "@/lib/api-service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import MedicationSearchBox from "@/components/ui/medication-search-box"
import FooditemSearchBox from "@/components/ui/fooditem-search-box"
import SeveritySelectBox from "@/components/ui/severity-select-box"
import { drugFoodInteractionApi, type DrugFoodInteraction } from "@/lib/api-service"

export default function NewDrugFoodInteractionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({
    medication_id: "",
    food_id: "",
    severity: "",
    description: "",
    recommendation: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const foodData = await foodItemApi.getAll()

        // Check if foodData has a data property (API response structure)
        const foodItems = foodData.data || foodData
        setFoodItems(foodItems)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching food items:", err)
        setError("Failed to load food items. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.medication_id) {
      newErrors.medication_id = "Medication is required"
    }

    if (!formData.food_id) {
      newErrors.food_id = "Food item is required"
    }

    if (!formData.severity) {
      newErrors.severity = "Severity is required"
    }

    if (!formData.description) {
      newErrors.description = "Description is required"
    }

    if (!formData.recommendation) {
      newErrors.recommendation = "Recommendation is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      // In a real implementation, this would call the API
      await drugFoodInteractionApi.create(formData)

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

  // const foodOptions = foodItems.map((food) => ({
  //   value: food.food_id.toString(),
  //   label: food.name,
  // }))

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add New Drug-Food Interaction</h1>
        <Link href="/admin/drug-food-interactions" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medication */}
              <div>
                <div className="space-y-2">
                  <MedicationSearchBox
                    name="medication_id"
                    label="Medication"
                    onChange={(selected) => handleChange("medication_id", selected ? selected.value : "")}
                  />
                  {errors.medication_id && <p className="text-sm text-red-500">{errors.medication_id}</p>}
                </div>
              </div>

              {/* Food Item */}
              <div>
                <div className="space-y-2">
                  <FooditemSearchBox
                    name="food_id"
                    label="Food Item"
                    onChange={(selected) => handleChange("food_id", selected ? selected.value : "")}
                  />
                  {errors.food_id && <p className="text-sm text-red-500">{errors.food_id}</p>}
                </div>
              </div>

              {/* Severity */}
              <div>
                <div className="space-y-2">
                  <SeveritySelectBox
                    name="severity"
                    label="Severity"
                    onChange={(selected) => handleChange("severity", selected ? selected.value : "")}
                  />
                  {errors.severity && <p className="text-sm text-red-500">{errors.severity}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={4}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* Recommendation */}
            <div className="space-y-2">
              <Label htmlFor="recommendation">
                Recommendation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="recommendation"
                value={formData.recommendation}
                onChange={(e) => handleChange("recommendation", e.target.value)}
                className={errors.recommendation ? "border-red-500" : ""}
                rows={4}
              />
              {errors.recommendation && <p className="text-sm text-red-500">{errors.recommendation}</p>}
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

