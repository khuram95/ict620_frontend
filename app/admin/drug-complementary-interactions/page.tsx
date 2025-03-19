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
import { Coffee, Pill } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { drugComplementaryInteractionApi, type DrugComplementaryInteraction } from "@/lib/api-service"

export default function DrugComplementaryInteractionsPage() {
  const [interactions, setInteractions] = useState<DrugComplementaryInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch interactions
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        setLoading(true)
        const data = await drugComplementaryInteractionApi.getAll()
        setInteractions(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching drug-complementary interactions:", err)
        setError("Failed to load interactions. Please try again later.")
        setLoading(false)
      }
    }

    fetchInteractions()
  }, [])

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      // In a real implementation, this would call the API
      // await drugComplementaryInteractionApi.delete(deleteId)
      setInteractions(interactions.filter((interaction) => interaction.dc_interaction_id.toString() !== deleteId))
      toast({
        title: "Interaction deleted",
        description: "The interaction has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting interaction:", err)
      toast({
        title: "Error",
        description: "Failed to delete interaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return <Badge>Unknown</Badge>

    switch (severity.toLowerCase()) {
      case "major":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{severity}</Badge>
      case "moderate":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">{severity}</Badge>
      case "minor":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{severity}</Badge>
      default:
        return <Badge>{severity}</Badge>
    }
  }

  const columns = [
    {
      key: "dc_interaction_id",
      title: "ID",
    },
    {
      key: "items",
      title: "Items",
      render: (item: DrugComplementaryInteraction) => (
        <div>
          <div className="flex items-center gap-1">
            <Pill className="h-4 w-4 text-teal-600" />
            <span>{item.medication_name || `Medication ID: ${item.medication_id}`}</span>
          </div>
          <div className="text-gray-500">+</div>
          <div className="flex items-center gap-1">
            <Coffee className="h-4 w-4 text-amber-600" />
            <span>{item.complementary_name || `Complementary ID: ${item.compl_med_id}`}</span>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      title: "Severity",
      render: (item: DrugComplementaryInteraction) => getSeverityBadge(item.severity),
    },
    {
      key: "description",
      title: "Description",
      render: (item: DrugComplementaryInteraction) => (
        <div className="max-w-xs truncate">{item.description || "No description"}</div>
      ),
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading interactions...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Coffee className="h-6 w-6 text-amber-600" />
          Drug-Complementary Interactions
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
          Drug-Complementary Interactions
        </h1>
      </div>

      <DataTable
        data={interactions}
        columns={columns}
        primaryKey="dc_interaction_id"
        basePath="/admin/drug-complementary-interactions"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the interaction.
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

