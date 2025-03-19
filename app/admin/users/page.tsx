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
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { userApi, type User } from "@/lib/api-service"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await userApi.getAll()
        setUsers(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again later.")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await userApi.delete(deleteId)
      setUsers(users.filter((user) => user.user_id.toString() !== deleteId))
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting user:", err)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "user_id",
      title: "ID",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "full_name",
      title: "Name",
      render: (item: User) => <div>{item.full_name || "No name provided"}</div>,
    },
    {
      key: "is_admin",
      title: "Role",
      render: (item: User) => (
        <Badge className={item.is_admin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
          {item.is_admin ? "Admin" : "User"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      title: "Created At",
      render: (item: User) => <div>{new Date(item.created_at).toLocaleDateString()}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          Users
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
          <Users className="h-6 w-6 text-indigo-600" />
          Users
        </h1>
      </div>

      <DataTable data={users} columns={columns} primaryKey="user_id" basePath="/admin/users" onDelete={handleDelete} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
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

