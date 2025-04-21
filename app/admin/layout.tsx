"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminNav from "@/components/admin/admin-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token"); // Use 'token' as defined in api-service interceptor logic
    const authenticated = !!token
    setIsAuthenticated(authenticated)
    setIsLoading(false)
    // If not authenticated and not on login page, redirect to login
    if (!authenticated && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  // If on login page, just render the login page
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Render admin layout with navigation
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  )
}
