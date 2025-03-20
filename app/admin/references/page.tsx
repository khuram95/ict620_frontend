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
import { BookOpen } from "lucide-react"
import { referenceApi, type Reference } from "@/lib/api-service"

export default function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch references
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true)
        const response = await referenceApi.getAll()
        setReferences(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching references:", err)
        setError("Failed to load references. Please try again later.")
        setLoading(false)
      }
    }

    fetchReferences()
  }, [])

  const handleDelete = (id: string | number) => {
    setDeleteId(id.toString())
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await referenceApi.delete(deleteId)
      setReferences(references.filter((ref) => ref.reference_id.toString() !== deleteId))
      toast({
        title: "Reference deleted",
        description: "The reference has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting reference:", err)
      toast({
        title: "Error",
        description: "Failed to delete reference. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "reference_id",
      title: "ID",
    },
    {
      key: "title",
      title: "Title",
      render: (item: Reference) => <div>{item.title || "Untitled"}</div>,
    },
    {
      key: "url",
      title: "URL",
      render: (item: Reference) => (
        <div className="max-w-xs truncate">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {item.url}
            </a>
          ) : (
            "No URL"
          )}
        </div>
      ),
    },
    {
      key: "source_type",
      title: "Source Type",
      render: (item: Reference) => <div>{item.source_type || "Unknown"}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading references...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          References
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
          <BookOpen className="h-6 w-6 text-purple-600" />
          References
        </h1>
      </div>

      <DataTable
        data={references}
        columns={columns}
        primaryKey="reference_id"
        basePath="/admin/references"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reference.
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

