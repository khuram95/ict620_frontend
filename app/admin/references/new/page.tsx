"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { referenceApi } from "@/lib/api-service"

export default function NewReferencePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await referenceApi.create(data)

      toast({
        title: "Reference created",
        description: "The reference has been created successfully.",
      })

      router.push("/admin/references")
    } catch (error) {
      console.error("Error creating reference:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the reference.",
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

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/references"
      title="Add New Reference"
    />
  )
}

