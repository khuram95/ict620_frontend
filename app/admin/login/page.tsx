"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoginForm from "@/components/login-form"

export default function AdminLoginPage() {
  const router = useRouter()

  const handleLogin = (success: boolean) => {
    if (success) {
      // Redirect to admin dashboard
      router.push("/admin")
    }
  }

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token"); // Use 'token' as defined in api-service interceptor logic
    if(token){
      router.push("/admin")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <LoginForm onLogin={handleLogin} />
    </div>
  )
}
