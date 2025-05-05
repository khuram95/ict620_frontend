// app/page.tsx (or your page file)
"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/components/login-form"; // Adjust path if needed
import Header from "@/components/header"; // Adjust path if needed
import MedicationPanel from "@/components/medication-panel"; // Adjust path if needed
import InteractionPanel from "@/components/interaction-panel"; // Adjust path if needed
import DrugInfoPanel from "@/components/drug-info-panel"; // Adjust path if needed
import PatientTrackerPanel from "@/components/patient-tracker-panel"; // Adjust path if needed

// Use the SelectedItem type from MedicationPanel for consistency
interface SelectedItem {
    name: string;
    id: string; // Keep as string, backend will parse if needed
    type?: "drug" | "food" | "comp";
}

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]); // Renamed for clarity
    // Removed isCheckingInteractions - InteractionPanel handles its own loading
    const [shouldCheckInteractions, setShouldCheckInteractions] = useState(false);
    const [activeTab, setActiveTab] = useState<"drug-drug" | "drug-food" | "drug-comp" | "drug-info" | "patient-tracker">("drug-drug"); // Ensure type includes all tabs

    // Check for a JWT token on mount (assuming token stored in localStorage)
    useEffect(() => {
        const token = localStorage.getItem("token"); // Use 'token' as defined in api-service interceptor logic
        const admin = localStorage.getItem("isAdmin");
        if (token) {
            setIsLoggedIn(true);
            setIsAdmin(admin)
            console.log("admin", admin)
        }
    }, []);

    const handleLogin = (success: boolean) => {
        setIsLoggedIn(success);
    };

    const handleTabChange = (tabValue: string) => {
        // Ensure the value matches the expected types
        const newTab = tabValue as typeof activeTab;
        setActiveTab(newTab);
        // Reset selections and check state when changing tabs
        setSelectedItems([]);
        setShouldCheckInteractions(false);
    };

    const handleMedicationSelect = (
        name: string,
        id: string, // ID received from selection panel
        type: "drug" | "food" | "comp" = "drug"
    ) => {
        // Check if item with same id and type is already in the list
        if (!selectedItems.some((item) => item.id === id && item.type === type)) {
            setSelectedItems((prevItems) => [...prevItems, { name, id, type }]);
            // Reset the check state whenever the selection changes
            setShouldCheckInteractions(false);
        } else {
            console.log("Item already selected:", { name, id, type });
        }
    };

    const handleRemoveMedication = (index: number) => {
        setSelectedItems((prevItems) => prevItems.filter((_, i) => i !== index));
        // Reset the check state whenever the selection changes
        setShouldCheckInteractions(false);
    };

    const handleClearSelections = () => {
        setSelectedItems([]);
        setShouldCheckInteractions(false);
    };

    const handleCheckInteractions = () => {
        // Basic check, more specific validation happens in InteractionPanel
        if (selectedItems.length < 2) {
             console.log("Parent: Need at least 2 items to check interactions.");
             // Optionally show a notification to the user here
            return;
        }
        console.log("Parent: Setting shouldCheckInteractions to true.");
        // Don't set loading state here, InteractionPanel handles it
        setShouldCheckInteractions(true); // Trigger the check in InteractionPanel
    };

    // This function is called by InteractionPanel when its API call finishes
    const handleCheckComplete = () => {
        console.log("Parent: Received check complete signal. Setting shouldCheckInteractions to false.");
        // CRITICAL FIX: Reset the trigger flag
        setShouldCheckInteractions(false);
    };

    // --- Render Logic ---

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <LoginForm onLogin={handleLogin} />
            </div>
        );
    }

    // Determine the title for the left panel based on active tab
    const getLeftPanelTitle = () => {
        switch (activeTab) {
            case "drug-drug": return "Select Medications";
            case "drug-food": return "Select Drug & Food";
            case "drug-comp": return "Select Drug & Complementary Medicine";
            case "drug-info": return "Search Drug Information";
            case "patient-tracker": return "Patient Tracker";
            default: return "Select Items";
        }
    };

    // Determine the active checker tab type for InteractionPanel
    const getActiveCheckerTab = (): "drug-drug" | "drug-food" | "drug-comp" => {
         if (activeTab === "drug-drug" || activeTab === "drug-food" || activeTab === "drug-comp") {
             return activeTab;
         }
         return "drug-drug"; // Default or handle appropriately
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Frame - Header */}
            <Header
                onClearSelections={handleClearSelections}
                onLogout={() => {
                    localStorage.removeItem("token"); // Use 'token' consistently
                    setIsLoggedIn(false);
                    setSelectedItems([]); // Clear selections on logout
                    setShouldCheckInteractions(false);
                }}
                isAdmin={isAdmin}
                activeTab={activeTab}
                onTabChange={handleTabChange} // Pass the handler
                
            />

            {/* Main Content Area */}
            <div className="flex flex-col md:flex-row flex-grow">
                {activeTab === "drug-info" || activeTab === "patient-tracker" ? (
                    // Full-width layout for specific tabs
                    <div className="w-full p-4 overflow-y-auto"> {/* Added overflow */}
                        {activeTab === "drug-info" ? <DrugInfoPanel /> : <PatientTrackerPanel />}
                    </div>
                ) : (
                    // Split layout for interaction checkers
                    <>
                        {/* Left Frame - Selection Panel */}
                        <div className="w-full md:w-1/2 p-4 border-r border-gray-200 overflow-y-auto"> {/* Added overflow */}
                             {/* Ensure MedicationPanel is compatible with the active interaction tab */}
                             <MedicationPanel
                                 title={getLeftPanelTitle()}
                                 // Cast activeTab to the specific types MedicationPanel expects
                                 activeTab={getActiveCheckerTab()}
                                 onSelectMedication={handleMedicationSelect}
                                 selectedMedications={selectedItems} // Pass the unified state
                                 onCheckInteractions={handleCheckInteractions}
                                 onRemoveMedication={handleRemoveMedication}
                             />
                        </div>

                        {/* Right Frame - Interaction Results */}
                        <div className="w-full md:w-1/2 p-4 overflow-y-auto"> {/* Added overflow */}
                            <InteractionPanel
                                medications={selectedItems} // Pass the unified state
                                // isLoading prop removed
                                shouldCheck={shouldCheckInteractions} // Pass the trigger
                                onCheckComplete={handleCheckComplete} // Pass the reset callback
                                activeInteractionCheckerTab={getActiveCheckerTab()} // Pass the relevant tab type
                                activeTab={activeTab} // Pass the activeTab state
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}