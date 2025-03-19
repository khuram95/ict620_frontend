"use client"

import { useState, useEffect } from "react"
import DataTable from "@/components/admin/data-table"
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
import { AlertTriangle } from "lucide-react"
import { allergyApi, type Allergy } from "@/lib/api-service"

export default function AllergiesPage() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch allergies
  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        setLoading(true)
        const data = await allergyApi.getAll()
        setAllergies(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching allergies:", err)
        setError("Failed to load allergies. Please try again later.")
        setLoading(false)
      }
    }

    fetchAllergies()
  }, [])

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await allergyApi.delete(deleteId)
      setAllergies(allergies.filter((allergy) => allergy.allergy_id.toString() !== deleteId))
      toast({
        title: "Allergy deleted",
        description: "The allergy has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting allergy:", err)
      toast({
        title: "Error",
        description: "Failed to delete allergy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "allergy_id",
      title: "ID",
    },
    {
      key: "name",
      title: "Name",
    },
    {
      key: "description",
      title: "Description",
      render: (item: Allergy) => <div className="max-w-xs truncate">{item.description || "No description"}</div>,
    },
    {
      key: "created_at",
      title: "Created At",
      render: (item: Allergy) => <div>{new Date(item.created_at).toLocaleDateString()}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading allergies...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Allergies
        </h1>
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          Allergies
        </h1>
      </div>

      <DataTable
        data={allergies}
        columns={columns}
        primaryKey="allergy_id"
        basePath="/admin/allergies"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the allergy and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

