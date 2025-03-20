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
import { Calendar } from "lucide-react"
import { scheduleApi, type Schedule } from "@/lib/api-service"

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)

        const response = await scheduleApi.getAll()
        setSchedules(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching schedules:", err)
        setError("Failed to load schedules. Please try again later.")
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [])

  const handleDelete = (id: string | number) => {
      setDeleteId(id.toString())
    }

  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await scheduleApi.delete(deleteId)
      setSchedules(schedules.filter((schedule) => schedule.ScheduleID.toString() !== deleteId))
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting schedule:", err)
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const columns = [
    {
      key: "ScheduleID",
      title: "ID",
    },
    {
      key: "ScheduleName",
      title: "Name",
    },
    {
      key: "Description",
      title: "Description",
      render: (item: Schedule) => <div className="max-w-xs truncate">{item.Description || "No description"}</div>,
    },
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading schedules...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          Schedules
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
          <Calendar className="h-6 w-6 text-blue-600" />
          Schedules
        </h1>
      </div>

      <DataTable
        data={schedules}
        columns={columns}
        primaryKey="ScheduleID"
        basePath="/admin/schedules"
        onDelete={handleDelete}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule and all associated data.
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

