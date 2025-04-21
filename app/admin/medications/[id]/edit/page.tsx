"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { medicationApi, type Medication } from "@/lib/api-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

// Define the adverse effects JSON structure
interface AdverseEffects {
  common?: string
  uncommon?: string
  rare?: string
  veryRare?: string
  frequency_not_known?: string
  [key: string]: string | undefined
}

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [medication, setMedication] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [adverseEffects, setAdverseEffects] = useState<AdverseEffects>({
    common: "",
    uncommon: "",
    rare: "",
    veryRare: "",
    frequency_not_known: "",
  })

  const [selectedSchedules, setSelectedSchedules] = useState<number[]>([])

  // Available schedules
  const availableSchedules = [2, 3, 4, 8]

  useEffect(() => {
    const fetchMedication = async () => {
      try {
        setLoading(true)
        const response = await medicationApi.getById(params.id)
        setMedication(response.data)

        // Initialize form data
        setFormData({
          name: response.data.name || "",
          description: response.data.description || "",
          indications: response.data.indications || "",
          counselling: response.data.counselling || "",
          practice_points: response.data.practice_points || "",
        })

         // Set selected schedules
         setSelectedSchedules(response.data.schedules || [])

        // Parse adverse_effect if it's a JSON string
        if (response.data?.adverse_effect) {
          try {
            const parsedEffects = JSON.parse(response.data.adverse_effect)
            setAdverseEffects(parsedEffects)
          } catch (e) {
            // If parsing fails, treat it as a regular string in the "common" field
            setAdverseEffects({ common: response.data.adverse_effect })
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching medication:", err)
        setError("Failed to load medication details. Please try again later.")
        setLoading(false)
      }
    }

    fetchMedication()
  }, [params.id])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdverseEffectsChange = (key: string, value: string) => {
    setAdverseEffects((prev) => ({ ...prev, [key]: value }))
  }

  const handleScheduleChange = (schedule: number, checked: boolean) => {
    if (checked) {
      setSelectedSchedules((prev) => [...prev, schedule])
    } else {
      setSelectedSchedules((prev) => prev.filter((s) => s !== schedule))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // debugger
      // Combine form data with adverse effects
      const dataToSubmit = {
        ...formData,
        adverse_effect: JSON.stringify(adverseEffects),
        schedules: selectedSchedules,
      }

      await medicationApi.update(params.id, dataToSubmit)

      toast({
        title: "Medication updated",
        description: "The medication has been updated successfully.",
      })

      router.push("/admin/medications")
    } catch (error) {
      console.error("Error updating medication:", error)
      toast({
        title: "Error",
        description: "An error occurred while updating the medication.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading medication details...</div>
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Medication</h1>
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

  if (!medication) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Medication Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested medication could not be found.</p>
          <button
            onClick={() => router.push("/admin/medications")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Medications
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{`Edit Medication: ${medication.name}`}</h1>
        <Link href="/admin/medications" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input id="name" name="name" value={formData.name || ""} onChange={handleFormChange} required />
              </div>

              <div className="space-y-2">
                <Label>Schedules</Label>
                <div className="grid grid-cols-2 gap-4 border rounded-md p-4">
                  {availableSchedules.map((schedule) => (
                    <div key={schedule} className="flex items-center space-x-2">
                      <Checkbox
                        id={`schedule-${schedule}`}
                        checked={selectedSchedules.includes(schedule)}
                        onCheckedChange={(checked) => handleScheduleChange(schedule, checked === true)}
                      />
                      <Label htmlFor={`schedule-${schedule}`} className="cursor-pointer">
                        Schedule {schedule}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleFormChange}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="indications">Indications</Label>
                <Textarea
                  id="indications"
                  name="indications"
                  value={formData.indications || ""}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="counselling">Counselling</Label>
                <Textarea
                  id="counselling"
                  name="counselling"
                  value={formData.counselling || ""}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>

              {/* Adverse Effects Section */}
              <div className="space-y-4 md:col-span-2">
                <Label>Adverse Effects</Label>

                <div className="space-y-4 border rounded-md p-4">
                  <div className="space-y-2">
                    <Label htmlFor="adverse_common">Common</Label>
                    <Textarea
                      id="adverse_common"
                      value={adverseEffects.common || ""}
                      onChange={(e) => handleAdverseEffectsChange("common", e.target.value)}
                      rows={3}
                      placeholder="Common adverse effects (>1/100 to <1/10)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adverse_uncommon">Uncommon</Label>
                    <Textarea
                      id="adverse_uncommon"
                      value={adverseEffects.uncommon || ""}
                      onChange={(e) => handleAdverseEffectsChange("uncommon", e.target.value)}
                      rows={3}
                      placeholder="Uncommon adverse effects (>1/1,000 to <1/100)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adverse_rare">Rare</Label>
                    <Textarea
                      id="adverse_rare"
                      value={adverseEffects.rare || ""}
                      onChange={(e) => handleAdverseEffectsChange("rare", e.target.value)}
                      rows={3}
                      placeholder="Rare adverse effects (>1/10,000 to <1/1,000)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adverse_veryRare">Very Rare</Label>
                    <Textarea
                      id="adverse_veryRare"
                      value={adverseEffects.veryRare || ""}
                      onChange={(e) => handleAdverseEffectsChange("veryRare", e.target.value)}
                      rows={3}
                      placeholder="Very rare adverse effects (<1/10,000)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adverse_frequency_not_known">Frequency Not Known</Label>
                    <Textarea
                      id="adverse_frequency_not_known"
                      value={adverseEffects.frequency_not_known || ""}
                      onChange={(e) => handleAdverseEffectsChange("frequency_not_known", e.target.value)}
                      rows={3}
                      placeholder="Adverse effects with unknown frequency"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="practice_points">Practice Points</Label>
                <Textarea
                  id="practice_points"
                  name="practice_points"
                  value={formData.practice_points || ""}
                  onChange={handleFormChange}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

