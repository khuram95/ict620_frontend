"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { foodItemApi, type FoodItem } from "@/lib/api-service"

export default function FoodItemDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        setLoading(true)
        // In a real implementation, this would call the API
        // const data = await foodItemApi.getById(params.id)

        // For now, use mock data
        const response = await foodItemApi.getAll()
        const foodItem = response.data.find((item: FoodItem) => item.food_id.toString() === params.id)

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

  const handleDelete = async () => {
    try {
      await foodItemApi.delete(params.id)

      toast({
        title: "Food item deleted",
        description: "The food item has been deleted successfully.",
      })

      router.push("/admin/food-items")
    } catch (error) {
      console.error("Error deleting food item:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the food item.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading food item details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/food-items" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Food Item Details</h1>
        </div>
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
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/food-items" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Food Item Not Found</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested food item could not be found.</p>
          <Link
            href="/admin/food-items"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Food Items
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/food-items" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{foodItem.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/food-items/${params.id}/edit`} passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{foodItem.description || "No description available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">ID:</span>
                <span>{foodItem.food_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(foodItem.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{foodItem.updated_at ? new Date(foodItem.updated_at).toLocaleString() : "Never"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the food item and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

