"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pill, Coffee, AlertTriangle, Users, BookOpen, Calendar, ServerOff } from "lucide-react"
import Link from "next/link"
import {  dashboardApi  } from "@/lib/api-service"

// Define types for our stats
interface DashboardStats {
  medications: number
  allergies: number
  foodItems: number
  references: number
  schedules: number
  users: number
  complementaryMedicines: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    medications: 0,
    allergies: 0,
    foodItems: 0,
    references: 0,
    schedules: 0,
    users: 0,
    complementaryMedicines: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await dashboardApi.getAll()

        // Fetch counts from all endpoints
        // const [medications, allergies, foodItems, references, schedules, users, complementaryMedicines] =
        //   await Promise.all([
        //     medicationApi.getAll().catch((err) => {
        //       console.error("Error fetching medications:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //     allergyApi.getAll().catch((err) => {
        //       console.error("Error fetching allergies:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //     foodItemApi.getAll().catch((err) => {
        //       console.error("Error fetching food items:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //     referenceApi.getAll().catch((err) => {
        //       console.error("Error fetching references:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //     scheduleApi.getAll().catch((err) => {
        //       console.error("Error fetching schedules:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //     userApi.getAll().catch((err) => {
        //       console.error("Error fetching users:", err)
        //       setUsingMockData(false)
        //       return []
        //     }),
        //     complementaryMedicineApi.getAll().catch((err) => {
        //       console.error("Error fetching complementary medicines:", err)
        //       setUsingMockData(true)
        //       return []
        //     }),
        //   ])
        console.log(response.data)
        setStats({
          medications: response.data.medications,
          allergies: response.data.allergies,
          foodItems: response.data.food_items,
          references: response.data.references,
          schedules: response.data.schedules,
          users: response.data.users,
          complementaryMedicines: response.data.complementary_medicines
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard statistics. Using mock data instead.")
        setUsingMockData(true)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Medications",
      value: stats.medications.toString(),
      description: "Total medications",
      icon: <Pill className="h-8 w-8 text-teal-600" />,
      href: "/admin/medications",
    },
    {
      title: "Complementary Medicines",
      value: stats.complementaryMedicines.toString(),
      description: "Total complementary medicines",
      icon: <Coffee className="h-8 w-8 text-amber-600" />,
      href: "/admin/complementary-medicines",
    },
    {
      title: "Allergies",
      value: stats.allergies.toString(),
      description: "Total allergies",
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      href: "/admin/allergies",
    },
    {
      title: "Food Items",
      value: stats.foodItems.toString(),
      description: "Total food items",
      icon: <Coffee className="h-8 w-8 text-green-600" />,
      href: "/admin/food-items",
    },
    {
      title: "References",
      value: stats.references.toString(),
      description: "Total references",
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      href: "/admin/references",
    },
    {
      title: "Schedules",
      value: stats.schedules.toString(),
      description: "Medication schedules",
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      href: "/admin/schedules",
    },
    {
      title: "Users",
      value: stats.users.toString(),
      description: "Registered users",
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      href: "/admin/users",
    },
  ]

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {usingMockData && (
        <Card className="mb-6 bg-amber-50 border-amber-200">
          <CardContent className="p-6 flex items-start gap-4">
            <ServerOff className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-amber-700 mb-2">API Connection Issue</h2>
              <p className="text-amber-600 mb-2">
                Could not connect to the backend API server at{" "}
                <code className="bg-amber-100 px-1 py-0.5 rounded">http://127.0.0.1:5000</code>. Using mock data
                instead.
              </p>
              <p className="text-amber-600 text-sm">
                To fix this issue:
                <ul className="list-disc ml-5 mt-1">
                  <li>Make sure your backend server is running at the correct address</li>
                  <li>Check for CORS issues if your frontend and backend are on different domains</li>
                  <li>Verify network connectivity between your frontend and backend</li>
                </ul>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
                <CardDescription>{stat.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Medication</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/medications/new"
                className="inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Add Medication
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Interaction</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/drug-drug-interactions/new"
                className="inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Add Interaction
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/admin/users"
                className="inline-block px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                View Users
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

