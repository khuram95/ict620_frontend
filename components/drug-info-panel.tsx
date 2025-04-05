"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

// Define the drug info type
interface DrugInfo {
  name: string
  description: string
  indication: string
  adverseEffect: string
  practicePoints: string
  references: string
}

export default function DrugInfoPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<DrugInfo[]>([])
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null)
  const [loading, setLoading] = useState(false)

  // Dummy data for pre-populated drugs
  const dummyDrugs: DrugInfo[] = [
    {
      name: "Aspirin",
      description:
        "Aspirin is a nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation. It also has antiplatelet effects and is used in low doses to prevent heart attacks and stroke.",
      indication:
        "Pain relief, fever reduction, inflammation, prevention of blood clots, prevention of heart attacks and strokes in high-risk patients.",
      adverseEffect:
        "Gastrointestinal bleeding, stomach ulcers, tinnitus (ringing in ears), allergic reactions, increased bleeding risk. Reye's syndrome in children with viral illnesses.",
      practicePoints:
        "Take with food to reduce stomach upset. Not recommended for children under 12 years due to risk of Reye's syndrome. Use caution in patients with asthma, peptic ulcers, or bleeding disorders.",
      references:
        "Antman, E. M., et al. (2007). Use of nonsteroidal antiinflammatory drugs: an update for clinicians. Circulation, 115(12), 1634-1642.",
    },
    {
      name: "Metformin",
      description:
        "Metformin is a biguanide antihyperglycemic agent used as first-line therapy for type 2 diabetes mellitus. It improves insulin sensitivity and reduces hepatic glucose production.",
      indication:
        "Type 2 diabetes mellitus, polycystic ovary syndrome (off-label), prevention of type 2 diabetes in high-risk individuals.",
      adverseEffect:
        "Gastrointestinal disturbances (diarrhea, nausea, vomiting), metallic taste, vitamin B12 deficiency with long-term use. Rare but serious: lactic acidosis, especially in renal impairment.",
      practicePoints:
        "Take with meals to minimize gastrointestinal side effects. Start with low dose and titrate gradually. Monitor renal function. Temporarily discontinue before procedures using iodinated contrast media.",
      references:
        "Inzucchi, S. E., et al. (2015). Management of hyperglycemia in type 2 diabetes, 2015: a patient-centered approach. Diabetes Care, 38(1), 140-149.",
    },
    {
      name: "Atorvastatin",
      description:
        "Atorvastatin is an HMG-CoA reductase inhibitor (statin) that reduces cholesterol production in the liver. It is one of the most potent statins for lowering LDL cholesterol.",
      indication:
        "Primary hypercholesterolemia, mixed dyslipidemia, prevention of cardiovascular disease, familial hypercholesterolemia.",
      adverseEffect:
        "Myalgia, elevated liver enzymes, rhabdomyolysis (rare), increased risk of diabetes, cognitive effects. May interact with grapefruit juice and certain medications.",
      practicePoints:
        "Take at the same time each day, preferably in the evening. Monitor liver function and creatine kinase levels. Consider CoQ10 supplementation for patients with muscle symptoms.",
      references:
        "Stone, N. J., et al. (2014). 2013 ACC/AHA guideline on the treatment of blood cholesterol to reduce atherosclerotic cardiovascular risk in adults. Circulation, 129(25 Suppl 2), S1-S45.",
    },
  ]

  // Initialize with dummy data
  useEffect(() => {
    setSearchResults(dummyDrugs)
  }, [])

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults(dummyDrugs)
      return
    }

    setLoading(true)
    try {
      // Filter dummy data based on search term
      const filteredResults = dummyDrugs.filter((drug) => drug.name.toLowerCase().includes(searchTerm.toLowerCase()))

      // If no results found in dummy data, add a simulated result
      if (filteredResults.length === 0) {
        const simulatedDrug: DrugInfo = {
          name: searchTerm,
          description: `This is a sample description for ${searchTerm}.`,
          indication: `Sample indications for when ${searchTerm} should be used.`,
          adverseEffect: `Potential side effects of ${searchTerm} include dizziness, nausea, and headache.`,
          practicePoints: `Take ${searchTerm} with food. Avoid alcohol consumption while taking this medication.`,
          references: `Smith, J. et al. (2023). ${searchTerm} Information Journal, 45(2), 123-145.`,
        }
        setSearchResults([simulatedDrug])
      } else {
        setSearchResults(filteredResults)
      }

      // Select the first result
      setSelectedDrug(filteredResults[0] || null)
    } catch (error) {
      console.error("Error fetching drug information:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrugSelect = (drug: DrugInfo) => {
    setSelectedDrug(drug)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 p-4 border border-gray-200 rounded-md">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Drug"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="bg-gray-200 hover:bg-gray-300 text-gray-800" disabled={loading}>
            Search
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-grow">
        {/* Drug List */}
        <div className="w-full md:w-1/3">
          <h2 className="text-lg font-semibold mb-2">Drug List</h2>
          <div className="space-y-2 overflow-auto max-h-[calc(100vh-250px)]">
            {searchResults.map((drug, index) => (
              <Card
                key={index}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedDrug?.name === drug.name ? "border-teal-500 bg-teal-50" : ""}`}
                onClick={() => handleDrugSelect(drug)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium">{drug.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{drug.description.substring(0, 60)}...</p>
                </CardContent>
              </Card>
            ))}
            {searchResults.length === 0 && (
              <div className="text-center p-4 text-gray-500">No drugs found. Try a different search term.</div>
            )}
          </div>
        </div>

        {/* Drug Details */}
        <div className="w-full md:w-2/3 overflow-auto">
          {selectedDrug ? (
            <div className="border border-gray-200 rounded-md p-4">
              <h1 className="text-2xl font-bold mb-6">{selectedDrug.name}</h1>

              <div className="mb-6">
                <div className="flex">
                  <div className="w-32 font-semibold">Description :</div>
                  <div className="flex-1">{selectedDrug.description}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex">
                  <div className="w-32 font-semibold">Indication :</div>
                  <div className="flex-1">{selectedDrug.indication}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex">
                  <div className="w-32 font-semibold">Adverse Effect :</div>
                  <div className="flex-1">{selectedDrug.adverseEffect}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex">
                  <div className="w-32 font-semibold">Practice Points:</div>
                  <div className="flex-1">{selectedDrug.practicePoints}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex">
                  <div className="w-32 font-semibold">References :</div>
                  <div className="flex-1">{selectedDrug.references}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full p-4 border border-gray-200 rounded-md">
              <div className="text-center text-gray-500">
                <p>Select a drug from the list to view detailed information.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

