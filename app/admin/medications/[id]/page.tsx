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
import { medicationApi, type Medication } from "@/lib/api-service"

export default function MedicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medication, setMedication] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        setLoading(true)
        const data = await medicationApi.getById(params.id)
        setMedication(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medication:", err)
        setError("Failed to load medication details. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedication()
  }, [params.id])

  const handleDelete = async () => {
    try {
      await medicationApi.delete(params.id)

      toast({
        title: "Medication deleted",
        description: "The medication has been deleted successfully.",
      })

      router.push("/admin/medications")
    } catch (error) {
      console.error("Error deleting medication:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the medication.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading medication details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/medications" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Medication Details</h1>
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

  if (!medication) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin/medications" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Medication Not Found</h1>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested medication could not be found.</p>
          <Link
            href="/admin/medications"
            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Medications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/medications" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{medication.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/medications/${params.id}/edit`} passHref>
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
            <p>{medication.description || "No description available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{medication.indications || "No indications available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Counselling</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{medication.counselling || "No counselling information available"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adverse Effects</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{medication.adverse_effect || "No adverse effects information available"}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Practice Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{medication.practice_points || "No practice points available"}</p>
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
                <span>{medication.medication_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span>{new Date(medication.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span>{medication.updated_at ? new Date(medication.updated_at).toLocaleString() : "Never"}</span>
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
              This action cannot be undone. This will permanently delete the medication and all associated data.
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

