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
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { drugComplementaryInteractionApi, type DrugComplementaryInteraction } from "@/lib/api-service"

export default function DrugComplementaryInteractionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [interaction, setInteraction] = useState<DrugComplementaryInteraction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchInteraction = async () => {
      try {
        setLoading(true)
        const response = await drugComplementaryInteractionApi.getById(params.id)
        console.log(response.data)
        setInteraction(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching drug-complementary interaction:", err)
        setError("Failed to load drug-complementary interaction details. Please try again later.")
        setLoading(false)
      }
    }

    fetchInteraction()
  }, [params.id])

  const handleDelete = async () => {
    try {
      await drugComplementaryInteractionApi.delete(params.id)

      toast({
        title: "Interaction deleted",
        description: "The interaction has been deleted successfully..",
      })

      router.push("/admin/drug-complementary-interactions")
    } catch (error) {
      console.error("Error deleting interaction:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the interaction.",
        variant: "destructive",
      })
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading interaction details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/drug-complementary-interactions" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Drug-Complementary Interaction Details</h1>
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

  if (!interaction) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/drug-complementary-interactions" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Interaction Not Found</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested drug-complementary interaction could not be found.</p>
          <Link
            href="/admin/drug-complementary-interactions"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Drug-Complementary Interactions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/drug-complementary-interactions" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Drug-Complementary Interaction Details</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/drug-complementary-interactions/${params.id}/edit`} passHref>
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
            <CardTitle>Medication</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{interaction.medication_name || `ID: ${interaction.medication_id}`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complementary Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{interaction.complementary_name || `ID: ${interaction.compl_med_id}`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">{getSeverityBadge(interaction.severity)}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{interaction.description || "No description available"}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{interaction.recommendation || "No recommendation available"}</p>
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
                <span>{interaction.dc_interaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(interaction.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{interaction.updated_at ? new Date(interaction.updated_at).toLocaleString() : "Never"}</span>
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
              This action cannot be undone. This will permanently delete the interaction and all associated data.
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

