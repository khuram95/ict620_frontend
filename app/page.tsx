"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/login-form"
import Header from "@/components/header"
import MedicationPanel from "@/components/medication-panel"
import InteractionPanel from "@/components/interaction-panel"
import DrugInfoPanel from "@/components/drug-info-panel"
import PatientTrackerPanel from "@/components/patient-tracker-panel"

interface Medication {
  name: string
  id: string
  type?: "drug" | "food" | "comp"
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([])
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false)
  const [shouldCheckInteractions, setShouldCheckInteractions] = useState(false)
  const [activeTab, setActiveTab] = useState("drug-drug")

  // Check for a JWT token on mount
  useEffect(() => {
    const token = localStorage.getItem("jwtToken")
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (success: boolean) => {
    setIsLoggedIn(success)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Reset selections when changing tabs
    setSelectedMedications([])
    setShouldCheckInteractions(false)
    setIsCheckingInteractions(false)
  }

  const handleMedicationSelect = (
    medicationName: string,
    medicationId: string,
    type: "drug" | "food" | "comp" = "drug",
  ) => {
    // Check if medication is already in the list
    if (!selectedMedications.some((med) => med.id === medicationId)) {
      setSelectedMedications([...selectedMedications, { name: medicationName, id: medicationId, type }])

      // Reset the check state when medications change
      setShouldCheckInteractions(false)
    }
  }

  const handleRemoveMedication = (index: number) => {
    const newMedications = [...selectedMedications]
    newMedications.splice(index, 1)
    setSelectedMedications(newMedications)

    // Reset the check state when medications change
    setShouldCheckInteractions(false)
    setIsCheckingInteractions(false)
  }

  const handleClearSelections = () => {
    setSelectedMedications([])
    setShouldCheckInteractions(false)
    setIsCheckingInteractions(false)
  }

  const handleCheckInteractions = () => {
    if (selectedMedications.length < 2) return
    setIsCheckingInteractions(true)
    setShouldCheckInteractions(true)
  }

  const handleCheckComplete = () => {
    setIsCheckingInteractions(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  // Determine the title for the left panel based on active tab
  const getLeftPanelTitle = () => {
    switch (activeTab) {
      case "drug-drug":
        return "Select Drugs"
      case "drug-food":
        return "Select Drug + Food"
      case "drug-comp":
        return "Select Drug + Complementary Medicine"
      case "drug-info":
        return "Search Drug"
      case "patient-tracker":
        return "Patient Information"
      default:
        return "Select Items"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Frame - Header */}
      <Header
        onClearSelections={handleClearSelections}
        onLogout={() => {
          localStorage.removeItem("jwtToken")
          setIsLoggedIn(false)
        }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Y-Frame Layout */}
      <div className="flex flex-col md:flex-row flex-grow">
        {activeTab === "drug-info" || activeTab === "patient-tracker" ? (
          // Full-width layout for Drug Info and Patient Tracker
          <div className="w-full p-4">{activeTab === "drug-info" ? <DrugInfoPanel /> : <PatientTrackerPanel />}</div>
        ) : (
          // Split layout for interaction-related tabs
          <>
            {/* Left Frame - Selection Panel */}
            <div className="w-full md:w-1/2 p-4 border-r border-gray-200">
              <MedicationPanel
                title={getLeftPanelTitle()}
                activeTab={activeTab}
                onSelectMedication={handleMedicationSelect}
                selectedMedications={selectedMedications}
                onCheckInteractions={handleCheckInteractions}
                onRemoveMedication={handleRemoveMedication}
              />
            </div>

            {/* Right Frame - Interaction Results */}
            <div className="w-full md:w-1/2 p-4">
              <InteractionPanel
                medications={selectedMedications}
                isLoading={isCheckingInteractions}
                shouldCheck={shouldCheckInteractions}
                onCheckComplete={handleCheckComplete}
                activeTab={activeTab}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

