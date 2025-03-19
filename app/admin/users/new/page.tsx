"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { userApi } from "@/lib/api-service"

export default function NewUserPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await userApi.create(data)

      toast({
        title: "User created",
        description: "The user has been created successfully.",
      })

      router.push("/admin/users")
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Error",
        description: "An error occurred while creating the user.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const formFields = [
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: true,
    },
    {
      name: "full_name",
      label: "Full Name",
      type: "text" as const,
      required: true,
    },
    {
      name: "is_admin",
      label: "Admin User",
      type: "checkbox" as const,
    },
  ]

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={saving}
      backUrl="/admin/users"
      title="Add New User"
    />
  )
}

