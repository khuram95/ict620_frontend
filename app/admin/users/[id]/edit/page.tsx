"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormBuilder from "@/components/admin/form-builder"
import { toast } from "@/components/ui/use-toast"
import { userApi, type User } from "@/lib/api-service"

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await userApi.getOne(Number(params.id))
        setUser(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching user:", err)
        setError("Failed to load user details. Please try again later.")
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true)

    try {
      await userApi.update(Number(params.id), data)

      toast({
        title: "User updated",
        description: "The user has been updated successfully.",
      })

      router.push("/admin/users")
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the user.",
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

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading user details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit User</h1>
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

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested user could not be found.</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      initialData={user}
      isLoading={saving}
      backUrl="/admin/users"
      title={`Edit User: ${user.full_name || user.email}`}
    />
  )
}

