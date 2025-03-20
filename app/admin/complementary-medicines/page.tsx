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
import { Coffee } from "lucide-react"
import { complementaryMedicineApi, type ComplementaryMedicine } from "@/lib/api-service"

export default function ComplementaryMedicinesPage() {
  const [medicines, setMedicines] = useState<ComplementaryMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch complementary medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true)
        const response = await complementaryMedicineApi.getAll()
        setMedicines(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching complementary medicines:", err)
        setError("Failed to load complementary medicines. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [])

  const handleDelete = (id: string | number) => {
      setDeleteId(id.toString())
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      // In a real implementation, this would call the API
      await complementaryMedicineApi.delete(deleteId)
      setMedicines(medicines.filter((med) => med.compl_med_id.toString() !== deleteId))
      toast({
        title: "Complementary medicine deleted",
        description: "The complementary medicine has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting complementary medicine:", err)
      toast({
        title: "Error",
        description: "Failed to delete complementary medicine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "compl_med_id",
      title: "ID",
    },
    {
      key: "name",
      title: "Name",
    },
    {
      key: "description",
      title: "Description",
      render: (item: ComplementaryMedicine) => (
        <div className="max-w-xs truncate">{item.description || "No description"}</div>
      ),
    },
    {
      key: "created_at",
      title: "Created At",
      render: (item: ComplementaryMedicine) => <div>{new Date(item.created_at).toLocaleDateString()}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading complementary medicines...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-600" />
          Complementary Medicines
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
          <Coffee className="h-6 w-6 text-amber-600" />
          Complementary Medicines
        </h1>
      </div>

      <DataTable
        data={medicines}
        columns={columns}
        primaryKey="compl_med_id"
        basePath="/admin/complementary-medicines"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the complementary medicine and all associated
              data.
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

