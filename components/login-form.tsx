"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
// Import the apiService (adjust the path as necessary)
import { userApi } from "../lib/api-service"

interface LoginFormProps {
  onLogin: (success: boolean) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Please enter both username and password")
      return
    }

    try {
      // Use the user API's login method from our apiService.
      const res = await userApi.login({email: username, password: password})
      // Extract token and user info from the response.
      const { token, user } = res.data

      // Save the JWT token to localStorage for subsequent API calls.
      localStorage.setItem("token", token)
      onLogin(true)
      console.log("Login successful for user:", user)
    } catch (err: any) {
      // Check for error response from the API service
      setError(err.response?.data?.error || "Login failed")
      console.error("Login error:", err)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the interactions checker
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="student.id@university.edu"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700" type="submit">
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-center text-gray-500 mt-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <span className="ml-3">Home page</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
