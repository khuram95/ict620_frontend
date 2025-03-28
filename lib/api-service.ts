// Comprehensive API service with dummy data for all entities

import axios, { AxiosResponse } from "axios";

// Define your base URL. Adjust as necessary.
const API_BASE_URL = "http://localhost:8000/api";

// Optionally, create an Axios instance to automatically attach authentication headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

/// inerceptor for the apiClient
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Dashboard APi
export const dashboardApi = {
  getAll: (): Promise<AxiosResponse> =>
    apiClient.get("/dashboard"),
};

export const userApi = {
  getAll: (): Promise<AxiosResponse> =>
    apiClient.get("/users"),
  getOne: (id: number): Promise<AxiosResponse> =>
    apiClient.get(`/users/${id}`),
  create: (data: any): Promise<AxiosResponse> =>
    apiClient.post("/users/", data),
  update: (id: number, data: any): Promise<AxiosResponse> =>
    apiClient.put(`/users/${id}`, data),
  delete: (id: number): Promise<AxiosResponse> =>
    apiClient.delete(`/users/${id}`),
  login: (email: string, password: string): Promise<AxiosResponse> =>
    apiClient.post("/login/", { email, password }),
};

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

export const medicationApi = {
  // Get all medications
  getAll: (): Promise<AxiosResponse<Medication[]>> =>
    apiClient.get("/medications/"),

  // Get medication by ID
  getById: (id: string | number): Promise<AxiosResponse<Medication>> =>
    apiClient.get(`/medications/${id}`),

  // Create a new medication
  create: (data: Partial<Medication>): Promise<AxiosResponse<Medication>> =>
    apiClient.post("/medications/", data),

  // Update an existing medication
  update: (id: string | number, data: Partial<Medication>): Promise<AxiosResponse<Medication>> =>
    apiClient.put(`/medications/${id}`, data),

  // Delete a medication
  delete: (id: string | number): Promise<AxiosResponse> =>
    apiClient.delete(`/medications/${id}`),
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
  // Get all allergies
  getAll: (): Promise<AxiosResponse<Allergy[]>> => apiClient.get("/allergies/"),

  // Get allergy by ID
  getById: (id: string | number): Promise<AxiosResponse<Allergy>> =>
    apiClient.get(`/allergies/${id}`),

  // Create a new allergy
  create: (data: Partial<Allergy>): Promise<AxiosResponse<Allergy>> =>
    apiClient.post("/allergies/", data),

  // Update an existing allergy
  update: (id: string | number, data: Partial<Allergy>): Promise<AxiosResponse<Allergy>> =>
    apiClient.put(`/allergies/${id}`, data),

  // Delete an allergy
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/allergies/${id}`),
};

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
  // Get all food items
  getAll: (): Promise<AxiosResponse<FoodItem[]>> => apiClient.get("/food_items/"),

  // Get food item by ID
  getById: (id: string | number): Promise<AxiosResponse<FoodItem>> =>
    apiClient.get(`/food_items/${id}`),

  // Create a new food item
  create: (data: Partial<FoodItem>): Promise<AxiosResponse<FoodItem>> =>
    apiClient.post("/food_items/", data),

  // Update an existing food item
  update: (id: string | number, data: Partial<FoodItem>): Promise<AxiosResponse<FoodItem>> =>
    apiClient.put(`/food_items/${id}`, data),

  // Delete a food item
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/food_items/${id}`),
};

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
  // Get all references
  getAll: (): Promise<AxiosResponse<Reference[]>> => apiClient.get("/references/"),

  // Get reference by ID
  getById: (id: string | number): Promise<AxiosResponse<Reference>> =>
    apiClient.get(`/references/${id}`),

  // Create a new reference
  create: (data: Partial<Reference>): Promise<AxiosResponse<Reference>> =>
    apiClient.post("/references/", data),

  // Update an existing reference
  update: (id: string | number, data: Partial<Reference>): Promise<AxiosResponse<Reference>> =>
    apiClient.put(`/references/${id}`, data),

  // Delete a reference
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/references/${id}`),
};


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
  // Get all schedules
  getAll: (): Promise<AxiosResponse<Schedule[]>> => apiClient.get("/schedules/"),

  // Get schedule by ID
  getById: (id: string | number): Promise<AxiosResponse<Schedule>> =>
    apiClient.get(`/schedules/${id}`),

  // Create a new schedule
  create: (data: Partial<Schedule>): Promise<AxiosResponse<Schedule>> =>
    apiClient.post("/schedules/", data),

  // Update an existing schedule
  update: (id: string | number, data: Partial<Schedule>): Promise<AxiosResponse<Schedule>> =>
    apiClient.put(`/schedules/${id}`, data),

  // Delete a schedule
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/schedules/${id}`),
};

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
  // Get all drug-drug interactions
  getAll: (): Promise<AxiosResponse<DrugDrugInteraction[]>> =>
    apiClient.get("/interactions/drug_drug/"),

  // Get drug-drug interaction by ID
  getById: (id: string | number): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.get(`/interactions/drug_drug/${id}`),

  // Create a new drug-drug interaction
  create: (data: Partial<DrugDrugInteraction>): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.post("/interactions/drug_drug/", data),

  // Update an existing drug-drug interaction
  update: (id: string | number, data: Partial<DrugDrugInteraction>): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.put(`/interactions/drug_drug/${id}`, data),

  // Delete a drug-drug interaction
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/interactions/drug_drug/${id}`),
};


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
  // Get all complementary medicines
  getAll: (): Promise<AxiosResponse<ComplementaryMedicine[]>> => apiClient.get("/complementary_medicines/"),

  // Get complementary medicine by ID
  getById: (id: string | number): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.get(`/complementary_medicines/${id}`),

  // Create a new complementary medicine
  create: (data: Partial<ComplementaryMedicine>): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.post("/complementary_medicines/", data),

  // Update an existing complementary medicine
  update: (id: string | number, data: Partial<ComplementaryMedicine>): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.put(`/complementary_medicines/${id}`, data),

  // Delete a complementary medicine
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/complementary_medicines/${id}`),
};

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

