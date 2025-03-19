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
import { Badge } from "@/components/ui/badge"
import { drugDrugInteractionApi, type DrugDrugInteraction } from "@/lib/api-service"

export default function DrugDrugInteractionsPage() {
  const [interactions, setInteractions] = useState<DrugDrugInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch interactions
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        setLoading(true)
        const data = await drugDrugInteractionApi.getAll()
        setInteractions(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching drug-drug interactions:", err)
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
      await drugDrugInteractionApi.delete(deleteId)
      setInteractions(interactions.filter((interaction) => interaction.dd_interaction_id.toString() !== deleteId))
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
      key: "dd_interaction_id",
      title: "ID",
    },
    {
      key: "medications",
      title: "Medications",
      render: (item: DrugDrugInteraction) => (
        <div>
          <div>{item.medication1_name || `Medication ID: ${item.medication1_id}`}</div>
          <div className="text-gray-500">+</div>
          <div>{item.medication2_name || `Medication ID: ${item.medication2_id}`}</div>
        </div>
      ),
    },
    {
      key: "severity",
      title: "Severity",
      render: (item: DrugDrugInteraction) => getSeverityBadge(item.severity),
    },
    {
      key: "description",
      title: "Description",
      render: (item: DrugDrugInteraction) => (
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
          <Pill className="h-6 w-6 text-teal-600" />
          Drug-Drug Interactions
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
          Drug-Drug Interactions
        </h1>
      </div>

      <DataTable
        data={interactions}
        columns={columns}
        primaryKey="dd_interaction_id"
        basePath="/admin/drug-drug-interactions"
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

