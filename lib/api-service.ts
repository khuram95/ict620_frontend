// src/services/api.ts

import axios, { AxiosInstance, AxiosResponse } from "axios";

// Define your base URL. Adjust as necessary.
// IMPORTANT: Use environment variables for production (e.g., process.env.NEXT_PUBLIC_API_URL)
// Ensure this URL points to your *Flask backend* (likely port 5000 or similar, not 8000).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"; // ADJUST PORT IF NEEDED

// Create an Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Authorization token if available
apiClient.interceptors.request.use(
  (config) => {
    // Check if running on client-side before accessing localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        // Ensure the header key matches what your backend expects
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// --- Interfaces (Matching Backend Models/Responses) ---

export interface Medication {
  medication_id: number;
  name: string;
  description?: string | null;
  reference_url?: string | null;
  indications?: string | null;
  counselling?: string | null;
  adverse_effect?: string | null;
  practice_points?: string | null;
  schedules?: number[];
  created_at?: string;
  updated_at?: string | null;
}

export interface Allergy {
  allergy_id: number;
  name: string;
  description?: string | null;
  severity?: string | null;
  symptoms?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface FoodItem {
  food_id: number;
  name: string;
  description?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface Reference {
  reference_id: number;
  medication_id: string;
  title?: string | null;
  url?: string | null;
  source_type?: string | null;
  authors?: string | null;
  publication_date?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface Schedule {
  // Assuming snake_case from Flask backend
  schedule_id: number; // Changed from ScheduleID
  schedule_name: string; // Changed from ScheduleName
  description?: string | null; // Changed from Description
  frequency?: string | null; // Changed from Frequency
  created_at?: string;
  updated_at?: string | null;
}

export interface User {
  user_id: number;
  email: string;
  // password_hash should NOT be sent to frontend
  full_name?: string | null;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface DrugDrugInteraction {
  dd_interaction_id: number;
  medication1_id: number;
  medication2_id: number;
  severity?: string | null;
  description?: string | null;
  recommendation?: string | null;
  created_at?: string;
  updated_at?: string | null;
  medication1_name?: string; // Included from backend join
  medication2_name?: string; // Included from backend join
}

export interface DrugFoodInteraction {
  df_interaction_id: number;
  medication_id: number;
  food_id: number;
  severity?: string | null;
  description?: string | null;
  recommendation?: string | null;
  created_at?: string;
  updated_at?: string | null;
  medication_name?: string; // Included from backend join
  food_name?: string; // Included from backend join
}

export interface ComplementaryMedicine {
  compl_med_id: number;
  name: string;
  description?: string | null;
  evidence_level?: string | null;
  common_uses?: string | null;
  safety_concerns?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface DrugComplementaryInteraction {
  dc_interaction_id: number;
  medication_id: number;
  compl_med_id: number;
  severity?: string | null;
  description?: string | null;
  recommendation?: string | null;
  created_at?: string;
  updated_at?: string | null;
  medication_name?: string; // Included from backend join
  complementary_medicine_name?: string; // Corrected to match Flask backend label
}

// --- Interface for the Interaction Check API ---
export interface InteractionCheckPayload {
  drug_ids: (number | string)[]; // Allow string IDs if needed
  food_ids: (number | string)[];
  comp_ids: (number | string)[];
}

export interface InteractionCheckResponse {
  drug_drug: DrugDrugInteraction[];
  drug_food: DrugFoodInteraction[];
  drug_complementary: DrugComplementaryInteraction[];
}

// --- API Function Objects ---

export const dashboardApi = {
  // Specify return type if known
  getAll: (): Promise<AxiosResponse<any>> => apiClient.get("/dashboard/"),
};

export const userApi = {
  getAll: (params?: any): Promise<AxiosResponse<User[]>> =>
    apiClient.get("/users/", { params }),
  getOne: (id: number | string): Promise<AxiosResponse<User>> =>
    apiClient.get(`/users/${id}`),
  // Use Partial<User> for create/update data types for better type safety
  create: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    apiClient.post("/users/", data),
  update: (
    id: number | string,
    data: Partial<User>
  ): Promise<AxiosResponse<User>> => apiClient.put(`/users/${id}`, data),
  delete: (id: number | string): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/users/${id}`),
  login: (data: {
    email: string;
    password: string;
  }): Promise<AxiosResponse<{ token: string; user: User }>> =>
    apiClient.post("/login/", data),
};

export const medicationApi = {
  getAll: (params?: any): Promise<AxiosResponse<Medication[]>> =>
    apiClient.get("/medications/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<Medication>> =>
    apiClient.get(`/medications/${id}`),
  create: (data: Partial<Medication>): Promise<AxiosResponse<Medication>> =>
    apiClient.post("/medications/", data),
  update: (
    id: string | number,
    data: Partial<Medication>
  ): Promise<AxiosResponse<Medication>> =>
    apiClient.put(`/medications/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/medications/${id}`),
};

export const allergyApi = {
  getAll: (params?: any): Promise<AxiosResponse<Allergy[]>> =>
    apiClient.get("/allergies/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<Allergy>> =>
    apiClient.get(`/allergies/${id}`),
  create: (data: Partial<Allergy>): Promise<AxiosResponse<Allergy>> =>
    apiClient.post("/allergies/", data),
  update: (
    id: string | number,
    data: Partial<Allergy>
  ): Promise<AxiosResponse<Allergy>> => apiClient.put(`/allergies/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/allergies/${id}`),
};

export const foodItemApi = {
  getAll: (params?: any): Promise<AxiosResponse<FoodItem[]>> =>
    apiClient.get("/food_items/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<FoodItem>> =>
    apiClient.get(`/food_items/${id}`),
  create: (data: Partial<FoodItem>): Promise<AxiosResponse<FoodItem>> =>
    apiClient.post("/food_items/", data),
  update: (
    id: string | number,
    data: Partial<FoodItem>
  ): Promise<AxiosResponse<FoodItem>> =>
    apiClient.put(`/food_items/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/food_items/${id}`),
};

export const referenceApi = {
  getAll: (params?: any): Promise<AxiosResponse<Reference[]>> =>
    apiClient.get("/references/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<Reference>> =>
    apiClient.get(`/references/${id}`),
  create: (data: Partial<Reference>): Promise<AxiosResponse<Reference>> =>
    apiClient.post("/references/", data),
  update: (
    id: string | number,
    data: Partial<Reference>
  ): Promise<AxiosResponse<Reference>> =>
    apiClient.put(`/references/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/references/${id}`),
};

export const scheduleApi = {
  // Assuming backend route uses plural 'schedules'
  getAll: (params?: any): Promise<AxiosResponse<Schedule[]>> =>
    apiClient.get("/schedules/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<Schedule>> =>
    apiClient.get(`/schedules/${id}`),
  create: (data: Partial<Schedule>): Promise<AxiosResponse<Schedule>> =>
    apiClient.post("/schedules/", data),
  update: (
    id: string | number,
    data: Partial<Schedule>
  ): Promise<AxiosResponse<Schedule>> =>
    apiClient.put(`/schedules/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/schedules/${id}`),
};

export const complementaryMedicineApi = {
  getAll: (params?: any): Promise<AxiosResponse<ComplementaryMedicine[]>> =>
    apiClient.get("/complementary_medicines/", { params }),
  getById: (
    id: string | number
  ): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.get(`/complementary_medicines/${id}`),
  create: (
    data: Partial<ComplementaryMedicine>
  ): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.post("/complementary_medicines/", data),
  update: (
    id: string | number,
    data: Partial<ComplementaryMedicine>
  ): Promise<AxiosResponse<ComplementaryMedicine>> =>
    apiClient.put(`/complementary_medicines/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/complementary_medicines/${id}`),
};

// --- Interaction APIs ---

export const drugDrugInteractionApi = {
  // Uses the /interactions/drug_drug/ route from Flask backend
  getAll: (params?: any): Promise<AxiosResponse<DrugDrugInteraction[]>> =>
    apiClient.get("/interactions/drug_drug/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.get(`/interactions/drug_drug/${id}`),
  create: (
    data: Partial<DrugDrugInteraction>
  ): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.post("/interactions/drug_drug/", data),
  update: (
    id: string | number,
    data: Partial<DrugDrugInteraction>
  ): Promise<AxiosResponse<DrugDrugInteraction>> =>
    apiClient.put(`/interactions/drug_drug/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/interactions/drug_drug/${id}`),
};

export const drugFoodInteractionApi = {
  // Uses the /interactions/drug_food/ route from Flask backend
  getAll: (params?: any): Promise<AxiosResponse<DrugFoodInteraction[]>> =>
    apiClient.get("/interactions/drug_food/", { params }),
  getById: (id: string | number): Promise<AxiosResponse<DrugFoodInteraction>> =>
    apiClient.get(`/interactions/drug_food/${id}`),
  create: (
    data: Partial<DrugFoodInteraction>
  ): Promise<AxiosResponse<DrugFoodInteraction>> =>
    apiClient.post("/interactions/drug_food/", data),
  update: (
    id: string | number,
    data: Partial<DrugFoodInteraction>
  ): Promise<AxiosResponse<DrugFoodInteraction>> =>
    apiClient.put(`/interactions/drug_food/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/interactions/drug_food/${id}`),
};

export const drugComplementaryInteractionApi = {
  // Uses the /interactions/drug_complementary/ route from Flask backend
  getAll: (
    params?: any
  ): Promise<AxiosResponse<DrugComplementaryInteraction[]>> =>
    apiClient.get("/interactions/drug_complementary/", { params }),
  getById: (
    id: string | number
  ): Promise<AxiosResponse<DrugComplementaryInteraction>> =>
    apiClient.get(`/interactions/drug_complementary/${id}`),
  create: (
    data: Partial<DrugComplementaryInteraction>
  ): Promise<AxiosResponse<DrugComplementaryInteraction>> =>
    apiClient.post("/interactions/drug_complementary/", data),
  update: (
    id: string | number,
    data: Partial<DrugComplementaryInteraction>
  ): Promise<AxiosResponse<DrugComplementaryInteraction>> =>
    apiClient.put(`/interactions/drug_complementary/${id}`, data),
  delete: (id: string | number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/interactions/drug_complementary/${id}`),
};

// --- NEW: API for Checking Interactions based on selected items ---
export const interactionsApi = {
  /**
   * Checks for interactions between provided lists of drug, food,
   * and complementary medicine IDs by calling the backend check endpoint.
   * @param payload - Object containing arrays of drug_ids, food_ids, and comp_ids.
   * @returns Promise resolving with the interaction check response.
   */
  check: (
    payload: InteractionCheckPayload
  ): Promise<AxiosResponse<InteractionCheckResponse>> => {
    return apiClient.post<InteractionCheckResponse>(
      "/interactions/check",
      payload
    );
  },
};

// Export the configured apiClient if needed elsewhere (though using the specific api objects is generally preferred)
// export default apiClient;
