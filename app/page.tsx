"use client"

import { useState, useEffect } from "react"
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

  const handleMedicationSelect = (medicationName: string, medicationId: string) => {
    if (!selectedMedications.some((med) => med.id === medicationId)) {
      setSelectedMedications([...selectedMedications, { name: medicationName, id: medicationId }])
      setShouldCheckInteractions(false)
    }
  }

  const handleRemoveMedication = (index: number) => {
    const newMedications = [...selectedMedications]
    newMedications.splice(index, 1)
    setSelectedMedications(newMedications)
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
      <Header 
        onClearSelections={handleClearSelections} 
        onLogout={() => {
          localStorage.removeItem("jwtToken")
          setIsLoggedIn(false)
        }} 
      />

      <div className="flex flex-col md:flex-row flex-grow">
        <div className="w-full md:w-1/2 p-4 border-r border-gray-200">
          <MedicationPanel
            onSelectMedication={handleMedicationSelect}
            selectedMedications={selectedMedications}
            onCheckInteractions={handleCheckInteractions}
            onRemoveMedication={handleRemoveMedication}
          />
        </div>
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
