"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import Header from "@/components/header"
import MedicationPanel from "@/components/medication-panel"
import InteractionPanel from "@/components/interaction-panel"

interface Medication {
  name: string
  id: string
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedMedications, setSelectedMedications] = useState<Medication[]>([])
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false)
  const [shouldCheckInteractions, setShouldCheckInteractions] = useState(false)

  const handleLogin = (success: boolean) => {
    setIsLoggedIn(success)
  }

  const handleMedicationSelect = (medicationName: string, medicationId: string) => {
    // Check if medication is already in the list
    if (!selectedMedications.some((med) => med.id === medicationId)) {
      setSelectedMedications([...selectedMedications, { name: medicationName, id: medicationId }])

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Frame - Header */}
      <Header onClearSelections={handleClearSelections} onLogout={() => setIsLoggedIn(false)} />

      {/* Y-Frame Layout */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Frame - Medication Selection */}
        <div className="w-full md:w-1/2 p-4 border-r border-gray-200">
          <MedicationPanel
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
          />
        </div>
      </div>
    </div>
  )
}

