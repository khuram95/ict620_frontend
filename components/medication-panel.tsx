"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Plus, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DrugSuggestion {
  suggestion: string
  additional: string
  ddc_id: number
  brand_name_id: number
}

interface MedicationPanelProps {
  onSelectMedication: (medication: string, drugId: string) => void
  selectedMedications: Array<{ name: string; id: string }>
  onCheckInteractions: () => void
  onRemoveMedication: (index: number) => void
}

export default function MedicationPanel({
  onSelectMedication,
  selectedMedications,
  onCheckInteractions,
  onRemoveMedication,
}: MedicationPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<DrugSuggestion | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Add a comprehensive helper function to decode URL-encoded strings
  function decodeHtmlEntities(text: string): string {
    // Use the built-in decodeURIComponent function to handle all percent-encoded characters
    try {
      // First replace + with %20 (space) as decodeURIComponent doesn't handle + as space
      const preparedText = text.replace(/\+/g, "%20")
      return decodeURIComponent(preparedText)
    } catch (e) {
      // If decodeURIComponent fails (e.g., with invalid sequences),
      // fall back to manual replacement of common encodings
      return text
        .replace(/%20/g, " ")
        .replace(/%21/g, "!")
        .replace(/%22/g, '"')
        .replace(/%23/g, "#")
        .replace(/%24/g, "$")
        .replace(/%25/g, "%")
        .replace(/%26/g, "&")
        .replace(/%27/g, "'")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%2A/g, "*")
        .replace(/%2B/g, "+")
        .replace(/%2C/g, ",")
        .replace(/%2D/g, "-")
        .replace(/%2E/g, ".")
        .replace(/%2F/g, "/")
        .replace(/%3A/g, ":")
        .replace(/%3B/g, ";")
        .replace(/%3C/g, "<")
        .replace(/%3D/g, "=")
        .replace(/%3E/g, ">")
        .replace(/%3F/g, "?")
        .replace(/%40/g, "@")
        .replace(/%5B/g, "[")
        .replace(/%5C/g, "\\")
        .replace(/%5D/g, "]")
        .replace(/%5E/g, "^")
        .replace(/%5F/g, "_")
        .replace(/%60/g, "`")
        .replace(/%7B/g, "{")
        .replace(/%7C/g, "|")
        .replace(/%7D/g, "}")
        .replace(/%7E/g, "~")
        .replace(/\+/g, " ")
    }
  }

  // Fetch drug suggestions from the API
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/autocomplete?search_params=${encodeURIComponent(searchTerm)}`,
        )

        const data = await response.json()

        if (data.categories && data.categories.length > 0) {
          // Decode the suggestion text before setting it
          const decodedResults =
            data.categories[0].results?.map((result: DrugSuggestion) => ({
              ...result,
              suggestion: decodeHtmlEntities(result.suggestion),
              additional: decodeHtmlEntities(result.additional),
            })) || []
          setSuggestions(decodedResults)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Error fetching drug suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchFocus = () => {
    if (searchTerm.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleSuggestionClick = (suggestion: DrugSuggestion) => {
    setSelectedDrug(suggestion)
    setSearchTerm(suggestion.suggestion)
    setShowSuggestions(false)
  }

  const handleAddDrug = () => {
    if (selectedDrug) {
      const drugId = `${selectedDrug.ddc_id}-${selectedDrug.brand_name_id}`
      onSelectMedication(selectedDrug.suggestion, drugId)
      setSearchTerm("")
      setSelectedDrug(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Select Medications</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedMedications.map((med, index) => (
          <Badge
            key={index}
            variant="default"
            className="px-3 py-2 flex items-center gap-1 bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-50"
          >
            <span className="font-medium">{med.name}</span>
            <button
              className="ml-2 rounded-full hover:bg-teal-200 p-1 transition-colors"
              onClick={() => onRemoveMedication(index)}
              aria-label={`Remove ${med.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {selectedMedications.length === 0 && (
          <p className="text-gray-500 italic">
            No medications selected. Search and add medications to check interactions.
          </p>
        )}
      </div>

      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (e.target.value.length >= 2) {
                  setShowSuggestions(true)
                } else {
                  setShowSuggestions(false)
                }
              }}
              onFocus={handleSearchFocus}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {loading ? (
                  <div className="p-2 text-center text-gray-500">Loading...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="font-medium">{suggestion.suggestion}</div>
                      <div className="text-xs text-gray-500">{suggestion.additional}</div>
                    </div>
                  ))
                ) : searchTerm.length >= 2 ? (
                  <div className="p-2 text-center text-gray-500">No results found</div>
                ) : null}
              </div>
            )}
          </div>

          <Button
            disabled={!selectedDrug}
            onClick={handleAddDrug}
            className="h-10 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-4"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {selectedMedications.length >= 2 && (
        <Button className="mb-4 bg-teal-600 hover:bg-teal-700" onClick={onCheckInteractions}>
          <Check className="mr-2 h-4 w-4" /> Check Interactions
        </Button>
      )}

      <div className="flex-grow overflow-auto">
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-4">
            <p className="text-center text-gray-500">
              Search for medications using the search box above. Results will appear as you type.
            </p>
            <p className="text-center text-gray-500 mt-2">
              Select medications to add them to your list, then click "Check Interactions" to view potential
              interactions.
            </p>
            <div className="mt-4 text-center">
              <img
                src="/placeholder.svg?height=120&width=120"
                alt="Medication interaction illustration"
                className="mx-auto opacity-50"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

