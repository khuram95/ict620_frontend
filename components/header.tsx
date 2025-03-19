"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database } from "lucide-react"

interface HeaderProps {
  onClearSelections: () => void
  onLogout: () => void
}

export default function Header({ onClearSelections, onLogout }: HeaderProps) {
  return (
    <header className="bg-teal-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-xl md:text-2xl font-bold">Hospital Medication Interaction Checker</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/admin" className="text-white hover:text-teal-200 flex items-center gap-1">
            <Database className="h-4 w-4" />
            <span>Admin</span>
          </Link>
          <Button variant="outline" onClick={onClearSelections} className="border-white text-white hover:bg-teal-600">
            Clear All
          </Button>
          <Button variant="outline" onClick={onLogout} className="border-white text-white hover:bg-teal-600">
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

