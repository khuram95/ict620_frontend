"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { foodItemApi } from "@/lib/api-service"

export default function NewFoodItemPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await foodItemApi.create(data)

      toast({
        title: "Food item created",
        description: "The food item has been created successfully.",
      })

      router.push("/admin/food-items")
    } catch (error) {
      console.error("Error creating food item:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the food item.",
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
    // {
    //   name: "notes",
    //   label: "Additional Notes",
    //   type: "textarea" as const,
    // },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/food-items"
      title="Add New Food Item"
    />
  )
}

