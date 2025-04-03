"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, Plus, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CustomPagination } from "@/components/ui/custom-pagination"

interface DrugSuggestion {
  suggestion: string
  additional: string
  ddc_id: number
  brand_name_id: number
}

interface MedicationPanelProps {
  title: string
  activeTab: string
  onSelectMedication: (medication: string, drugId: string, type?: "drug" | "food" | "comp") => void
  selectedMedications: Array<{ name: string; id: string; type?: "drug" | "food" | "comp" }>
  onCheckInteractions: () => void
  onRemoveMedication: (index: number) => void
}

export default function MedicationPanel({
  title,
  activeTab,
  onSelectMedication,
  selectedMedications,
  onCheckInteractions,
  onRemoveMedication,
}: MedicationPanelProps) {
  const [drugSearchTerm, setDrugSearchTerm] = useState("")
  const [secondarySearchTerm, setSecondarySearchTerm] = useState("")
  const [drugSuggestions, setDrugSuggestions] = useState<DrugSuggestion[]>([])
  const [secondarySuggestions, setSecondarySuggestions] = useState<DrugSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<DrugSuggestion | null>(null)
  const [selectedSecondary, setSelectedSecondary] = useState<DrugSuggestion | null>(null)
  const [showDrugSuggestions, setShowDrugSuggestions] = useState(false)
  const [showSecondarySuggestions, setShowSecondarySuggestions] = useState(false)
  const drugSuggestionsRef = useRef<HTMLDivElement>(null)
  const secondarySuggestionsRef = useRef<HTMLDivElement>(null)
  const [currentDrugPage, setCurrentDrugPage] = useState(1)
  const [currentSecondaryPage, setCurrentSecondaryPage] = useState(1)
  const itemsPerPage = 5

  const totalDrugPages = Math.ceil(drugSuggestions.length / itemsPerPage)
  const totalSecondaryPages = Math.ceil(secondarySuggestions.length / itemsPerPage)

  const handleDrugPageChange = (page: number) => {
    setCurrentDrugPage(page)
  }

  const handleSecondaryPageChange = (page: number) => {
    setCurrentSecondaryPage(page)
  }

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
    const fetchDrugSuggestions = async () => {
      if (drugSearchTerm.length < 2) {
        setDrugSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/autocomplete?search_params=${encodeURIComponent(drugSearchTerm)}`,
        )

        const data = await response.json()

        if (data.categories && data.categories.length > 0) {
          const decodedResults =
            data.categories[0].results?.map((result: DrugSuggestion) => ({
              ...result,
              suggestion: decodeHtmlEntities(result.suggestion),
              additional: decodeHtmlEntities(result.additional),
            })) || []
          setDrugSuggestions(decodedResults)
        } else {
          setDrugSuggestions([])
        }
      } catch (error) {
        console.error("Error fetching drug suggestions:", error)
        setDrugSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchDrugSuggestions()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [drugSearchTerm])

  // Fetch secondary suggestions (food or complementary medicine)
  useEffect(() => {
    const fetchSecondarySuggestions = async () => {
      if (secondarySearchTerm.length < 2) {
        setSecondarySuggestions([])
        return
      }

      setLoading(true)
      try {
        // In a real implementation, this would call a different API endpoint based on activeTab
        // For now, we'll use the same endpoint for demonstration
        const response = await fetch(
          `http://127.0.0.1:5000/api/autocomplete?search_params=${encodeURIComponent(secondarySearchTerm)}`,
        )

        const data = await response.json()

        if (data.categories && data.categories.length > 0) {
          const decodedResults =
            data.categories[0].results?.map((result: DrugSuggestion) => ({
              ...result,
              suggestion: decodeHtmlEntities(result.suggestion),
              additional: decodeHtmlEntities(result.additional),
            })) || []
          setSecondarySuggestions(decodedResults)
        } else {
          setSecondarySuggestions([])
        }
      } catch (error) {
        console.error("Error fetching secondary suggestions:", error)
        setSecondarySuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchSecondarySuggestions()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [secondarySearchTerm, activeTab])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drugSuggestionsRef.current && !drugSuggestionsRef.current.contains(event.target as Node)) {
        setShowDrugSuggestions(false)
      }
      if (secondarySuggestionsRef.current && !secondarySuggestionsRef.current.contains(event.target as Node)) {
        setShowSecondarySuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDrugSearchFocus = () => {
    if (drugSearchTerm.length >= 2) {
      setShowDrugSuggestions(true)
    }
  }

  const handleSecondarySearchFocus = () => {
    if (secondarySearchTerm.length >= 2) {
      setShowSecondarySuggestions(true)
    }
  }

  const handleDrugSuggestionClick = (suggestion: DrugSuggestion) => {
    setSelectedDrug(suggestion)
    setDrugSearchTerm(suggestion.suggestion)
    setShowDrugSuggestions(false)
  }

  const handleSecondarySuggestionClick = (suggestion: DrugSuggestion) => {
    setSelectedSecondary(suggestion)
    setSecondarySearchTerm(suggestion.suggestion)
    setShowSecondarySuggestions(false)
  }

  const handleAddItem = () => {
    if (activeTab === "drug-drug" && selectedDrug) {
      const drugId = `${selectedDrug.ddc_id}-${selectedDrug.brand_name_id}`
      onSelectMedication(selectedDrug.suggestion, drugId, "drug")
      setDrugSearchTerm("")
      setSelectedDrug(null)
    } else if ((activeTab === "drug-food" || activeTab === "drug-comp") && selectedDrug && selectedSecondary) {
      // Add drug
      const drugId = `${selectedDrug.ddc_id}-${selectedDrug.brand_name_id}`
      onSelectMedication(selectedDrug.suggestion, drugId, "drug")

      // Add food or complementary medicine
      const secondaryId = `${selectedSecondary.ddc_id}-${selectedSecondary.brand_name_id}`
      const type = activeTab === "drug-food" ? "food" : "comp"
      onSelectMedication(selectedSecondary.suggestion, secondaryId, type)

      // Clear selections
      setDrugSearchTerm("")
      setSecondarySearchTerm("")
      setSelectedDrug(null)
      setSelectedSecondary(null)
    }
  }

  // Get the secondary search label based on active tab
  const getSecondarySearchLabel = () => {
    switch (activeTab) {
      case "drug-food":
        return "Food"
      case "drug-comp":
        return "Complementary Medicine"
      default:
        return "Secondary"
    }
  }

  // Get the instruction text based on active tab
  const getInstructionText = () => {
    switch (activeTab) {
      case "drug-drug":
        return "Search for medications using the search box above. Results will appear as you type."
      case "drug-food":
        return "Search for Drug & Food using the search boxes above. Results will appear as you type."
      case "drug-comp":
        return "Search for Drug & Complementary Medicine using the search boxes above. Results will appear as you type."
      default:
        return "Search for items using the search boxes above. Results will appear as you type."
    }
  }

  // Determine if the Add button should be enabled
  const isAddButtonEnabled = () => {
    if (activeTab === "drug-drug") {
      return !!selectedDrug
    } else {
      return !!selectedDrug && !!selectedSecondary
    }
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedMedications.map((med, index) => (
          <Badge
            key={index}
            variant="default"
            className={`px-3 py-2 flex items-center gap-1 ${
              med.type === "food"
                ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-50"
                : med.type === "comp"
                  ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-50"
                  : "bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-50"
            }`}
          >
            <span className="font-medium">{med.name}</span>
            <button
              className={`ml-2 rounded-full p-1 transition-colors ${
                med.type === "food"
                  ? "hover:bg-green-200"
                  : med.type === "comp"
                    ? "hover:bg-amber-200"
                    : "hover:bg-teal-200"
              }`}
              onClick={() => onRemoveMedication(index)}
              aria-label={`Remove ${med.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {selectedMedications.length === 0 && (
          <p className="text-gray-500 italic">No items selected. Search and add items to check interactions.</p>
        )}
      </div>

      <div className="space-y-4 mb-4">
        {/* Drug search input */}
        <div className="relative">
          <label htmlFor="drug-search" className="block text-sm font-medium text-gray-700 mb-1">
            Drug
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="drug-search"
              placeholder="Search drugs..."
              className="pl-8"
              value={drugSearchTerm}
              onChange={(e) => {
                setDrugSearchTerm(e.target.value)
                if (e.target.value.length >= 2) {
                  setShowDrugSuggestions(true)
                } else {
                  setShowDrugSuggestions(false)
                }
              }}
              onFocus={handleDrugSearchFocus}
            />

            {/* Drug suggestions dropdown */}
            {showDrugSuggestions && (
              <div
                ref={drugSuggestionsRef}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {loading ? (
                  <div className="p-2 text-center text-gray-500">Loading...</div>
                ) : drugSuggestions.length > 0 ? (
                  drugSuggestions
                    .slice((currentDrugPage - 1) * itemsPerPage, currentDrugPage * itemsPerPage)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                        onClick={() => handleDrugSuggestionClick(suggestion)}
                      >
                        <div className="font-medium">{suggestion.suggestion}</div>
                        <div className="text-xs text-gray-500">{suggestion.additional}</div>
                      </div>
                    ))
                ) : drugSearchTerm.length >= 2 ? (
                  <div className="p-2 text-center text-gray-500">No results found</div>
                ) : null}
                {/* Pagination for drug suggestions */}
                {drugSuggestions.length > itemsPerPage && (
                  <div className="p-2 border-t border-gray-100">
                    <CustomPagination
                      currentPage={currentDrugPage}
                      totalPages={totalDrugPages}
                      onPageChange={handleDrugPageChange}
                      totalItems={drugSuggestions.length}
                      itemsPerPage={itemsPerPage}
                      showItemCount={false}
                      className="justify-center"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary search input (food or complementary medicine) */}
        {(activeTab === "drug-food" || activeTab === "drug-comp") && (
          <div className="relative">
            <label htmlFor="secondary-search" className="block text-sm font-medium text-gray-700 mb-1">
              {getSecondarySearchLabel()}
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="secondary-search"
                placeholder={`Search ${getSecondarySearchLabel().toLowerCase()}...`}
                className="pl-8"
                value={secondarySearchTerm}
                onChange={(e) => {
                  setSecondarySearchTerm(e.target.value)
                  if (e.target.value.length >= 2) {
                    setShowSecondarySuggestions(true)
                  } else {
                    setShowSecondarySuggestions(false)
                  }
                }}
                onFocus={handleSecondarySearchFocus}
              />

              {/* Secondary suggestions dropdown */}
              {showSecondarySuggestions && (
                <div
                  ref={secondarySuggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {loading ? (
                    <div className="p-2 text-center text-gray-500">Loading...</div>
                  ) : secondarySuggestions.length > 0 ? (
                    secondarySuggestions
                      .slice((currentSecondaryPage - 1) * itemsPerPage, currentSecondaryPage * itemsPerPage)
                      .map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                          onClick={() => handleSecondarySuggestionClick(suggestion)}
                        >
                          <div className="font-medium">{suggestion.suggestion}</div>
                          <div className="text-xs text-gray-500">{suggestion.additional}</div>
                        </div>
                      ))
                  ) : secondarySearchTerm.length >= 2 ? (
                    <div className="p-2 text-center text-gray-500">No results found</div>
                  ) : null}
                  {/* Pagination for secondary suggestions */}
                  {secondarySuggestions.length > itemsPerPage && (
                    <div className="p-2 border-t border-gray-100">
                      <CustomPagination
                        currentPage={currentSecondaryPage}
                        totalPages={totalSecondaryPages}
                        onPageChange={handleSecondaryPageChange}
                        totalItems={secondarySuggestions.length}
                        itemsPerPage={itemsPerPage}
                        showItemCount={false}
                        className="justify-center"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            disabled={!isAddButtonEnabled()}
            onClick={handleAddItem}
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
            <p className="text-center text-gray-500">{getInstructionText()}</p>
            <p className="text-center text-gray-500 mt-2">
              Select items to add them to your list, then click "Check Interactions" to view potential interactions.
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

