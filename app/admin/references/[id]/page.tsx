"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash, ExternalLink } from "lucide-react"
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
import { referenceApi, type Reference } from "@/lib/api-service"

export default function ReferenceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [reference, setReference] = useState<Reference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchReference = async () => {
      try {
        setLoading(true)
        const response = await referenceApi.getById(params.id)
        setReference(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching reference:", err)
        setError("Failed to load reference details. Please try again later.")
        setLoading(false)
      }
    }

    fetchReference()
  }, [params.id])

  const handleDelete = async () => {
    try {
      await referenceApi.delete(params.id)

      toast({
        title: "Reference deleted",
        description: "The reference has been deleted successfully.",
      })

      router.push("/admin/references")
    } catch (error) {
      console.error("Error deleting reference:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the reference.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reference details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/references" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Reference Details</h1>
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

  if (!reference) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/references" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Reference Not Found</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested reference could not be found.</p>
          <Link
            href="/admin/references"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to References
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/references" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{reference.title || "Untitled Reference"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/references/${params.id}/edit`} passHref>
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
            <CardTitle>Reference Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Title:</h3>
                <p>{reference.title || "No title provided"}</p>
              </div>
              {reference.url && (
                <div>
                  <h3 className="font-medium">URL:</h3>
                  <a
                    href={reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {reference.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              <div>
                <h3 className="font-medium">Source Type:</h3>
                <Badge>
                  {reference.source_type
                    ? reference.source_type.charAt(0).toUpperCase() + reference.source_type.slice(1)
                    : "Unknown"}
                </Badge>
              </div>
              {reference.authors && (
                <div>
                  <h3 className="font-medium">Authors:</h3>
                  <p>{reference.authors}</p>
                </div>
              )}
              {reference.publication_date && (
                <div>
                  <h3 className="font-medium">Publication Date:</h3>
                  <p>{new Date(reference.publication_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
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
                <span>{reference.reference_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(reference.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{reference.updated_at ? new Date(reference.updated_at).toLocaleString() : "Never"}</span>
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
              This action cannot be undone. This will permanently delete the reference.
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

