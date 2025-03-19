// Comprehensive API service with dummy data for all entities

// Medication type definition
export interface Medication {
  medication_id: number
  name: string
  description: string | null
  indications?: string | null
  counselling?: string | null
  adverse_effect?: string | null
  practice_points?: string | null
  created_at: string
  updated_at?: string | null
}

// Mock data for medications
const mockMedications: Medication[] = [
  {
    medication_id: 1,
    name: "Aspirin",
    description:
      "Pain reliever and anti-inflammatory medication commonly used to reduce fever and relieve mild to moderate pain.",
    indications: "Mild to moderate pain, fever, inflammatory conditions",
    counselling:
      "Take with food to reduce stomach upset. Do not use in children with viral illnesses due to risk of Reye's syndrome.",
    adverse_effect: "Stomach upset, heartburn, easy bruising or bleeding",
    practice_points: "Avoid in patients with asthma, peptic ulcers, or bleeding disorders",
    created_at: new Date().toISOString(),
  },
  {
    medication_id: 2,
    name: "Ibuprofen",
    description: "Non-steroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.",
    indications: "Pain, fever, inflammatory conditions like arthritis",
    counselling: "Take with food. Avoid alcohol. Do not take other NSAIDs concurrently.",
    adverse_effect: "Stomach upset, heartburn, dizziness, mild headache",
    practice_points: "Use caution in elderly patients and those with heart, kidney, or liver disease",
    created_at: new Date().toISOString(),
  },
  {
    medication_id: 3,
    name: "Metformin",
    description: "First-line medication for the treatment of type 2 diabetes.",
    indications: "Type 2 diabetes mellitus",
    counselling: "Take with meals to reduce gastrointestinal side effects. Monitor blood glucose regularly.",
    adverse_effect: "Diarrhea, nausea, abdominal discomfort, metallic taste",
    practice_points: "Contraindicated in patients with severe renal impairment",
    created_at: new Date().toISOString(),
  },
  {
    medication_id: 4,
    name: "Lisinopril",
    description: "ACE inhibitor used to treat high blood pressure and heart failure.",
    indications: "Hypertension, heart failure, post-myocardial infarction",
    counselling: "May cause dizziness, especially when standing up. Report persistent dry cough.",
    adverse_effect: "Dry cough, dizziness, headache, fatigue",
    practice_points: "Monitor renal function and potassium levels",
    created_at: new Date().toISOString(),
  },
  {
    medication_id: 5,
    name: "Atorvastatin",
    description: "Statin medication used to lower cholesterol and reduce risk of cardiovascular disease.",
    indications: "Hypercholesterolemia, prevention of cardiovascular disease",
    counselling: "Take at the same time each day. Report unexplained muscle pain or weakness.",
    adverse_effect: "Muscle pain, liver enzyme elevation, digestive problems",
    practice_points: "Consider CoQ10 supplementation for patients with muscle symptoms",
    created_at: new Date().toISOString(),
  },
]

// Simple medication API functions
export const medicationApi = {
  // Get all medications
  getAll: async (): Promise<Medication[]> => {
    try {
      // In a real implementation, this would fetch from an API
      // const response = await fetch("http://127.0.0.1:5000/api/medications/");
      // return await response.json();

      // For now, return mock data
      return mockMedications
    } catch (error) {
      console.error("Error fetching medications:", error)
      return mockMedications
    }
  },

  // Get medication by ID
  getById: async (id: string | number): Promise<Medication | null> => {
    try {
      // In a real implementation, this would fetch from an API
      // const response = await fetch(`http://127.0.0.1:5000/api/medications/${id}`);
      // return await response.json();

      // For now, find in mock data
      const medication = mockMedications.find((m) => m.medication_id === Number(id))
      return medication || null
    } catch (error) {
      console.error(`Error fetching medication with ID ${id}:`, error)
      return null
    }
  },

  // Create a new medication
  create: async (data: Partial<Medication>): Promise<Medication> => {
    try {
      // In a real implementation, this would post to an API
      // const response = await fetch('http://127.0.0.1:5000/api/medications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();

      // For now, create a mock medication
      const newMedication: Medication = {
        ...data,
        medication_id: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date().toISOString(),
        description: data.description || null,
      } as Medication

      mockMedications.push(newMedication)
      return newMedication
    } catch (error) {
      console.error("Error creating medication:", error)
      throw new Error("Failed to create medication")
    }
  },

  // Update an existing medication
  update: async (id: string | number, data: Partial<Medication>): Promise<Medication> => {
    try {
      // In a real implementation, this would put to an API
      // const response = await fetch(`http://127.0.0.1:5000/api/medications/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return await response.json();

      // For now, update a mock medication
      const index = mockMedications.findIndex((m) => m.medication_id === Number(id))

      if (index === -1) {
        throw new Error(`Medication with ID ${id} not found`)
      }

      const updatedMedication: Medication = {
        ...mockMedications[index],
        ...data,
        updated_at: new Date().toISOString(),
      }

      mockMedications[index] = updatedMedication
      return updatedMedication
    } catch (error) {
      console.error(`Error updating medication with ID ${id}:`, error)
      throw new Error("Failed to update medication")
    }
  },

  // Delete a medication
  delete: async (id: string | number): Promise<void> => {
    try {
      // In a real implementation, this would delete from an API
      // await fetch(`http://127.0.0.1:5000/api/medications/${id}`, {
      //   method: 'DELETE'
      // });

      // For now, just remove from mock data
      const index = mockMedications.findIndex((m) => m.medication_id === Number(id))
      if (index !== -1) {
        mockMedications.splice(index, 1)
      }
      console.log(`Medication with ID ${id} deleted`)
    } catch (error) {
      console.error(`Error deleting medication with ID ${id}:`, error)
      throw new Error("Failed to delete medication")
    }
  },
}

// Allergy type definition
export interface Allergy {
  allergy_id: number
  name: string
  description: string | null
  severity?: string | null
  symptoms?: string | null
  created_at: string
  updated_at: string | null
}

// Mock data for allergies
const mockAllergies: Allergy[] = [
  {
    allergy_id: 1,
    name: "Penicillin",
    description: "Allergy to penicillin and related antibiotics",
    severity: "Severe",
    symptoms: "Rash, hives, itching, fever, difficulty breathing, anaphylaxis",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    allergy_id: 2,
    name: "Sulfa Drugs",
    description: "Allergy to sulfonamide antibiotics",
    severity: "Moderate",
    symptoms: "Rash, hives, itching, fever",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    allergy_id: 3,
    name: "NSAIDs",
    description: "Allergy to non-steroidal anti-inflammatory drugs",
    severity: "Moderate",
    symptoms: "Hives, facial swelling, asthma symptoms, anaphylaxis",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const allergyApi = {
  getAll: async (): Promise<Allergy[]> => {
    return mockAllergies
  },
  getById: async (id: string | number): Promise<Allergy | null> => {
    const allergy = mockAllergies.find((a) => a.allergy_id === Number(id))
    return allergy || null
  },
  create: async (data: Partial<Allergy>): Promise<Allergy> => {
    const newAllergy: Allergy = {
      ...data,
      allergy_id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: null,
      description: data.description || null,
    } as Allergy

    mockAllergies.push(newAllergy)
    return newAllergy
  },
  update: async (id: string | number, data: Partial<Allergy>): Promise<Allergy> => {
    const index = mockAllergies.findIndex((a) => a.allergy_id === Number(id))

    if (index === -1) {
      throw new Error(`Allergy with ID ${id} not found`)
    }

    const updatedAllergy: Allergy = {
      ...mockAllergies[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockAllergies[index] = updatedAllergy
    return updatedAllergy
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockAllergies.findIndex((a) => a.allergy_id === Number(id))
    if (index !== -1) {
      mockAllergies.splice(index, 1)
    }
  },
}

// Food Item type definition
export interface FoodItem {
  food_id: number
  name: string
  description: string | null
  notes?: string | null
  created_at: string
  updated_at: string | null
}

// Mock data for food items
const mockFoodItems: FoodItem[] = [
  {
    food_id: 1,
    name: "Grapefruit",
    description: "Citrus fruit known to interact with many medications",
    notes: "Contains compounds that inhibit CYP3A4 enzyme, affecting drug metabolism",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    food_id: 2,
    name: "Alcohol",
    description: "Alcoholic beverages that can interact with medications",
    notes: "Can enhance sedative effects of many medications and may cause liver damage",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    food_id: 3,
    name: "Dairy Products",
    description: "Milk and other dairy products that can affect medication absorption",
    notes: "Can bind to certain antibiotics and reduce their absorption",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    food_id: 4,
    name: "Leafy Greens",
    description: "Vegetables high in vitamin K",
    notes: "Can reduce the effectiveness of warfarin and other anticoagulants",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    food_id: 5,
    name: "Tyramine-Rich Foods",
    description: "Foods like aged cheese, cured meats, and fermented products",
    notes: "Can cause dangerous blood pressure elevation when taken with MAO inhibitors",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const foodItemApi = {
  getAll: async (): Promise<FoodItem[]> => {
    return mockFoodItems
  },
  getById: async (id: string | number): Promise<FoodItem | null> => {
    const foodItem = mockFoodItems.find((f) => f.food_id === Number(id))
    return foodItem || null
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockFoodItems.findIndex((f) => f.food_id === Number(id))
    if (index !== -1) {
      mockFoodItems.splice(index, 1)
    }
    console.log(`Food item with ID ${id} deleted`)
  },
  create: async (data: Partial<FoodItem>): Promise<FoodItem> => {
    const newFoodItem: FoodItem = {
      ...data,
      food_id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: null,
      description: data.description || null,
    } as FoodItem

    mockFoodItems.push(newFoodItem)
    return newFoodItem
  },
  update: async (id: string | number, data: Partial<FoodItem>): Promise<FoodItem> => {
    const index = mockFoodItems.findIndex((f) => f.food_id === Number(id))

    if (index === -1) {
      throw new Error(`Food item with ID ${id} not found`)
    }

    const updatedFoodItem: FoodItem = {
      ...mockFoodItems[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockFoodItems[index] = updatedFoodItem
    return updatedFoodItem
  },
}

// Reference type definition
export interface Reference {
  reference_id: number
  title: string | null
  url: string | null
  source_type: string | null
  authors?: string | null
  publication_date?: string | null
  created_at: string
  updated_at: string | null
}

// Mock data for references
const mockReferences: Reference[] = [
  {
    reference_id: 1,
    title: "Drug Interactions: Principles and Practice",
    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222578/",
    source_type: "journal",
    authors: "Cascorbi I.",
    publication_date: "2012-05-01",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    reference_id: 2,
    title: "Food-Drug Interactions",
    url: "https://www.drugs.com/article/food-drug-interactions.html",
    source_type: "website",
    authors: "Drugs.com",
    publication_date: "2021-01-15",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    reference_id: 3,
    title: "Handbook of Drug Interactions: A Clinical and Forensic Guide",
    url: null,
    source_type: "book",
    authors: "Mozayani A, Raymon L.",
    publication_date: "2011-09-01",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const referenceApi = {
  getAll: async (): Promise<Reference[]> => {
    return mockReferences
  },
  getById: async (id: string | number): Promise<Reference | null> => {
    const reference = mockReferences.find((r) => r.reference_id === Number(id))
    return reference || null
  },
  create: async (data: Partial<Reference>): Promise<Reference> => {
    const newReference: Reference = {
      ...data,
      reference_id: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: null,
      title: data.title || null,
      url: data.url || null,
      source_type: data.source_type || null,
    } as Reference

    mockReferences.push(newReference)
    return newReference
  },
  update: async (id: string | number, data: Partial<Reference>): Promise<Reference> => {
    const index = mockReferences.findIndex((r) => r.reference_id === Number(id))

    if (index === -1) {
      throw new Error(`Reference with ID ${id} not found`)
    }

    const updatedReference: Reference = {
      ...mockReferences[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockReferences[index] = updatedReference
    return updatedReference
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockReferences.findIndex((r) => r.reference_id === Number(id))
    if (index !== -1) {
      mockReferences.splice(index, 1)
    }
  },
}

// Schedule type definition
export interface Schedule {
  ScheduleID: number
  ScheduleName: string
  Description: string | null
  Frequency?: string | null
  created_at?: string
  updated_at?: string | null
}

// Mock data for schedules
const mockSchedules: Schedule[] = [
  {
    ScheduleID: 1,
    ScheduleName: "Once Daily",
    Description: "Take medication once per day",
    Frequency: "daily",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    ScheduleID: 2,
    ScheduleName: "Twice Daily",
    Description: "Take medication twice per day",
    Frequency: "daily",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    ScheduleID: 3,
    ScheduleName: "Weekly",
    Description: "Take medication once per week",
    Frequency: "weekly",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    ScheduleID: 4,
    ScheduleName: "As Needed",
    Description: "Take medication only when needed for symptoms",
    Frequency: "as_needed",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const scheduleApi = {
  getAll: async (): Promise<Schedule[]> => {
    return mockSchedules
  },
  getById: async (id: string | number): Promise<Schedule | null> => {
    const schedule = mockSchedules.find((s) => s.ScheduleID === Number(id))
    return schedule || null
  },
  create: async (data: Partial<Schedule>): Promise<Schedule> => {
    const newSchedule: Schedule = {
      ...data,
      ScheduleID: Math.floor(Math.random() * 1000) + 100,
      ScheduleName: data.ScheduleName || "",
      Description: data.Description || null,
      created_at: new Date().toISOString(),
      updated_at: null,
    } as Schedule

    mockSchedules.push(newSchedule)
    return newSchedule
  },
  update: async (id: string | number, data: Partial<Schedule>): Promise<Schedule> => {
    const index = mockSchedules.findIndex((s) => s.ScheduleID === Number(id))

    if (index === -1) {
      throw new Error(`Schedule with ID ${id} not found`)
    }

    const updatedSchedule: Schedule = {
      ...mockSchedules[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockSchedules[index] = updatedSchedule
    return updatedSchedule
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockSchedules.findIndex((s) => s.ScheduleID === Number(id))
    if (index !== -1) {
      mockSchedules.splice(index, 1)
    }
  },
}

// User type definition
export interface User {
  user_id: number
  email: string
  password_hash: string
  full_name: string | null
  is_admin: boolean
  created_at: string
  updated_at?: string | null
}

// Mock data for users
const mockUsers: User[] = [
  {
    user_id: 1,
    email: "admin@example.com",
    password_hash: "hashed_password_here",
    full_name: "Admin User",
    is_admin: true,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    user_id: 2,
    email: "pharmacist@example.com",
    password_hash: "hashed_password_here",
    full_name: "John Pharmacist",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    user_id: 3,
    email: "student@example.com",
    password_hash: "hashed_password_here",
    full_name: "Jane Student",
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const userApi = {
  getAll: async (): Promise<User[]> => {
    return mockUsers
  },
  getById: async (id: string | number): Promise<User | null> => {
    const user = mockUsers.find((u) => u.user_id === Number(id))
    return user || null
  },
  create: async (data: Partial<User>): Promise<User> => {
    const newUser: User = {
      ...data,
      user_id: Math.floor(Math.random() * 1000) + 100,
      email: data.email || "",
      password_hash: data.password_hash || "hashed_password_here",
      full_name: data.full_name || null,
      is_admin: data.is_admin || false,
      created_at: new Date().toISOString(),
      updated_at: null,
    } as User

    mockUsers.push(newUser)
    return newUser
  },
  update: async (id: string | number, data: Partial<User>): Promise<User> => {
    const index = mockUsers.findIndex((u) => u.user_id === Number(id))

    if (index === -1) {
      throw new Error(`User with ID ${id} not found`)
    }

    const updatedUser: User = {
      ...mockUsers[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockUsers[index] = updatedUser
    return updatedUser
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockUsers.findIndex((u) => u.user_id === Number(id))
    if (index !== -1) {
      mockUsers.splice(index, 1)
    }
  },
}

// Drug-Drug Interaction type definition
export interface DrugDrugInteraction {
  dd_interaction_id: number
  medication1_id: number
  medication2_id: number
  severity: string | null
  description: string | null
  recommendation: string | null
  created_at: string
  updated_at: string | null
  medication1_name?: string
  medication2_name?: string
}

// Mock data for drug-drug interactions
const mockDrugDrugInteractions: DrugDrugInteraction[] = [
  {
    dd_interaction_id: 1,
    medication1_id: 1,
    medication2_id: 2,
    severity: "Moderate",
    description: "Increased risk of gastrointestinal bleeding when aspirin is taken with ibuprofen",
    recommendation: "Avoid concurrent use if possible. If necessary, monitor for signs of bleeding.",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication1_name: "Aspirin",
    medication2_name: "Ibuprofen",
  },
  {
    dd_interaction_id: 2,
    medication1_id: 3,
    medication2_id: 5,
    severity: "Minor",
    description: "Metformin may slightly reduce the cholesterol-lowering effect of atorvastatin",
    recommendation: "No intervention typically required. Monitor lipid levels as usual.",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication1_name: "Metformin",
    medication2_name: "Atorvastatin",
  },
  {
    dd_interaction_id: 3,
    medication1_id: 4,
    medication2_id: 5,
    severity: "Major",
    description: "Increased risk of myopathy and rhabdomyolysis when lisinopril is taken with atorvastatin",
    recommendation: "Consider alternative statin or lower dose. Monitor for muscle pain and weakness.",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication1_name: "Lisinopril",
    medication2_name: "Atorvastatin",
  },
]

export const drugDrugInteractionApi = {
  getAll: async (): Promise<DrugDrugInteraction[]> => {
    return mockDrugDrugInteractions
  },
  getById: async (id: string | number): Promise<DrugDrugInteraction | null> => {
    const interaction = mockDrugDrugInteractions.find((i) => i.dd_interaction_id === Number(id))
    return interaction || null
  },
  create: async (data: Partial<DrugDrugInteraction>): Promise<DrugDrugInteraction> => {
    // Get medication names for the interaction
    let medication1_name = ""
    let medication2_name = ""

    if (data.medication1_id) {
      const med1 = mockMedications.find((m) => m.medication_id === Number(data.medication1_id))
      if (med1) medication1_name = med1.name
    }

    if (data.medication2_id) {
      const med2 = mockMedications.find((m) => m.medication_id === Number(data.medication2_id))
      if (med2) medication2_name = med2.name
    }

    const newInteraction: DrugDrugInteraction = {
      ...data,
      dd_interaction_id: Math.floor(Math.random() * 1000) + 100,
      medication1_id: Number(data.medication1_id) || 0,
      medication2_id: Number(data.medication2_id) || 0,
      severity: data.severity || null,
      description: data.description || null,
      recommendation: data.recommendation || null,
      created_at: new Date().toISOString(),
      updated_at: null,
      medication1_name,
      medication2_name,
    } as DrugDrugInteraction

    mockDrugDrugInteractions.push(newInteraction)
    return newInteraction
  },
  update: async (id: string | number, data: Partial<DrugDrugInteraction>): Promise<DrugDrugInteraction> => {
    const index = mockDrugDrugInteractions.findIndex((i) => i.dd_interaction_id === Number(id))

    if (index === -1) {
      throw new Error(`Drug-drug interaction with ID ${id} not found`)
    }

    // Update medication names if IDs changed
    let medication1_name = mockDrugDrugInteractions[index].medication1_name
    let medication2_name = mockDrugDrugInteractions[index].medication2_name

    if (data.medication1_id) {
      const med1 = mockMedications.find((m) => m.medication_id === Number(data.medication1_id))
      if (med1) medication1_name = med1.name
    }

    if (data.medication2_id) {
      const med2 = mockMedications.find((m) => m.medication_id === Number(data.medication2_id))
      if (med2) medication2_name = med2.name
    }

    const updatedInteraction: DrugDrugInteraction = {
      ...mockDrugDrugInteractions[index],
      ...data,
      medication1_name,
      medication2_name,
      updated_at: new Date().toISOString(),
    }

    mockDrugDrugInteractions[index] = updatedInteraction
    return updatedInteraction
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockDrugDrugInteractions.findIndex((i) => i.dd_interaction_id === Number(id))
    if (index !== -1) {
      mockDrugDrugInteractions.splice(index, 1)
    }
  },
}

// Complementary Medicine type definition
export interface ComplementaryMedicine {
  compl_med_id: number
  name: string
  description: string | null
  evidence_level?: string | null
  common_uses?: string | null
  safety_concerns?: string | null
  created_at: string
  updated_at: string | null
}

// Mock data for complementary medicines
const mockComplementaryMedicines: ComplementaryMedicine[] = [
  {
    compl_med_id: 1,
    name: "St. John's Wort",
    description: "Herbal supplement commonly used for depression and anxiety",
    evidence_level: "moderate",
    common_uses: "Depression, anxiety, sleep disorders",
    safety_concerns:
      "Can reduce effectiveness of many medications including birth control pills, anticoagulants, and immunosuppressants",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    compl_med_id: 2,
    name: "Ginkgo Biloba",
    description: "Herbal supplement used for cognitive function and memory",
    evidence_level: "low",
    common_uses: "Memory enhancement, cognitive function, circulation",
    safety_concerns: "May increase risk of bleeding when taken with anticoagulants",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    compl_med_id: 3,
    name: "Echinacea",
    description: "Herbal supplement used to boost the immune system",
    evidence_level: "low",
    common_uses: "Common cold prevention, immune support",
    safety_concerns: "May interfere with immunosuppressant medications",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    compl_med_id: 4,
    name: "Garlic Supplements",
    description: "Concentrated garlic extract used for cardiovascular health",
    evidence_level: "moderate",
    common_uses: "Cholesterol reduction, blood pressure management",
    safety_concerns: "May increase risk of bleeding when taken with anticoagulants",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
  {
    compl_med_id: 5,
    name: "Melatonin",
    description: "Hormone supplement used for sleep regulation",
    evidence_level: "high",
    common_uses: "Insomnia, jet lag, sleep cycle regulation",
    safety_concerns: "May interact with sedatives, blood thinners, and immunosuppressants",
    created_at: new Date().toISOString(),
    updated_at: null,
  },
]

export const complementaryMedicineApi = {
  getAll: async (): Promise<ComplementaryMedicine[]> => {
    return mockComplementaryMedicines
  },
  getById: async (id: string | number): Promise<ComplementaryMedicine | null> => {
    const medicine = mockComplementaryMedicines.find((m) => m.compl_med_id === Number(id))
    return medicine || null
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockComplementaryMedicines.findIndex((m) => m.compl_med_id === Number(id))
    if (index !== -1) {
      mockComplementaryMedicines.splice(index, 1)
    }
    console.log(`Complementary medicine with ID ${id} deleted`)
  },
  create: async (data: Partial<ComplementaryMedicine>): Promise<ComplementaryMedicine> => {
    const newMedicine: ComplementaryMedicine = {
      ...data,
      compl_med_id: Math.floor(Math.random() * 1000) + 100,
      name: data.name || "",
      description: data.description || null,
      created_at: new Date().toISOString(),
      updated_at: null,
    } as ComplementaryMedicine

    mockComplementaryMedicines.push(newMedicine)
    return newMedicine
  },
  update: async (id: string | number, data: Partial<ComplementaryMedicine>): Promise<ComplementaryMedicine> => {
    const index = mockComplementaryMedicines.findIndex((m) => m.compl_med_id === Number(id))

    if (index === -1) {
      throw new Error(`Complementary medicine with ID ${id} not found`)
    }

    const updatedMedicine: ComplementaryMedicine = {
      ...mockComplementaryMedicines[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    mockComplementaryMedicines[index] = updatedMedicine
    return updatedMedicine
  },
}

// Drug-Food Interaction type definition
export interface DrugFoodInteraction {
  df_interaction_id: number
  medication_id: number
  food_id: number
  severity: string | null
  description: string | null
  recommendation: string | null
  created_at: string
  updated_at: string | null
  medication_name: string
  food_name: string
}

// Mock data for drug-food interactions
const mockDrugFoodInteractions: DrugFoodInteraction[] = [
  {
    df_interaction_id: 1,
    medication_id: 1,
    food_id: 1,
    severity: "Moderate",
    description: "Grapefruit may decrease absorption of aspirin",
    recommendation: "Take medication 1 hour before or 2 hours after consuming grapefruit",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Aspirin",
    food_name: "Grapefruit",
  },
  {
    df_interaction_id: 2,
    medication_id: 2,
    food_id: 2,
    severity: "Major",
    description: "Alcohol increases risk of gastrointestinal bleeding with ibuprofen",
    recommendation: "Avoid alcohol when taking ibuprofen",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Ibuprofen",
    food_name: "Alcohol",
  },
  {
    df_interaction_id: 3,
    medication_id: 3,
    food_id: 3,
    severity: "Minor",
    description: "Dairy products may slightly reduce absorption of metformin",
    recommendation: "Take metformin 1 hour before or 2 hours after consuming dairy products",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Metformin",
    food_name: "Dairy Products",
  },
  {
    df_interaction_id: 4,
    medication_id: 4,
    food_id: 4,
    severity: "Moderate",
    description: "Leafy greens high in vitamin K may reduce effectiveness of lisinopril",
    recommendation: "Maintain consistent intake of vitamin K-rich foods",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Lisinopril",
    food_name: "Leafy Greens",
  },
]

export const drugFoodInteractionApi = {
  getAll: async (): Promise<DrugFoodInteraction[]> => {
    return mockDrugFoodInteractions
  },
  getById: async (id: string | number): Promise<DrugFoodInteraction | null> => {
    const interaction = mockDrugFoodInteractions.find((i) => i.df_interaction_id === Number(id))
    return interaction || null
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockDrugFoodInteractions.findIndex((i) => i.df_interaction_id === Number(id))
    if (index !== -1) {
      mockDrugFoodInteractions.splice(index, 1)
    }
    console.log(`Drug-food interaction with ID ${id} deleted`)
  },
  create: async (data: Partial<DrugFoodInteraction>): Promise<DrugFoodInteraction> => {
    // Get medication and food names
    let medication_name = ""
    let food_name = ""

    if (data.medication_id) {
      const med = mockMedications.find((m) => m.medication_id === Number(data.medication_id))
      if (med) medication_name = med.name
    }

    if (data.food_id) {
      const food = mockFoodItems.find((f) => f.food_id === Number(data.food_id))
      if (food) food_name = food.name
    }

    const newInteraction: DrugFoodInteraction = {
      ...data,
      df_interaction_id: Math.floor(Math.random() * 1000) + 100,
      medication_id: Number(data.medication_id) || 0,
      food_id: Number(data.food_id) || 0,
      severity: data.severity || null,
      description: data.description || null,
      recommendation: data.recommendation || null,
      created_at: new Date().toISOString(),
      updated_at: null,
      medication_name,
      food_name,
    } as DrugFoodInteraction

    mockDrugFoodInteractions.push(newInteraction)
    return newInteraction
  },
  update: async (id: string | number, data: Partial<DrugFoodInteraction>): Promise<DrugFoodInteraction> => {
    const index = mockDrugFoodInteractions.findIndex((i) => i.df_interaction_id === Number(id))

    if (index === -1) {
      throw new Error(`Drug-food interaction with ID ${id} not found`)
    }

    // Update names if IDs changed
    let medication_name = mockDrugFoodInteractions[index].medication_name
    let food_name = mockDrugFoodInteractions[index].food_name

    if (data.medication_id) {
      const med = mockMedications.find((m) => m.medication_id === Number(data.medication_id))
      if (med) medication_name = med.name
    }

    if (data.food_id) {
      const food = mockFoodItems.find((f) => f.food_id === Number(data.food_id))
      if (food) food_name = food.name
    }

    const updatedInteraction: DrugFoodInteraction = {
      ...mockDrugFoodInteractions[index],
      ...data,
      medication_name,
      food_name,
      updated_at: new Date().toISOString(),
    }

    mockDrugFoodInteractions[index] = updatedInteraction
    return updatedInteraction
  },
}

// Drug-Complementary Interaction type definition
export interface DrugComplementaryInteraction {
  dc_interaction_id: number
  medication_id: number
  compl_med_id: number
  severity: string | null
  description: string | null
  recommendation: string | null
  created_at: string
  updated_at: string | null
  medication_name: string
  complementary_name: string
}

// Mock data for drug-complementary interactions
const mockDrugComplementaryInteractions: DrugComplementaryInteraction[] = [
  {
    dc_interaction_id: 1,
    medication_id: 1,
    compl_med_id: 1,
    severity: "Major",
    description: "St. John's Wort may decrease effectiveness of aspirin",
    recommendation: "Avoid concurrent use",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Aspirin",
    complementary_name: "St. John's Wort",
  },
  {
    dc_interaction_id: 2,
    medication_id: 2,
    compl_med_id: 2,
    severity: "Moderate",
    description: "Ginkgo Biloba may increase risk of bleeding with ibuprofen",
    recommendation: "Monitor for signs of bleeding",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Ibuprofen",
    complementary_name: "Ginkgo Biloba",
  },
  {
    dc_interaction_id: 3,
    medication_id: 3,
    compl_med_id: 3,
    severity: "Minor",
    description: "Echinacea may affect blood glucose levels when taken with metformin",
    recommendation: "Monitor blood glucose more frequently",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Metformin",
    complementary_name: "Echinacea",
  },
  {
    dc_interaction_id: 4,
    medication_id: 4,
    compl_med_id: 4,
    severity: "Moderate",
    description: "Garlic supplements may enhance the blood pressure-lowering effect of lisinopril",
    recommendation: "Monitor blood pressure regularly",
    created_at: new Date().toISOString(),
    updated_at: null,
    medication_name: "Lisinopril",
    complementary_name: "Garlic Supplements",
  },
]

export const drugComplementaryInteractionApi = {
  getAll: async (): Promise<DrugComplementaryInteraction[]> => {
    return mockDrugComplementaryInteractions
  },
  getById: async (id: string | number): Promise<DrugComplementaryInteraction | null> => {
    const interaction = mockDrugComplementaryInteractions.find((i) => i.dc_interaction_id === Number(id))
    return interaction || null
  },
  delete: async (id: string | number): Promise<void> => {
    const index = mockDrugComplementaryInteractions.findIndex((i) => i.dc_interaction_id === Number(id))
    if (index !== -1) {
      mockDrugComplementaryInteractions.splice(index, 1)
    }
    console.log(`Drug-complementary interaction with ID ${id} deleted`)
  },
  create: async (data: Partial<DrugComplementaryInteraction>): Promise<DrugComplementaryInteraction> => {
    // Get medication and complementary medicine names
    let medication_name = ""
    let complementary_name = ""

    if (data.medication_id) {
      const med = mockMedications.find((m) => m.medication_id === Number(data.medication_id))
      if (med) medication_name = med.name
    }

    if (data.compl_med_id) {
      const compl = mockComplementaryMedicines.find((c) => c.compl_med_id === Number(data.compl_med_id))
      if (compl) complementary_name = compl.name
    }

    const newInteraction: DrugComplementaryInteraction = {
      ...data,
      dc_interaction_id: Math.floor(Math.random() * 1000) + 100,
      medication_id: Number(data.medication_id) || 0,
      compl_med_id: Number(data.compl_med_id) || 0,
      severity: data.severity || null,
      description: data.description || null,
      recommendation: data.recommendation || null,
      created_at: new Date().toISOString(),
      updated_at: null,
      medication_name,
      complementary_name,
    } as DrugComplementaryInteraction

    mockDrugComplementaryInteractions.push(newInteraction)
    return newInteraction
  },
  update: async (
    id: string | number,
    data: Partial<DrugComplementaryInteraction>,
  ): Promise<DrugComplementaryInteraction> => {
    const index = mockDrugComplementaryInteractions.findIndex((i) => i.dc_interaction_id === Number(id))

    if (index === -1) {
      throw new Error(`Drug-complementary interaction with ID ${id} not found`)
    }

    // Update names if IDs changed
    let medication_name = mockDrugComplementaryInteractions[index].medication_name
    let complementary_name = mockDrugComplementaryInteractions[index].complementary_name

    if (data.medication_id) {
      const med = mockMedications.find((m) => m.medication_id === Number(data.medication_id))
      if (med) medication_name = med.name
    }

    if (data.compl_med_id) {
      const compl = mockComplementaryMedicines.find((c) => c.compl_med_id === Number(data.compl_med_id))
      if (compl) complementary_name = compl.name
    }

    const updatedInteraction: DrugComplementaryInteraction = {
      ...mockDrugComplementaryInteractions[index],
      ...data,
      medication_name,
      complementary_name,
      updated_at: new Date().toISOString(),
    }

    mockDrugComplementaryInteractions[index] = updatedInteraction
    return updatedInteraction
  },
}

