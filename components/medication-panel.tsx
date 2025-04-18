// components/medication-panel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Plus, Check, Loader2 } from "lucide-react"; // Added Loader2
import { Badge } from "@/components/ui/badge";
import { CustomPagination } from "@/components/ui/custom-pagination";

// Import Typesense search functions and OptionType (like the first version)
// Adjust the path to your actual typesense service file
import {
    searchMedications,
    searchFoodItems,
    searchComplementaryMedicines,
    OptionType as SuggestionOption, // Rename imported OptionType for clarity
} from "../lib/typesense-service"; // <<<<< ADJUST PATH HERE IF NEEDED

// Interface for selected items (passed in props)
export interface SelectedItem { // Export if used by parent
    name: string;
    id: string; // Expecting the database ID (e.g., medication_id, food_id) as a string
    type?: "drug" | "food" | "comp";
}

interface MedicationPanelProps {
    title: string;
    activeTab: "drug-drug" | "drug-food" | "drug-comp"; // More specific tab type
    onSelectMedication: (name: string, id: string, type?: "drug" | "food" | "comp") => void;
    selectedMedications: Array<SelectedItem>;
    onCheckInteractions: () => void;
    onRemoveMedication: (index: number) => void;
}

export default function MedicationPanel({
    title,
    activeTab,
    onSelectMedication,
    selectedMedications,
    onCheckInteractions,
    onRemoveMedication,
}: MedicationPanelProps) {
    const [drugSearchTerm, setDrugSearchTerm] = useState("");
    const [secondarySearchTerm, setSecondarySearchTerm] = useState("");
    const [drugSuggestions, setDrugSuggestions] = useState<SuggestionOption[]>([]);
    const [secondarySuggestions, setSecondarySuggestions] = useState<SuggestionOption[]>([]);
    const [loadingDrug, setLoadingDrug] = useState(false); // Separate loading states
    const [loadingSecondary, setLoadingSecondary] = useState(false);
    const [selectedDrug, setSelectedDrug] = useState<SuggestionOption | null>(null);
    const [selectedSecondary, setSelectedSecondary] = useState<SuggestionOption | null>(null);
    const [showDrugSuggestions, setShowDrugSuggestions] = useState(false);
    const [showSecondarySuggestions, setShowSecondarySuggestions] = useState(false);
    const drugSuggestionsRef = useRef<HTMLDivElement>(null);
    const secondarySuggestionsRef = useRef<HTMLDivElement>(null);
    const [currentDrugPage, setCurrentDrugPage] = useState(1);
    const [currentSecondaryPage, setCurrentSecondaryPage] = useState(1);
    const itemsPerPage = 5;

    const totalDrugPages = Math.ceil(drugSuggestions.length / itemsPerPage);
    const totalSecondaryPages = Math.ceil(secondarySuggestions.length / itemsPerPage);

    const handleDrugPageChange = (page: number) => {
        setCurrentDrugPage(page);
    };

    const handleSecondaryPageChange = (page: number) => {
        setCurrentSecondaryPage(page);
    };

    // Fetch drug suggestions from Typesense
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (drugSearchTerm.length < 2) {
                setDrugSuggestions([]);
                setShowDrugSuggestions(false);
                return;
            }
            setLoadingDrug(true);
            setShowDrugSuggestions(true);
            try {
                // Using Typesense search function
                const results = await searchMedications(drugSearchTerm);
                setDrugSuggestions(results);
                setCurrentDrugPage(1);
            } catch (error) {
                console.error("Error fetching drug suggestions from Typesense:", error);
                setDrugSuggestions([]);
            } finally {
                setLoadingDrug(false);
            }
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [drugSearchTerm]);

    // Fetch secondary suggestions (food or complementary medicine) from Typesense
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (secondarySearchTerm.length < 2) {
                setSecondarySuggestions([]);
                setShowSecondarySuggestions(false);
                return;
            }
            setLoadingSecondary(true);
            setShowSecondarySuggestions(true);
            try {
                let results: SuggestionOption[] = [];
                switch (activeTab) {
                    case "drug-food":
                        // Using Typesense search function
                        results = await searchFoodItems(secondarySearchTerm);
                        break;
                    case "drug-comp":
                         // Using Typesense search function
                        results = await searchComplementaryMedicines(secondarySearchTerm);
                        break;
                    default:
                        results = [];
                        break;
                }
                setSecondarySuggestions(results);
                setCurrentSecondaryPage(1);
            } catch (error) {
                console.error("Error fetching secondary suggestions from Typesense:", error);
                setSecondarySuggestions([]);
            } finally {
                setLoadingSecondary(false);
            }
        }, 300); // 300ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [secondarySearchTerm, activeTab]); // Depend on activeTab

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drugSuggestionsRef.current && !drugSuggestionsRef.current.contains(event.target as Node)) {
                 const drugInput = document.getElementById("drug-search");
                 if (drugInput !== event.target) setShowDrugSuggestions(false);
            }
            if (secondarySuggestionsRef.current && !secondarySuggestionsRef.current.contains(event.target as Node)) {
                const secondaryInput = document.getElementById("secondary-search");
                 if (secondaryInput !== event.target) setShowSecondarySuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDrugSearchFocus = () => {
        if (drugSearchTerm.length >= 2 && drugSuggestions.length > 0) {
            setShowDrugSuggestions(true);
        }
    };

    const handleSecondarySearchFocus = () => {
        if (secondarySearchTerm.length >= 2 && secondarySuggestions.length > 0) {
            setShowSecondarySuggestions(true);
        }
    };

    // Use the SuggestionOption type here
    const handleDrugSuggestionClick = (suggestion: SuggestionOption) => {
        setSelectedDrug(suggestion);
        setDrugSearchTerm(suggestion.label); // Set input to the selected label
        setDrugSuggestions([]); // Clear suggestions after selection
        setShowDrugSuggestions(false); // Hide dropdown
    };

    const handleSecondarySuggestionClick = (suggestion: SuggestionOption) => {
        setSelectedSecondary(suggestion);
        setSecondarySearchTerm(suggestion.label);
        setSecondarySuggestions([]);
        setShowSecondarySuggestions(false);
    };

    // Modified handleAddItem to use correct ID and type
    const handleAddItem = () => {
        if (activeTab === "drug-drug" && selectedDrug) {
             // Pass suggestion.value (the ID) and type 'drug'
            onSelectMedication(selectedDrug.label, selectedDrug.value, "drug");
            setDrugSearchTerm("");
            setSelectedDrug(null);
            setDrugSuggestions([]);
        } else if ((activeTab === "drug-food" || activeTab === "drug-comp") && selectedDrug && selectedSecondary) {
            const type = activeTab === "drug-food" ? "food" : "comp";

            // Add drug
            onSelectMedication(selectedDrug.label, selectedDrug.value, "drug");
            // Add food or complementary medicine
             onSelectMedication(selectedSecondary.label, selectedSecondary.value, type);

            // Clear selections and inputs
            setDrugSearchTerm("");
            setSecondarySearchTerm("");
            setSelectedDrug(null);
            setSelectedSecondary(null);
            setDrugSuggestions([]);
            setSecondarySuggestions([]);
        }
    };

    // Get the secondary search label based on active tab
    const getSecondarySearchLabel = () => {
        switch (activeTab) {
            case "drug-food": return "Food";
            case "drug-comp": return "Complementary Medicine";
            default: return "";
        }
    };

    // Get the instruction text based on active tab
     const getInstructionText = () => {
         switch (activeTab) {
             case "drug-drug":
                 return "Search for medications using the search box above. Select a suggestion to add it.";
             case "drug-food":
                 return "Search for a Drug and a Food item. Select suggestions to add them.";
             case "drug-comp":
                 return "Search for a Drug and a Complementary Medicine. Select suggestions to add them.";
             default:
                 return "Search for items using the search boxes above.";
         }
     };

    // Determine if the Add button should be enabled
    const isAddButtonEnabled = () => {
        if (loadingDrug || loadingSecondary) return false; // Disable if loading suggestions
        if (activeTab === "drug-drug") {
            // Check if selection matches input to prevent adding after editing
             return !!selectedDrug && selectedDrug.label === drugSearchTerm;
        } else {
            // Check if both selections match their inputs
             return !!selectedDrug && selectedDrug.label === drugSearchTerm &&
                    !!selectedSecondary && selectedSecondary.label === secondarySearchTerm;
        }
    };

    // --- Render Logic ---

    // Reusable Suggestion Renderer
    const renderSuggestions = (
        suggestions: SuggestionOption[],
        loading: boolean,
        searchTerm: string,
        currentPage: number,
        totalPages: number,
        handlePageChange: (page: number) => void,
        handleSuggestionClick: (suggestion: SuggestionOption) => void,
        ref: React.RefObject<HTMLDivElement | null> // Ensure correct type for ref
    ) => (
        <div
            ref={ref} // Attach the ref here
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
            {loading ? (
                <div className="p-3 text-center text-gray-500 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                </div>
            ) : suggestions.length > 0 ? (
                <>
                    {suggestions
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((suggestion, index) => (
                            <div
                                key={`${suggestion.value}-${index}`} // Use value + index for key
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="font-medium">{suggestion.label}</div>
                                {/* Additional info (like brand name) can be added if available in SuggestionOption */}
                                {/* <div className="text-xs text-gray-500">{suggestion.additional}</div> */}
                            </div>
                        ))}
                    {totalPages > 1 && (
                        <div className="p-2 border-t border-gray-100 sticky bottom-0 bg-white">
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                totalItems={suggestions.length}
                                itemsPerPage={itemsPerPage}
                                showItemCount={false}
                                className="justify-center py-1"
                            />
                        </div>
                    )}
                </>
            ) : searchTerm.length >= 2 ? (
                <div className="p-2 text-center text-gray-500">No results found</div>
            ) : null}
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>

            {/* Selected Items Badges */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                {selectedMedications.map((med, index) => (
                    <Badge
                        key={`${med.id}-${index}-${med.type}`} // Include type for uniqueness
                        variant="default"
                        className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-full transition-all ${
                            med.type === "food" ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200" :
                            med.type === "comp" ? "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200" :
                            "bg-teal-100 text-teal-800 border border-teal-200 hover:bg-teal-200" }`}
                    >
                        <span className="font-medium">{med.name}</span>
                        <button
                            className={`ml-1.5 rounded-full p-0.5 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                                med.type === "food" ? "hover:bg-green-300 focus:ring-green-400" :
                                med.type === "comp" ? "hover:bg-amber-300 focus:ring-amber-400" :
                                "hover:bg-teal-300 focus:ring-teal-400" }`}
                            onClick={() => onRemoveMedication(index)}
                            aria-label={`Remove ${med.name}`}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </Badge>
                ))}
                {selectedMedications.length === 0 && (
                    <p className="text-gray-500 italic text-sm py-1.5">No items selected. Search and add items below.</p>
                )}
            </div>

            {/* Search Inputs Area */}
            <div className="space-y-4 mb-4">
                {/* Drug search input */}
                <div className="relative">
                    <label htmlFor="drug-search" className="block text-sm font-medium text-gray-700 mb-1">Drug</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="drug-search"
                            placeholder="Search drugs..."
                            className="pl-8 pr-2 py-2"
                            value={drugSearchTerm}
                            onChange={(e) => {
                                setDrugSearchTerm(e.target.value);
                                setSelectedDrug(null); // Clear selection if user types again
                            }}
                            onFocus={handleDrugSearchFocus}
                            autoComplete="off"
                        />
                        {showDrugSuggestions && renderSuggestions(
                            drugSuggestions, loadingDrug, drugSearchTerm, currentDrugPage, totalDrugPages, handleDrugPageChange, handleDrugSuggestionClick, drugSuggestionsRef
                        )}
                    </div>
                </div>

                {/* Secondary search input */}
                {(activeTab === "drug-food" || activeTab === "drug-comp") && (
                    <div className="relative">
                        <label htmlFor="secondary-search" className="block text-sm font-medium text-gray-700 mb-1">{getSecondarySearchLabel()}</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="secondary-search"
                                placeholder={`Search ${getSecondarySearchLabel().toLowerCase()}...`}
                                className="pl-8 pr-2 py-2"
                                value={secondarySearchTerm}
                                onChange={(e) => {
                                    setSecondarySearchTerm(e.target.value);
                                    setSelectedSecondary(null); // Clear selection if user types again
                                }}
                                onFocus={handleSecondarySearchFocus}
                                autoComplete="off"
                            />
                            {showSecondarySuggestions && renderSuggestions(
                                secondarySuggestions, loadingSecondary, secondarySearchTerm, currentSecondaryPage, totalSecondaryPages, handleSecondaryPageChange, handleSecondarySuggestionClick, secondarySuggestionsRef
                             )}
                        </div>
                    </div>
                )}

                {/* Add Button */}
                <div className="flex justify-end pt-2">
                    <Button
                        disabled={!isAddButtonEnabled()}
                        onClick={handleAddItem}
                        className="h-10 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </div>
            </div>

             {/* Check Interactions Button - Now enabled based on length >= 2 */}
             {/* Parent component (`page.tsx`) should ideally handle enabling logic based on specific tab needs if required before triggering */}
            <Button
                 className="w-full mb-4 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-60"
                 onClick={onCheckInteractions} // This now calls the parent handler
                 disabled={selectedMedications.length < 2} // Basic check, parent/InteractionPanel does more validation
            >
                 <Check className="mr-2 h-4 w-4" /> Check Interactions ({selectedMedications.length})
            </Button>

            {/* Instruction/Placeholder Area */}
            <div className="flex-grow overflow-auto mt-4">
                <Card className="bg-gray-50 border-gray-200 border rounded-lg">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600">{getInstructionText()}</p>
                         { selectedMedications.length < 2 &&
                           <p className="text-sm text-gray-500 mt-2">
                               Add at least two items to the list above to enable the "Check Interactions" button.
                           </p>
                         }
                        <div className="mt-6">
                            <img
                                src="/placeholder.svg?height=100&width=100"
                                alt="Interaction checker illustration"
                                className="mx-auto opacity-60"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}