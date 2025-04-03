"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info, CheckCircle, Coffee, PillIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface InteractionPanelProps {
  medications: Array<{ name: string; id: string; type?: "drug" | "food" | "comp" }>
  isLoading?: boolean
  shouldCheck: boolean
  onCheckComplete: () => void
  activeTab: string
}

interface ReportSummary {
  total_interactions: number
  drugs: string[]
}

interface InteractionFilter {
  type: string
  count: number
}

interface Interaction {
  severity: string
  title: string
  description: string
  applies_to: string[]
}

interface TherapeuticDuplicationWarnings {
  message: string
  details: string
}

interface InteractionResponse {
  report_summary: ReportSummary
  interaction_filters: InteractionFilter[]
  interactions_between_drugs: Interaction[]
  drug_and_food_interactions: Interaction[]
  therapeutic_duplication_warnings: TherapeuticDuplicationWarnings
}

export default function InteractionPanel({
  medications,
  isLoading = false,
  shouldCheck,
  onCheckComplete,
  activeTab,
}: InteractionPanelProps) {
  const [interactionData, setInteractionData] = useState<InteractionResponse | null>(null)
  const [interactionLoading, setInteractionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only fetch interactions when shouldCheck is true
  useEffect(() => {
    if (shouldCheck && medications.length >= 2) {
      fetchInteractions()
    }
  }, [shouldCheck, medications])

  const fetchInteractions = async () => {
    if (medications.length < 2) return

    setInteractionLoading(true)
    setError(null)

    try {
      // Create a drug_list parameter from the medication IDs
      const drugList = medications.map((med) => med.id).join(",")

      // Use axios to call the API that returns JSON content
      const response = await axios.get(`http://127.0.0.1:8000/api/check_interactions`, {
        params: {
          drug_list: drugList,
          professional: 1,
        },
      })

      // Set the interaction data from the response
      setInteractionData(response.data)
      console.log(response.data)
      setInteractionLoading(false)

      // Notify parent that check is complete
      onCheckComplete()
    } catch (err) {
      console.error("Error fetching interactions:", err)
      setError("Failed to fetch interaction data. Please try again.")
      setInteractionLoading(false)

      // Notify parent that check is complete (even with error)
      onCheckComplete()
    }
  }

  // Helper function to format interaction title
  const formatInteractionTitle = (title: string) => {
    // Check if it's a food interaction
    if (title.toLowerCase().includes("food")) {
      // Split at "food" and format
      const drugName = title.replace(/food/i, "")
      return `${drugName} ↔ Food`
    }

    // For drug-drug interactions, try to identify drug names
    // This is a simple approach - in a real app, you might need more sophisticated parsing
    const drugNames = []
    let currentWord = ""

    for (let i = 0; i < title.length; i++) {
      if (i > 0 && title[i].toUpperCase() === title[i] && title[i - 1].toLowerCase() === title[i - 1]) {
        // Found a capital letter after a lowercase letter - likely a new drug name
        drugNames.push(currentWord)
        currentWord = title[i]
      } else {
        currentWord += title[i]
      }
    }

    if (currentWord) {
      drugNames.push(currentWord)
    }

    return drugNames.join(" ↔ ")
  }

  // Helper function to get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "major":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "moderate":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "minor":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  // Helper function to get severity class
  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "major":
        return "bg-red-50 border-red-200"
      case "moderate":
        return "bg-amber-50 border-amber-200"
      case "minor":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  // Helper function to determine if an interaction is a food interaction
  const isFoodInteraction = (title: string) => {
    return title.toLowerCase().includes("food")
  }

  // Update the title based on active tab
  const getTitle = () => {
    switch (activeTab) {
      case "drug-drug":
        return "Drug-Drug Interaction Results"
      case "drug-food":
        return "Drug-Food Interaction Results"
      case "drug-comp":
        return "Drug-Complementary Medicine Interaction Results"
      default:
        return "Interaction Results"
    }
  }

  // Update the empty state message based on active tab
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "drug-drug":
        return "Select two or more drugs from the left panel to check for potential interactions"
      case "drug-food":
        return "Select a drug and a food item from the left panel to check for potential interactions"
      case "drug-comp":
        return "Select a drug and a complementary medicine from the left panel to check for potential interactions"
      default:
        return "Select two or more items from the left panel to check for potential interactions"
    }
  }

  if (medications.length < 2) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Select Items</CardTitle>
              <CardDescription className="text-center">{getEmptyStateMessage()}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Loading state
  if (interactionLoading || isLoading) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {medications.map((med, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle>{med.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="text-lg font-medium mb-3">Checking Interactions...</h3>

        <div className="space-y-3">
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchInteractions} className="bg-teal-600 hover:bg-teal-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // No data state - show a message prompting the user to click the Check Interactions button
  if (!interactionData && !shouldCheck) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <Card className="w-full">
          <CardContent className="pt-6 text-center">
            <Info className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Ready to Check Interactions</h3>
            <p className="text-gray-500 mt-2">
              You have selected {medications.length} medications. Click the "Check Interactions" button to see potential
              interactions.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No data state after checking
  if (!interactionData && shouldCheck) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <Card className="w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Interaction Data</h3>
            <p className="text-gray-500 mt-2">
              No interaction data was returned. Please try different medications or check your connection.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get counts for each severity
  const majorCount = interactionData?.interaction_filters.find((f) => f.type === "Major")?.count || 0
  const moderateCount = interactionData?.interaction_filters.find((f) => f.type === "Moderate")?.count || 0
  const minorCount = interactionData?.interaction_filters.find((f) => f.type === "Minor")?.count || 0
  const foodCount = interactionData?.interaction_filters.find((f) => f.type === "Food")?.count || 0
  const duplicationCount =
    interactionData?.interaction_filters.find((f) => f.type === "Therapeutic duplication")?.count || 0

  // Filter interactions to avoid duplicates
  // Use a Set to track unique interaction titles
  const uniqueInteractions = new Map()

  // Process drug-drug interactions
  const drugDrugInteractions =
    interactionData?.interactions_between_drugs.filter((interaction) => {
      if (!isFoodInteraction(interaction.title)) {
        const key = interaction.title
        //if (!uniqueInteractions.has(key)) {
        uniqueInteractions.set(key, interaction)
        return true
        //}
      }
      return false
    }) || []

  // Process food interactions
  const foodInteractions =
    interactionData?.drug_and_food_interactions.filter((interaction) => {
      if (isFoodInteraction(interaction.title)) {
        const key = interaction.title
        //if (!uniqueInteractions.has(key)) {
        uniqueInteractions.set(key, interaction)
        return true
        //}
      }
      return false
    }) || []

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Selected Medications</h3>
        <div className="flex flex-wrap gap-2">
          {medications.map((med, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1.5 text-base">
              {med.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Interaction Summary</h3>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-xs">Major</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-xs">Moderate</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-xs">Minor</span>
            </span>
          </div>
        </div>

        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{majorCount}</p>
                <p className="text-sm text-gray-500">Major</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{moderateCount}</p>
                <p className="text-sm text-gray-500">Moderate</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{minorCount}</p>
                <p className="text-sm text-gray-500">Minor</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{foodCount}</p>
                <p className="text-sm text-gray-500">Food</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{duplicationCount}</p>
                <p className="text-sm text-gray-500">Duplication</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="flex-grow">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({interactionData?.report_summary.total_interactions || 0})</TabsTrigger>
          <TabsTrigger value="drug-drug">Drug-Drug ({drugDrugInteractions.length})</TabsTrigger>
          <TabsTrigger value="food">Food ({foodInteractions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 overflow-auto flex-grow mt-4">
          {interactionData && interactionData.report_summary.total_interactions > 0 ? (
            <>
              {/* Drug-Drug Interactions */}
              {drugDrugInteractions.length > 0 && (
                <>
                  <h3 className="font-semibold flex items-center gap-2">
                    <PillIcon className="h-5 w-5" />
                    Drug-Drug Interactions
                  </h3>
                  {drugDrugInteractions.map((interaction, index) => (
                    <Alert key={`drug-${index}`} className={getSeverityClass(interaction.severity)}>
                      <div className="flex items-start">
                        {getSeverityIcon(interaction.severity)}
                        <div className="ml-3 w-full">
                          <AlertTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              {formatInteractionTitle(interaction.title)}
                              <span
                                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  interaction.severity.toLowerCase() === "major"
                                    ? "bg-red-100 text-red-800"
                                    : interaction.severity.toLowerCase() === "moderate"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {interaction.severity}
                              </span>
                            </div>
                          </AlertTitle>
                          <AlertDescription className="mt-1">{interaction.description}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </>
              )}

              {/* Food Interactions */}
              {foodInteractions.length > 0 && (
                <>
                  <h3 className="font-semibold flex items-center gap-2 mt-6">
                    <Coffee className="h-5 w-5" />
                    Food Interactions
                  </h3>
                  {foodInteractions.map((interaction, index) => (
                    <Alert key={`food-${index}`} className={getSeverityClass(interaction.severity)}>
                      <div className="flex items-start">
                        {getSeverityIcon(interaction.severity)}
                        <div className="ml-3 w-full">
                          <AlertTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                              {formatInteractionTitle(interaction.title)}
                              <span
                                className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                  interaction.severity.toLowerCase() === "major"
                                    ? "bg-red-100 text-red-800"
                                    : interaction.severity.toLowerCase() === "moderate"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {interaction.severity}
                              </span>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              Food
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="mt-1">{interaction.description}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </>
              )}

              {/* Therapeutic Duplication */}
              {duplicationCount > 0 ? (
                <div className="mt-6">
                  <h3 className="font-semibold">Therapeutic Duplication Warnings</h3>
                  <Alert className="bg-purple-50 border-purple-200">
                    <AlertTriangle className="h-5 w-5 text-purple-500" />
                    <AlertTitle>Therapeutic Duplication</AlertTitle>
                    <AlertDescription>{interactionData.therapeutic_duplication_warnings.message}</AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="mt-6">
                  <h3 className="font-semibold">Therapeutic Duplication</h3>
                  <Alert className="bg-gray-50">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertTitle>No Therapeutic Duplication</AlertTitle>
                    <AlertDescription>{interactionData.therapeutic_duplication_warnings.message}</AlertDescription>
                  </Alert>
                </div>
              )}
            </>
          ) : (
            <Card className="w-full">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Known Interactions</h3>
                <p className="text-gray-500 mt-2">
                  No significant interactions were found between these items. Always consult with a healthcare
                  professional.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drug-drug" className="space-y-3 overflow-auto flex-grow mt-4">
          {drugDrugInteractions.length > 0 ? (
            drugDrugInteractions.map((interaction, index) => (
              <Alert key={index} className={getSeverityClass(interaction.severity)}>
                <div className="flex items-start">
                  {getSeverityIcon(interaction.severity)}
                  <div className="ml-3 w-full">
                    <AlertTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {formatInteractionTitle(interaction.title)}
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            interaction.severity.toLowerCase() === "major"
                              ? "bg-red-100 text-red-800"
                              : interaction.severity.toLowerCase() === "moderate"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {interaction.severity}
                        </span>
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-1">{interaction.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          ) : (
            <Card className="w-full">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Drug-Drug Interactions</h3>
                <p className="text-gray-500 mt-2">No drug-drug interactions were found between these medications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="food" className="space-y-3 overflow-auto flex-grow mt-4">
          {foodInteractions.length > 0 ? (
            foodInteractions.map((interaction, index) => (
              <Alert key={index} className={getSeverityClass(interaction.severity)}>
                <div className="flex items-start">
                  {getSeverityIcon(interaction.severity)}
                  <div className="ml-3 w-full">
                    <AlertTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {formatInteractionTitle(interaction.title)}
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            interaction.severity.toLowerCase() === "major"
                              ? "bg-red-100 text-red-800"
                              : interaction.severity.toLowerCase() === "moderate"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {interaction.severity}
                        </span>
                      </div>
                    </AlertTitle>
                    <AlertDescription className="mt-1">{interaction.description}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))
          ) : (
            <Card className="w-full">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Food Interactions</h3>
                <p className="text-gray-500 mt-2">No food interactions were found for these medications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold mb-2">Drug Interaction Classification</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="font-medium">Major</span>
            </div>
            <p className="mt-1 text-gray-600">
              Highly clinically significant. Avoid combinations; the risk outweighs the benefit.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-medium">Moderate</span>
            </div>
            <p className="mt-1 text-gray-600">
              Moderately significant. Usually avoid combinations; use only under special circumstances.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="font-medium">Minor</span>
            </div>
            <p className="mt-1 text-gray-600">
              Minimally significant. Minimize risk; assess risk and consider alternatives.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>
          Note: This information is for educational purposes only. Always verify with multiple sources and consult with
          a licensed pharmacist or healthcare provider.
        </p>
      </div>
    </div>
  )
}

