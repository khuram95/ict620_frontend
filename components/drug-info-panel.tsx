"use client";

import React, { useState } from "react"; // Import React for JSX typing
import { Card, CardContent } from "@/components/ui/card";
import MedicationSearchBox, { OptionType } from "./ui/medication-search-box"; // Adjust path if needed
import { medicationApi, Medication } from "@/lib/api-service"; // Adjust path if needed

export default function DrugInfoPanel() {
  const [selectedDrug, setSelectedDrug] = useState<Medication | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMedicationSelect = async (selected: OptionType | null) => {
    setSelectedOption(selected);
    setError(null);

    if (selected) {
      setLoadingDetails(true);
      setSelectedDrug(null);
      try {
        const response = await medicationApi.getById(selected.value);
        const drugDetails: Medication | null = response.data;
        if (drugDetails) {
          setSelectedDrug(drugDetails);
        } else {
          setError(`Details not found for the selected medication.`);
          setSelectedDrug(null);
        }
      } catch (err: any) {
        console.error("Error fetching medication details:", err);
        setError("Failed to fetch medication details. Please try again.");
        setSelectedDrug(null);
      } finally {
        setLoadingDetails(false);
      }
    } else {
      setSelectedDrug(null);
    }
  };

  // Helper function to render standard detail fields (as single block of text)
  const renderDetailField = (label: string, content: string | null | undefined) => {
    if (!content) return null;
    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-40 font-semibold mb-1 sm:mb-0">{label}:</div>
          <div className="flex-1 whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    );
  };

  // Helper function for Adverse Effects (parsing JSON)
  const renderAdverseEffects = (jsonString: string | null | undefined): React.ReactNode => {
     if (!jsonString) return null;
     try {
       const adverseData = JSON.parse(jsonString);
       if (typeof adverseData !== 'object' || adverseData === null) {
          throw new Error("Parsed data is not an object");
       }
       return (
         <div className="mb-6">
           <div className="flex flex-col sm:flex-row">
             <div className="w-full sm:w-40 font-semibold mb-1 sm:mb-0">Adverse Effects:</div>
             <div className="flex-1 space-y-3">
               {Object.entries(adverseData).map(([key, value]) => (
                 <div key={key}>
                   <h4 className="font-medium text-sm capitalize mb-1">{key.replace(/_/g, ' ')}:</h4>
                   {Array.isArray(value) ? (
                     <ul className="list-disc list-inside pl-4 text-sm space-y-1">
                       {value.map((item, index) => <li key={index}>{item}</li>)}
                     </ul>
                   ) : typeof value === 'string' ? (
                     <p className="text-sm whitespace-pre-wrap">{value}</p>
                   ) : (
                     <p className="text-sm text-gray-500">[Unsupported format]</p>
                   )}
                 </div>
               ))}
             </div>
           </div>
         </div>
       );
     } catch (e) {
       console.error("Failed to parse adverse_effect JSON:", e);
       return (
         <div className="mb-6">
           <div className="flex flex-col sm:flex-row">
             <div className="w-full sm:w-40 font-semibold mb-1 sm:mb-0">Adverse Effects:</div>
             <div className="flex-1 whitespace-pre-wrap text-sm text-red-700">
               (Could not parse details, showing raw data): <br /> {jsonString}
             </div>
           </div>
         </div>
       );
     }
  };

  // *** NEW HELPER FUNCTION for Practice Points ***
  const renderPracticePoints = (text: string | null | undefined): React.ReactNode => {
      if (!text) return null;

      // Split the string by semicolon, trim whitespace, and filter out empty strings
      const points = text.split(';')
                         .map(point => point.trim())
                         .filter(point => point.length > 0);

      if (points.length === 0) {
          // If splitting resulted in nothing (e.g., text was just ";;")
          return renderDetailField("Practice Points", text); // Fallback to original renderer
      }

      return (
          <div className="mb-6">
              <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-40 font-semibold mb-1 sm:mb-0">Practice Points:</div>
                  <div className="flex-1">
                      {/* Render as an unordered list */}
                      <ul className="list-disc list-inside space-y-1 text-sm">
                          {points.map((point, index) => (
                              <li key={index}>{point}</li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      );
  };


  return (
    <div className="h-full flex flex-col p-4">
      {/* Search Box Area */}
      <div className="mb-4">
        <MedicationSearchBox
          name="medicationSearch"
          label="Search for Medication"
          onChange={handleMedicationSelect}
        />
        {loadingDetails && (
          <p className="text-sm text-gray-500 mt-1">Loading details...</p>
        )}
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* Drug Details Area */}
      <div className="flex-grow overflow-auto border border-gray-200 rounded-md p-4">
        {selectedDrug ? (
          <div>
            <h1 className="text-2xl font-bold mb-6">{selectedDrug.name}</h1>

            {/* Render standard fields */}
            {renderDetailField("Description", selectedDrug.description)}
            {renderDetailField("Indications", selectedDrug.indications)}

            {/* Use the helper for Adverse Effects */}
            {renderAdverseEffects(selectedDrug.adverse_effect)}

            {/* *** Use the new helper for Practice Points *** */}
            {renderPracticePoints(selectedDrug.practice_points)}

            {/* Render other standard fields */}
            {renderDetailField("Counselling", selectedDrug.counselling)}

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              {!loadingDetails && !error && (
                <p>
                  Search for a medication above to view detailed information.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}