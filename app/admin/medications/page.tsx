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
import { Pill } from "lucide-react"
import { medicationApi, type Medication } from "@/lib/api-service"

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch medications
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

  const handleDelete = (id: string | number) => {
    setDeleteId(id.toString())
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await medicationApi.delete(deleteId)
      setMedications(medications.filter((med) => med.medication_id.toString() !== deleteId))
      toast({
        title: "Medication deleted",
        description: "The medication has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting medication:", err)
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "medication_id",
      title: "ID",
    },
    {
      key: "name",
      title: "Name",
    },
    {
      key: "description",
      title: "Description",
      render: (item: Medication) => <div className="max-w-xs truncate">{item.description || "No description"}</div>,
    },
    {
      key: "created_at",
      title: "Created At",
      render: (item: Medication) => <div>{new Date(item.created_at).toLocaleDateString()}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading medications...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Pill className="h-6 w-6 text-teal-600" />
          Medications
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
          <Pill className="h-6 w-6 text-teal-600" />
          Medications
        </h1>
      </div>

      <DataTable
        data={medications}
        columns={columns}
        primaryKey="medication_id"
        basePath="/admin/medications"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication and all associated data.
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

