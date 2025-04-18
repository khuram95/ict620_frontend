// components/interaction-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, CheckCircle, Coffee, PillIcon, Leaf, FlaskConical, Loader2 } from "lucide-react"; // Added more icons
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Import the apiClient and interaction types from your api service
// Adjust the path to your actual api service file
import {
  interactionsApi,
    DrugDrugInteraction,
    DrugFoodInteraction,
    DrugComplementaryInteraction,
    InteractionCheckResponse, // Ensure this is exported
    InteractionCheckPayload // Ensure this is exported
} from "../lib/api-service"; // <<<<< ADJUST PATH HERE IF NEEDED

// --- Interfaces for this Component ---

// Interface for selected items received as props
interface SelectedItem {
    name: string;
    id: string;
    type?: "drug" | "food" | "comp";
}

// Input properties for the component
interface InteractionPanelProps {
    medications: Array<SelectedItem>;
    shouldCheck: boolean; // Trigger from parent
    onCheckComplete: () => void; // Callback to parent to reset trigger
    activeInteractionCheckerTab: "drug-drug" | "drug-food" | "drug-comp"; // Type from parent
}

// Combined type for rendering any interaction type
type AnyInteraction = DrugDrugInteraction | DrugFoodInteraction | DrugComplementaryInteraction;


export default function InteractionPanel({
    medications,
    shouldCheck,
    onCheckComplete,
    activeInteractionCheckerTab,
}: InteractionPanelProps) {
    // State to hold the categorized interaction data from the backend
    const [interactionData, setInteractionData] = useState<InteractionCheckResponse | null>(null);
    // Internal loading state specific to this panel's API call
    const [interactionLoading, setInteractionLoading] = useState(false);
    // State for handling API call errors
    const [error, setError] = useState<string | null>(null);

    // Fetch interactions when shouldCheck becomes true
    useEffect(() => {
        if (shouldCheck) {
            console.log("InteractionPanel: shouldCheck is true, attempting fetch...");
             fetchInteractions();
        } else {
            // Optional: Reset when shouldCheck goes back to false (e.g., selection change)
            // Resetting might be better handled solely by selection/tab change in parent
             // console.log("InteractionPanel: shouldCheck is false.");
             // setInteractionData(null);
             // setError(null);
             // setInteractionLoading(false); // Ensure loading stops if check is cancelled
        }
    }, [shouldCheck]); // Only trigger based on the shouldCheck prop change

    // Helper to validate if the selected items match the requirements of the active tab
    const validateSelectionForTab = (
        items: SelectedItem[],
        tab: "drug-drug" | "drug-food" | "drug-comp"
    ): boolean => {
        const drugCount = items.filter(m => m.type === 'drug').length;
        const foodCount = items.filter(m => m.type === 'food').length;
        const compCount = items.filter(m => m.type === 'comp').length;

        switch (tab) {
            case "drug-drug": return drugCount >= 2;
            case "drug-food": return drugCount >= 1 && foodCount >= 1;
            case "drug-comp": return drugCount >= 1 && compCount >= 1;
            default: return false;
        }
    };

    // Function to fetch interaction data from the backend
    const fetchInteractions = async () => {
        // 1. Validate selection based on the *active* tab before fetching
        if (!validateSelectionForTab(medications, activeInteractionCheckerTab)) {
             console.warn("InteractionPanel: Validation failed for active tab. Aborting fetch.");
             setError(`Selection mismatch: Ensure you have the correct items selected for the "${getTabName(activeInteractionCheckerTab)}" checker.`);
             setInteractionData(null); // Clear previous data
             setInteractionLoading(false); // Stop loading visuals
             onCheckComplete(); // IMPORTANT: Signal parent completion even if validation fails
             return; // Stop execution
         }

        // 2. Proceed with fetch if validation passes
        console.log("InteractionPanel: Fetching interactions via API...");
        setInteractionLoading(true);
        setError(null);
        setInteractionData(null); // Clear previous results

        // Separate IDs by type
        // Ensure IDs are parsed correctly if necessary (Python expects integers usually)
        const drug_ids = medications.filter(m => m.type === 'drug').map(m => m.id);
        const food_ids = medications.filter(m => m.type === 'food').map(m => m.id);
        const comp_ids = medications.filter(m => m.type === 'comp').map(m => m.id);

        // Construct request body according to InteractionCheckPayload
        const payload: InteractionCheckPayload = { drug_ids, food_ids, comp_ids };
        console.log("InteractionPanel: API Payload:", payload);

        try {
            // Use the apiClient instance and POST method from api-service.ts
            const response = await interactionsApi.check(payload)

            setInteractionData(response.data);
            console.log("InteractionPanel: Interaction Data Received:", response.data);

        } catch (err: any) {
            console.error("InteractionPanel: Error fetching interactions:", err);
            const errorMsg = err.response?.data?.message || err.message || "Failed to fetch interaction data. Please try again.";
            setError(errorMsg);
            setInteractionData(null); // Ensure data is null on error
        } finally {
            console.log("InteractionPanel: Fetch finished. Setting loading false, calling onCheckComplete.");
            setInteractionLoading(false);
            onCheckComplete(); // Notify parent component check is finished (success or error)
        }
    };

    // --- Helper Functions for Rendering (Matching InteractionCheckResponse structure) ---

     const getSeverityIcon = (severity?: string | null) => {
         switch (severity?.toLowerCase()) {
             case "major": return <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />;
             case "moderate": return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
             case "minor": return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
             default: return <Info className="h-5 w-5 text-gray-500 flex-shrink-0" />;
         }
     };

     const getSeverityClass = (severity?: string | null) => {
         switch (severity?.toLowerCase()) {
             case "major": return "bg-red-50 border-red-200";
             case "moderate": return "bg-amber-50 border-amber-200";
             case "minor": return "bg-blue-50 border-blue-200";
             default: return "bg-gray-50 border-gray-200";
         }
     };

    // Use names provided directly from backend response
    const getInteractionTitle = (interaction: AnyInteraction): string => {
        if ('medication1_name' in interaction && 'medication2_name' in interaction) {
            return `${interaction.medication1_name || 'Drug'} ↔ ${interaction.medication2_name || 'Drug'}`;
        } else if ('medication_name' in interaction && 'food_name' in interaction) {
             return `${interaction.medication_name || 'Drug'} ↔ ${interaction.food_name || 'Food'}`;
        } else if ('medication_name' in interaction && 'complementary_medicine_name' in interaction) {
             return `${interaction.medication_name || 'Drug'} ↔ ${interaction.complementary_medicine_name || 'Comp. Med.'}`;
        }
        return "Unknown Interaction";
    };

     const getTabName = (tab: string) => {
         switch (tab) {
             case "drug-drug": return "Drug-Drug";
             case "drug-food": return "Drug-Food";
             case "drug-comp": return "Drug-Complementary";
             default: return "Unknown";
         }
     };

    const getPanelTitle = () => `Interaction Check: ${getTabName(activeInteractionCheckerTab)}`;

    const getEmptyStateMessage = () => {
        if (!validateSelectionForTab(medications, activeInteractionCheckerTab) && medications.length >= 2) {
             // If enough items total, but not right types for the tab
             return `Current selection doesn't match the requirements for the "${getTabName(activeInteractionCheckerTab)}" checker. Please adjust your selection or switch tabs.`;
         }
         // Standard instructions
         switch (activeInteractionCheckerTab) {
             case "drug-drug": return "Select two or more drugs from the left panel and click 'Check Interactions'.";
             case "drug-food": return "Select at least one drug and one food item from the left panel and click 'Check Interactions'.";
             case "drug-comp": return "Select at least one drug and one complementary medicine from the left panel and click 'Check Interactions'.";
             default: return "Select items from the left panel and click 'Check Interactions'.";
         }
    };

    // --- Render Logic ---

    // Calculate total based on the correct response structure
    const totalInteractions = (interactionData?.drug_drug?.length || 0) +
                              (interactionData?.drug_food?.length || 0) +
                              (interactionData?.drug_complementary?.length || 0);

    // Determine if enough *correctly typed* items are selected for the current checker
    const sufficientItemsSelected = validateSelectionForTab(medications, activeInteractionCheckerTab);

    // 1. Initial State / Insufficient or Incorrectly Typed Items Selected
    if (!shouldCheck && !interactionLoading && !error && (!interactionData || totalInteractions === 0)) {
        const showReadyMessage = sufficientItemsSelected && medications.length >= 2;

        return (
            <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{getPanelTitle()}</h2>
                <div className="flex-grow flex items-center justify-center">
                    <Card className="w-full max-w-lg text-center border-dashed">
                        <CardHeader>
                            <CardTitle>{showReadyMessage ? "Ready to Check" : "Select Required Items"}</CardTitle>
                            <CardDescription>{getEmptyStateMessage()}</CardDescription>
                        </CardHeader>
                         <CardContent>
                             {showReadyMessage ? (
                                 <FlaskConical className="h-10 w-10 text-teal-400 mx-auto mb-3" />
                             ) : (
                                 <Info className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                             )}
                         </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // 2. Loading State
    if (interactionLoading) {
        return (
            <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{getPanelTitle()}</h2>
                 <div className="mb-4">
                     <h3 className="text-lg font-medium mb-2">Selected Items</h3>
                     <div className="flex flex-wrap gap-2">
                         {medications.map((med, index) => (
                             <Badge key={`${med.id}-${index}`} variant="secondary" className="px-3 py-1.5 text-sm">
                                 {med.name} ({med.type})
                             </Badge>
                         ))}
                     </div>
                 </div>
                <h3 className="text-lg font-medium mb-3 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Checking Interactions...
                </h3>
                <div className="space-y-3 mt-4">
                    <Skeleton className="h-20 w-full mb-2" />
                    <Skeleton className="h-20 w-full mb-2" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }

    // 3. Error State
    if (error) {
        return (
            <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{getPanelTitle()}</h2>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Checking Interactions</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={fetchInteractions} variant="outline" > {/* Allow retry */}
                        Retry Check
                    </Button>
                </div>
            </div>
        );
    }

    // 4. No Interaction Data Found State (after a successful check)
    if (shouldCheck && !interactionLoading && !error && totalInteractions === 0) {
        return (
            <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{getPanelTitle()}</h2>
                 <div className="mb-4">
                     <h3 className="text-lg font-medium mb-2">Selected Items</h3>
                     <div className="flex flex-wrap gap-2">
                         {medications.map((med, index) => (
                             <Badge key={`${med.id}-${index}`} variant="secondary" className="px-3 py-1.5 text-sm">
                                 {med.name} ({med.type})
                             </Badge>
                         ))}
                     </div>
                 </div>
                <Card className="w-full">
                    <CardContent className="pt-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Interactions Found</h3>
                        <p className="text-gray-500 mt-2">
                             Based on the available data, no significant interactions were found between the selected items for the <strong>{getTabName(activeInteractionCheckerTab)}</strong> check.
                        </p>
                         <p className="text-xs text-gray-400 mt-3">Always consult with a healthcare professional.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 5. Data Available State
    if (interactionData && totalInteractions > 0) {
         // Calculate counts for summary based on fetched data
         const countInteractionsBySeverity = (interactions: AnyInteraction[] | undefined, severityLevel: string) => {
             return interactions?.filter(i => i.severity?.toLowerCase() === severityLevel.toLowerCase()).length || 0;
         };

        const allFoundInteractions = [
             ...(interactionData.drug_drug || []),
             ...(interactionData.drug_food || []),
             ...(interactionData.drug_complementary || [])
         ];

        const majorCount = countInteractionsBySeverity(allFoundInteractions, "major");
        const moderateCount = countInteractionsBySeverity(allFoundInteractions, "moderate");
        const minorCount = countInteractionsBySeverity(allFoundInteractions, "minor");
        const foodCount = interactionData.drug_food?.length || 0;
        const compCount = interactionData.drug_complementary?.length || 0;

         // Function to render a list of interactions
         const renderInteractionList = (interactions: AnyInteraction[] | undefined, type: 'drug' | 'food' | 'comp') => {
             if (!interactions || interactions.length === 0) {
                  let message = "No interactions of this type found in the results.";
                  if (type === 'drug') message = "No drug-drug interactions found.";
                  else if (type === 'food') message = "No drug-food interactions found.";
                  else if (type === 'comp') message = "No drug-complementary medicine interactions found.";
                  return (
                       <Card className="w-full mt-4 border-dashed">
                           <CardContent className="pt-4 pb-4 text-center">
                               <CheckCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                               <p className="text-sm text-gray-500">{message}</p>
                           </CardContent>
                       </Card>
                   );
             }

            return interactions.map((interaction, index) => (
                // Use a more specific key if possible, e.g., interaction IDs
                 <Alert key={`${type}-${interaction.dd_interaction_id || interaction.df_interaction_id || interaction.dc_interaction_id}-${index}`} className={`${getSeverityClass(interaction.severity)} mb-3`}>
                     <div className="flex items-start space-x-3">
                         {getSeverityIcon(interaction.severity)}
                         <div className="flex-1">
                             <AlertTitle className="font-semibold text-base mb-1">
                                 {getInteractionTitle(interaction)}
                             </AlertTitle>
                             <AlertDescription className="text-sm text-gray-700 leading-relaxed">
                                 {interaction.description || "No description available."}
                             </AlertDescription>
                             {interaction.recommendation && (
                                 <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-300/50">
                                     <strong>Recommendation:</strong> {interaction.recommendation}
                                 </p>
                             )}
                         </div>
                          <Badge variant="outline" className={`text-xs ${
                              interaction.severity?.toLowerCase() === "major" ? "border-red-300 text-red-700" :
                              interaction.severity?.toLowerCase() === "moderate" ? "border-amber-300 text-amber-700" :
                              interaction.severity?.toLowerCase() === "minor" ? "border-blue-300 text-blue-700" : "border-gray-300 text-gray-600"
                          }`}>
                             {interaction.severity || 'N/A'}
                         </Badge>
                     </div>
                 </Alert>
             ));
         };

        return (
            <div className="h-full flex flex-col">
                <h2 className="text-xl font-semibold mb-4">{getPanelTitle()}</h2>

                {/* Selected Items Display */}
                <div className="mb-4 flex-shrink-0">
                    <h3 className="text-lg font-medium mb-2">Selected Items</h3>
                    <div className="flex flex-wrap gap-2">
                        {medications.map((med, index) => (
                             <Badge key={`${med.id}-${index}`} variant="secondary" className="px-3 py-1.5 text-sm">
                                {med.name} ({med.type})
                            </Badge>
                        ))}
                    </div>
                </div>

                 {/* Interaction Summary Card */}
                 <div className="mb-6 flex-shrink-0">
                     <h3 className="text-lg font-medium mb-2">Interaction Summary</h3>
                       <Card className="border-gray-200">
                           <CardContent className="p-4">
                               <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
                                   <div title="Major Severity"><p className="text-2xl font-bold text-red-600">{majorCount}</p><p className="text-sm text-gray-500">Major</p></div>
                                   <div title="Moderate Severity"><p className="text-2xl font-bold text-amber-600">{moderateCount}</p><p className="text-sm text-gray-500">Moderate</p></div>
                                   <div title="Minor Severity"><p className="text-2xl font-bold text-blue-600">{minorCount}</p><p className="text-sm text-gray-500">Minor</p></div>
                                   {/* Conditionally show Food/Comp counts based on API result */}
                                   {foodCount > 0 && (<div title="Drug-Food"><p className="text-2xl font-bold">{foodCount}</p><p className="text-sm text-gray-500">Food</p></div>)}
                                   {compCount > 0 && (<div title="Drug-Complementary"><p className="text-2xl font-bold">{compCount}</p><p className="text-sm text-gray-500">Comp.</p></div>)}
                                    {foodCount === 0 && compCount === 0 && activeInteractionCheckerTab !== 'drug-drug' && (
                                        <> {/* Add placeholders if counts relevant but zero */}
                                            <div title="Drug-Food"><p className="text-2xl font-bold text-gray-400">0</p><p className="text-sm text-gray-400">Food</p></div>
                                            <div title="Drug-Complementary"><p className="text-2xl font-bold text-gray-400">0</p><p className="text-sm text-gray-400">Comp.</p></div>
                                        </>
                                    )}
                               </div>
                           </CardContent>
                       </Card>
                 </div>

                {/* Interaction Details Tabs */}
                <Tabs defaultValue="all" className="flex-grow flex flex-col min-h-0"> {/* Allow tabs to grow and set min-height */}
                     <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
                         <TabsTrigger value="all">All ({totalInteractions})</TabsTrigger>
                         <TabsTrigger value="drug-drug"><PillIcon className="h-4 w-4 mr-1.5"/> Drugs ({interactionData.drug_drug?.length || 0})</TabsTrigger>
                         <TabsTrigger value="drug-food"><Coffee className="h-4 w-4 mr-1.5"/> Food ({interactionData.drug_food?.length || 0})</TabsTrigger>
                          <TabsTrigger value="drug-comp"><Leaf className="h-4 w-4 mr-1.5"/> Comp. ({interactionData.drug_complementary?.length || 0})</TabsTrigger>
                     </TabsList>

                     {/* Scrollable Tab Content Area */}
                     <div className="mt-4 flex-grow overflow-y-auto pr-2 space-y-4 min-h-0"> {/* Allow content to scroll */}
                         <TabsContent value="all" className="mt-0 space-y-4">
                             {renderInteractionList(interactionData.drug_drug, 'drug')}
                             {renderInteractionList(interactionData.drug_food, 'food')}
                             {renderInteractionList(interactionData.drug_complementary, 'comp')}
                         </TabsContent>
                         <TabsContent value="drug-drug" className="mt-0">
                             {renderInteractionList(interactionData.drug_drug, 'drug')}
                         </TabsContent>
                         <TabsContent value="drug-food" className="mt-0">
                              {renderInteractionList(interactionData.drug_food, 'food')}
                         </TabsContent>
                          <TabsContent value="drug-comp" className="mt-0">
                               {renderInteractionList(interactionData.drug_complementary, 'comp')}
                         </TabsContent>
                     </div>
                </Tabs>

                 {/* Classification Footer */}
                 <div className="mt-auto pt-4 flex-shrink-0"> {/* Keep footer at bottom */}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                         <h4 className="font-semibold mb-1.5">Interaction Classification Guide</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span className="font-medium">Major:</span></div><span className="text-gray-600 ml-4"> Avoid combination.</span></div>
                              <div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="font-medium">Moderate:</span></div><span className="text-gray-600 ml-4"> Monitor closely.</span></div>
                              <div><div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="font-medium">Minor:</span></div><span className="text-gray-600 ml-4"> Consider risk/benefit.</span></div>
                          </div>
                          <p className="mt-2 text-center text-gray-500">Disclaimer: Educational purposes only. Consult a healthcare professional.</p>
                      </div>
                 </div>
            </div>
        );
    }

     // Fallback: Should ideally not be reached if all states are handled
     return (
         <div className="h-full flex flex-col items-center justify-center">
             <p className="text-gray-500">Loading interaction panel...</p>
         </div>
     );
}