"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { referenceApi, type Reference } from "@/lib/api-service"

export default function EditReferencePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [reference, setReference] = useState<Reference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await referenceApi.update(params.id, data)

      toast({
        title: "Reference updated",
        description: "The reference has been updated successfully.",
      })

      router.push("/admin/references")
    } catch (error) {
      console.error("Error updating reference:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the reference.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "title",
      label: "Title",
      type: "text" as const,
      required: true,
    },
    {
      name: "url",
      label: "URL",
      type: "text" as const,
    },
    {
      name: "source_type",
      label: "Source Type",
      type: "select" as const,
      options: [
        { value: "journal", label: "Journal" },
        { value: "book", label: "Book" },
        { value: "website", label: "Website" },
        { value: "database", label: "Database" },
      ],
    },
    {
      name: "medication_id",
      label: "Associated Medication *",
      type: "medication_typesense" as const,
      required: true,
    },
    // {
    //   name: "authors",
    //   label: "Authors",
    //   type: "text" as const,
    // },
    // {
    //   name: "publication_date",
    //   label: "Publication Date",
    //   type: "date" as const,
    // },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading reference details...</div>
  }

  console.log("reference", reference)
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Reference</h1>
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
        <h1 className="text-2xl font-bold mb-4">Reference Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested reference could not be found.</p>
          <button
            onClick={() => router.push("/admin/references")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to References
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={reference}
      isLoading={saving}
      backUrl="/admin/references"
      title={`Edit Reference: ${reference.title || "Untitled"}`}
    />
  )
}

