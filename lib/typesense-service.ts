import Typesense from "typesense"

// Configure the Typesense client
const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: `109.199.100.122`, 
      port: 8108, 
      protocol: 'http',
    },
  ],
  apiKey: `ict_620_project_murdoch`,
  connectionTimeoutSeconds: 5,
})

// Function to search medications
export const searchMedications = async (query: string) => {
  if (!query) return []

  try {
    const searchResults = await typesenseClient
      .collections("medications")
      .documents()
      .search({
        q: query,
        query_by: "name",
        limit: 10,
      })

    return searchResults.hits ? searchResults.hits.map((hit: any) => ({
      value: hit.document.medication_id.toString(),
      label: hit.document.name,
    })) : [];
  } catch (error) {
    console.error("Typesense search error:", error)
    return []
  }
}

export interface OptionType {
  value: string;
  label: string;
}

interface Medication {
  medication_id: number;
  name: string;
}

export const getMedicationById = async (id: string): Promise<OptionType | null> => {
  try {
    console.log("TypeSense    --------------------   Medication by ID:", id);
    const medication = await typesenseClient
      .collections("medications")
      .documents(id)
      .retrieve() as Medication;
    return {
      value: medication.medication_id.toString(),
      label: medication.name,
    };
  } catch (error) {

    console.error("Error fetching medication by id:", error);
    return null;
  }
};
// Export the client for reuse if needed
export default typesenseClient
