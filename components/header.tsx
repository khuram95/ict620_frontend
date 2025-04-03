"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Database } from "lucide-react"

// Update the HeaderProps interface to include the active tab
interface HeaderProps {
  onClearSelections: () => void
  onLogout: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function Header({ onClearSelections, onLogout, activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-teal-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <h1 className="text-xl md:text-2xl font-bold">MEDISYNC</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <button
              onClick={() => onTabChange("drug-drug")}
              className={`px-3 py-1.5 rounded-t-md transition-colors ${
                activeTab === "drug-drug" ? "bg-white text-teal-700 font-medium" : "text-white hover:bg-teal-600"
              }`}
            >
              Drug-Drug
            </button>
            <button
              onClick={() => onTabChange("drug-food")}
              className={`px-3 py-1.5 rounded-t-md transition-colors ${
                activeTab === "drug-food" ? "bg-white text-teal-700 font-medium" : "text-white hover:bg-teal-600"
              }`}
            >
              Drug-Consumables
            </button>
            <button
              onClick={() => onTabChange("drug-comp")}
              className={`px-3 py-1.5 rounded-t-md transition-colors ${
                activeTab === "drug-comp" ? "bg-white text-teal-700 font-medium" : "text-white hover:bg-teal-600"
              }`}
            >
              Drug-Comp
            </button>
            <button
              onClick={() => onTabChange("drug-info")}
              className={`px-3 py-1.5 rounded-t-md transition-colors ${
                activeTab === "drug-info" ? "bg-white text-teal-700 font-medium" : "text-white hover:bg-teal-600"
              }`}
            >
              Drug Info
            </button>
            <button
              onClick={() => onTabChange("patient-tracker")}
              className={`px-3 py-1.5 rounded-t-md transition-colors ${
                activeTab === "patient-tracker" ? "bg-white text-teal-700 font-medium" : "text-white hover:bg-teal-600"
              }`}
            >
              Patient Tracker
            </button>
          </div>
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

