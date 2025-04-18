"use client";

import React, { useState, useMemo, useEffect } from "react"; // Added useEffect
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Table,
  LineChart as LineChartIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  DotProps, // Import DotProps for typing the custom dot
} from "recharts";

// --- Interfaces for Data Structure ---
interface TimeSeriesReading {
  date: string; // Format: "YYYY-MM-DD" for easier sorting/charting
  value: number;
  interpretation?: "High" | "Low" | "Normal" | string; // Allow specific strings too
}

interface TestMetric {
  id: string;
  name: string; // e.g., "ALT", "Creatinine", "WBC", "Potassium", "Systolic BP"
  unit: string; // e.g., "U/L", "mg/dL", "x10^9/L", "mEq/L", "mmHg"
  normalRange?: string; // Optional textual representation
  readings: TimeSeriesReading[];
}

interface TestCategory {
  categoryId: string;
  categoryName: string; // e.g., "Liver Function", "Kidney Function", "CBC", "Electrolytes", "Vital Signs"
  metrics: TestMetric[];
}

interface Note {
  id: string;
  date: string;
  text: string;
  author?: string;
}

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string; // Format: "YYYY-MM-DD"
  gender: "Male" | "Female" | "Other";
  testResults: TestCategory[];
  notes: Note[];
}

// --- Helper Functions for Dynamic Data Generation ---

// Utility to format Date object to "YYYY-MM-DD"
function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Utility to parse normal range string into min/max numbers
function parseNormalRange(rangeStr?: string): { min?: number; max?: number } {
  if (!rangeStr) return {};
  // Handle ranges like '< 50'
  if (rangeStr.startsWith("<")) {
    const value = parseFloat(rangeStr.substring(1));
    return isNaN(value) ? {} : { max: value };
  }
  // Handle ranges like '> 10'
  if (rangeStr.startsWith(">")) {
    const value = parseFloat(rangeStr.substring(1));
    return isNaN(value) ? {} : { min: value };
  }
  // Handle standard ranges like '10-40'
  const parts = rangeStr.split("-").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    // Ensure min is less than max if they are swapped
    return {
      min: Math.min(parts[0], parts[1]),
      max: Math.max(parts[0], parts[1]),
    };
  }
  // Handle single number ranges (less common, treat as exact or ignore)
  return {};
}

// Utility to get interpretation based on value and range string
function getInterpretation(
  value: number,
  normalRangeStr?: string,
): "High" | "Low" | "Normal" | undefined {
  const range = parseNormalRange(normalRangeStr); // Use the parser
  if (!range || (range.min === undefined && range.max === undefined))
    return undefined; // No range, no interpretation

  const { min, max } = range;

  if (min !== undefined && value < min) return "Low";
  if (max !== undefined && value > max) return "High";

  // If we haven't returned Low or High, it must be Normal
  return "Normal";
}

// Generates time series readings for a single metric over a given period
function generateTimeSeriesReadings(
  metricId: string,
  unit: string,
  normalRangeStr: string | undefined,
  startDate: Date,
  endDate: Date,
  startValue: number,
  trend: "stable" | "increasing" | "decreasing" | "fluctuating" = "stable",
  variabilityFactor: number = 0.05, // Percentage of startValue for daily random fluctuation
): TimeSeriesReading[] {
  const readings: TimeSeriesReading[] = [];
  const numDays =
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; // +1 to include end date
  if (numDays <= 0) return []; // Avoid issues with invalid date ranges

  const dailyTrendChange =
    trend === "increasing"
      ? startValue * 0.1 / numDays // ~10% total increase over the period
      : trend === "decreasing"
      ? -(startValue * 0.1 / numDays) // ~10% total decrease over the period
      : 0;

  for (let i = 0; i < numDays; i++) {
    const loopDate = new Date(startDate);
    loopDate.setDate(startDate.getDate() + i);

    let trendAdjustedValue = startValue + dailyTrendChange * i;
    if (trend === "fluctuating") {
      // Simple sine wave fluctuation for demonstration, centered around startValue
      trendAdjustedValue =
        startValue * (1 + (Math.sin(i * Math.PI / (numDays / 2)) * 0.1)); // Fluctuates +/- 10% over period
    }

    // Apply random variability based on the *trendAdjustedValue* for more realistic fluctuation
    const randomFluctuation =
      (Math.random() - 0.5) * 2 * (trendAdjustedValue * variabilityFactor); // +/- variabilityFactor %
    let finalValue = trendAdjustedValue + randomFluctuation;

    // Ensure non-negative values where appropriate (e.g., counts, concentrations)
    if (!unit.includes("°C") && !unit.includes("°F")) { // Don't force temp strictly positive if using C/F
      finalValue = Math.max(0, finalValue);
    }

    // Round based on typical precision for the unit
    let roundedValue = finalValue;
    // More specific rounding based on common lab value precision
    if (
      unit === "mg/dL" &&
      normalRangeStr &&
      (normalRangeStr.includes(".") ||
        parseFloat(normalRangeStr.replace(/[<>]/, "").split("-")[0]) < 10)
    ) {
      roundedValue = parseFloat(finalValue.toFixed(1)); // e.g., Bilirubin, Creatinine (often 1 decimal if low)
    } else if (unit === "mEq/L" || unit === "mmol/L" || unit === "g/dL") {
      roundedValue = parseFloat(finalValue.toFixed(1)); // e.g., Electrolytes, Hemoglobin
    } else if (unit === "U/L" || unit === "mIU/L" || unit.includes("x10^")) {
      roundedValue = parseFloat(finalValue.toFixed(1)); // e.g., Enzymes, TSH, Counts (often 1 decimal)
    } else if (unit === "%" || unit === "mmHg" || unit === "bpm") {
      roundedValue = Math.round(finalValue); // e.g., Hct, BP, HR
    } else if (unit === "mg/dL") { // Default for mg/dL like Glucose, Cholesterol, BUN
      roundedValue = Math.round(finalValue);
    } else {
      roundedValue = parseFloat(finalValue.toFixed(2)); // Default: 2 decimals for others
    }

    // Ensure the rounded value is not negative unless it's temperature
    if (!unit.includes("°C") && !unit.includes("°F")) {
      roundedValue = Math.max(0, roundedValue);
    }

    readings.push({
      date: formatDateISO(loopDate),
      value: roundedValue,
      interpretation: getInterpretation(roundedValue, normalRangeStr), // Use the interpretation function
    });
  }

  return readings;
}

// Generates a single TestMetric with data for the period
function generateMetric(
  id: string,
  name: string,
  unit: string,
  normalRange: string | undefined,
  startValue: number, // Approx value at the beginning of the period
  trend: "stable" | "increasing" | "decreasing" | "fluctuating" = "stable",
  variabilityFactor: number = 0.05,
  startDate: Date,
  endDate: Date,
): TestMetric {
  return {
    id,
    name,
    unit,
    normalRange,
    readings: generateTimeSeriesReadings(
      id,
      unit,
      normalRange,
      startDate,
      endDate,
      startValue,
      trend,
      variabilityFactor,
    ),
  };
}

// Interface for metric generation configuration
interface MetricConfig {
  id: string;
  name: string;
  unit: string;
  normalRange?: string;
  startValue: number;
  trend?: "stable" | "increasing" | "decreasing" | "fluctuating";
  variabilityFactor?: number;
}

// Generates a TestCategory with multiple metrics
function generateCategory(
  categoryId: string,
  categoryName: string,
  metricConfigs: MetricConfig[],
  startDate: Date,
  endDate: Date,
): TestCategory {
  return {
    categoryId,
    categoryName,
    metrics: metricConfigs.map((config) =>
      generateMetric(
        config.id,
        config.name,
        config.unit,
        config.normalRange,
        config.startValue,
        config.trend || "stable",
        config.variabilityFactor === undefined
          ? 0.05
          : config.variabilityFactor, // Use default if undefined
        startDate,
        endDate,
      )
    ),
  };
}

// Generates basic random notes
function generateNotes(
  patientId: string,
  count: number,
  startDate: Date,
  endDate: Date,
): Note[] {
  const notes: Note[] = [];
  const authors = [
    "Dr. Adams",
    "Dr. Baker",
    "Nurse Charlie",
    "Dr. Davis",
    "Dr. Evans",
  ];
  const subjects = [
    "Routine checkup",
    "Follow-up visit",
    "Condition monitoring",
    "New symptom reported",
    "Test results review",
    "Medication adjustment",
  ];
  const findings = [
    "stable",
    "showing improvement",
    "slightly worsening",
    "unchanged",
    "requires further investigation",
    "within normal limits",
    "responding well to treatment",
  ];
  const plans = [
    "Continue current management.",
    "Adjust medication dosage.",
    "Schedule follow-up appointment.",
    "Order further tests.",
    "Provide patient education.",
    "Refer to specialist.",
  ];

  // Ensure start date is before end date for random date generation
  if (startDate.getTime() >= endDate.getTime()) {
    console.error("Start date must be before end date for note generation.");
    return [];
  }
  const timeDiff = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    const randomTimestamp = startDate.getTime() + Math.random() * timeDiff;
    const noteDate = new Date(randomTimestamp);
    notes.push({
      id: `${patientId}-n${i + 1}`,
      date: formatDateISO(noteDate),
      text: `Patient seen for ${
        subjects[Math.floor(Math.random() * subjects.length)]
      }. Current status noted as ${
        findings[Math.floor(Math.random() * findings.length)]
      }. Plan: ${plans[Math.floor(Math.random() * plans.length)]}`,
      author: authors[Math.floor(Math.random() * authors.length)],
    });
  }
  // Sort newest first for display consistency
  return notes.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

// --- Main Patient Data Generation Function ---
interface CategoryConfig {
  categoryId: string;
  categoryName: string;
  metricConfigs: MetricConfig[];
}

interface PatientConfig {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  categoryConfigs: CategoryConfig[];
  noteCount?: number;
}

function generatePatientData(
  patientConfigs: PatientConfig[],
  days: number = 30,
): Patient[] {
  const endDate = new Date(); // Today
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1)); // Go back `days - 1` days to get a total of `days`

  // Ensure startDate is not in the future relative to endDate if 'days' is negative/zero
  if (startDate.getTime() > endDate.getTime()) {
    startDate.setTime(endDate.getTime() - (30 - 1) * 24 * 60 * 60 * 1000); // Default to 30 days if input is invalid
    console.warn(
      `Invalid number of days (${days}) provided. Defaulting to 30 days.`,
    );
  }

  return patientConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    dateOfBirth: config.dateOfBirth,
    gender: config.gender,
    testResults: config.categoryConfigs.map((catConfig) =>
      generateCategory(
        catConfig.categoryId,
        catConfig.categoryName,
        catConfig.metricConfigs,
        startDate,
        endDate,
      )
    ),
    notes: generateNotes(
      config.id,
      config.noteCount || 3,
      startDate,
      endDate,
    ),
  }));
}

// --- Patient Configurations for Generation ---
const patientConfigurations: PatientConfig[] = [
  // Patient 1: Simulating John Smith - Elevated Liver/Kidney, Low Hb/Hct, High K+ initially, improving lipids
  {
    id: "p001",
    name: "John Smith",
    dateOfBirth: "1999-01-15",
    gender: "Male",
    noteCount: 4,
    categoryConfigs: [
      {
        categoryId: "liver",
        categoryName: "Liver Function",
        metricConfigs: [
          {
            id: "alt",
            name: "ALT",
            unit: "U/L",
            normalRange: "10-40",
            startValue: 50,
            trend: "fluctuating",
            variabilityFactor: 0.08,
          },
          {
            id: "ast",
            name: "AST",
            unit: "U/L",
            normalRange: "10-35",
            startValue: 45,
            trend: "fluctuating",
            variabilityFactor: 0.08,
          },
          {
            id: "alp",
            name: "Alkaline Phosphatase",
            unit: "U/L",
            normalRange: "40-130",
            startValue: 135,
            trend: "decreasing",
            variabilityFactor: 0.06,
          },
          {
            id: "bili",
            name: "Total Bilirubin",
            unit: "mg/dL",
            normalRange: "0.1-1.2",
            startValue: 1.3,
            trend: "decreasing",
            variabilityFactor: 0.1,
          },
        ],
      },
      {
        categoryId: "kidney",
        categoryName: "Kidney Function",
        metricConfigs: [
          {
            id: "creatinine",
            name: "Creatinine",
            unit: "mg/dL",
            normalRange: "0.6-1.2",
            startValue: 1.6,
            trend: "decreasing",
            variabilityFactor: 0.07,
          },
          {
            id: "bun",
            name: "BUN",
            unit: "mg/dL",
            normalRange: "7-20",
            startValue: 28,
            trend: "decreasing",
            variabilityFactor: 0.1,
          },
        ],
      },
      {
        categoryId: "cbc",
        categoryName: "Complete Blood Count (CBC)",
        metricConfigs: [
          {
            id: "wbc",
            name: "WBC",
            unit: "x10^9/L",
            normalRange: "4-11",
            startValue: 12,
            trend: "decreasing",
            variabilityFactor: 0.1,
          },
          {
            id: "hb",
            name: "Hemoglobin",
            unit: "g/dL",
            normalRange: "13.5-17.5",
            startValue: 9.2,
            trend: "increasing",
            variabilityFactor: 0.04,
          },
          {
            id: "rbc",
            name: "RBC",
            unit: "x10^12/L",
            normalRange: "4.7-6.1",
            startValue: 3.3,
            trend: "increasing",
            variabilityFactor: 0.04,
          },
          {
            id: "hct",
            name: "Hematocrit",
            unit: "%",
            normalRange: "40-52",
            startValue: 29,
            trend: "increasing",
            variabilityFactor: 0.04,
          },
          {
            id: "platelets",
            name: "Platelets",
            unit: "x10^9/L",
            normalRange: "150-450",
            startValue: 280,
            trend: "stable",
            variabilityFactor: 0.05,
          },
        ],
      },
      {
        categoryId: "electrolytes",
        categoryName: "Electrolytes",
        metricConfigs: [
          {
            id: "k",
            name: "Potassium (K+)",
            unit: "mEq/L",
            normalRange: "3.5-5.0",
            startValue: 5.7,
            trend: "decreasing",
            variabilityFactor: 0.03,
          },
          {
            id: "na",
            name: "Sodium (Na+)",
            unit: "mEq/L",
            normalRange: "135-145",
            startValue: 134,
            trend: "increasing",
            variabilityFactor: 0.01,
          },
          {
            id: "cl",
            name: "Chloride (Cl-)",
            unit: "mEq/L",
            normalRange: "98-107",
            startValue: 96,
            trend: "increasing",
            variabilityFactor: 0.02,
          },
        ],
      },
      {
        categoryId: "lipids",
        categoryName: "Lipid Panel",
        metricConfigs: [
          {
            id: "chol_total",
            name: "Total Cholesterol",
            unit: "mg/dL",
            normalRange: "<200",
            startValue: 215,
            trend: "decreasing",
            variabilityFactor: 0.03,
          },
          {
            id: "hdl",
            name: "HDL Cholesterol",
            unit: "mg/dL",
            normalRange: ">40",
            startValue: 37,
            trend: "increasing",
            variabilityFactor: 0.04,
          },
          {
            id: "ldl",
            name: "LDL Cholesterol",
            unit: "mg/dL",
            normalRange: "<100",
            startValue: 155,
            trend: "decreasing",
            variabilityFactor: 0.05,
          },
          {
            id: "trig",
            name: "Triglycerides",
            unit: "mg/dL",
            normalRange: "<150",
            startValue: 185,
            trend: "decreasing",
            variabilityFactor: 0.08,
          },
        ],
      },
      {
        categoryId: "thyroid",
        categoryName: "Thyroid Panel",
        metricConfigs: [
          {
            id: "tsh",
            name: "TSH",
            unit: "mIU/L",
            normalRange: "0.4-4.0",
            startValue: 2.8,
            trend: "stable",
            variabilityFactor: 0.1,
          },
        ],
      },
      {
        categoryId: "vitals",
        categoryName: "Vital Signs",
        metricConfigs: [
          {
            id: "bp_sys",
            name: "Systolic BP",
            unit: "mmHg",
            normalRange: "<120",
            startValue: 128,
            trend: "decreasing",
            variabilityFactor: 0.02,
          },
          {
            id: "hr",
            name: "Heart Rate",
            unit: "bpm",
            normalRange: "60-100",
            startValue: 88,
            trend: "fluctuating",
            variabilityFactor: 0.05,
          },
          {
            id: "temp",
            name: "Temperature",
            unit: "°C",
            normalRange: "36.1-37.2",
            startValue: 36.9,
            trend: "stable",
            variabilityFactor: 0.005,
          },
        ],
      },
    ],
  },
  // Patient 2: Simulating Jane Doe - Mild Anemia (stable), TSH improving, otherwise normal
  {
    id: "p002",
    name: "Jane Doe",
    dateOfBirth: "1985-06-22",
    gender: "Female",
    noteCount: 3,
    categoryConfigs: [
      {
        categoryId: "cbc",
        categoryName: "Complete Blood Count (CBC)",
        metricConfigs: [
          {
            id: "wbc",
            name: "WBC",
            unit: "x10^9/L",
            normalRange: "4-11",
            startValue: 7.0,
            trend: "stable",
            variabilityFactor: 0.06,
          },
          {
            id: "hb",
            name: "Hemoglobin",
            unit: "g/dL",
            normalRange: "12.0-15.5",
            startValue: 11.7,
            trend: "stable",
            variabilityFactor: 0.03,
          },
          {
            id: "rbc",
            name: "RBC",
            unit: "x10^12/L",
            normalRange: "4.2-5.4",
            startValue: 4.1,
            trend: "stable",
            variabilityFactor: 0.03,
          },
          {
            id: "hct",
            name: "Hematocrit",
            unit: "%",
            normalRange: "36-46",
            startValue: 35,
            trend: "stable",
            variabilityFactor: 0.03,
          },
          {
            id: "platelets",
            name: "Platelets",
            unit: "x10^9/L",
            normalRange: "150-450",
            startValue: 240,
            trend: "stable",
            variabilityFactor: 0.06,
          },
        ],
      },
      {
        categoryId: "electrolytes",
        categoryName: "Electrolytes",
        metricConfigs: [
          {
            id: "k",
            name: "Potassium (K+)",
            unit: "mEq/L",
            normalRange: "3.5-5.0",
            startValue: 4.2,
            trend: "stable",
            variabilityFactor: 0.02,
          },
          {
            id: "na",
            name: "Sodium (Na+)",
            unit: "mEq/L",
            normalRange: "135-145",
            startValue: 139,
            trend: "stable",
            variabilityFactor: 0.01,
          },
          {
            id: "cl",
            name: "Chloride (Cl-)",
            unit: "mEq/L",
            normalRange: "98-107",
            startValue: 103,
            trend: "stable",
            variabilityFactor: 0.01,
          },
        ],
      },
      {
        categoryId: "lipids",
        categoryName: "Lipid Panel",
        metricConfigs: [
          {
            id: "chol_total",
            name: "Total Cholesterol",
            unit: "mg/dL",
            normalRange: "<200",
            startValue: 190,
            trend: "stable",
            variabilityFactor: 0.03,
          },
          {
            id: "hdl",
            name: "HDL Cholesterol",
            unit: "mg/dL",
            normalRange: ">50",
            startValue: 55,
            trend: "stable",
            variabilityFactor: 0.05,
          },
          {
            id: "ldl",
            name: "LDL Cholesterol",
            unit: "mg/dL",
            normalRange: "<100",
            startValue: 110,
            trend: "stable",
            variabilityFactor: 0.04,
          },
          {
            id: "trig",
            name: "Triglycerides",
            unit: "mg/dL",
            normalRange: "<150",
            startValue: 120,
            trend: "stable",
            variabilityFactor: 0.07,
          },
        ],
      },
      {
        categoryId: "thyroid",
        categoryName: "Thyroid Panel",
        metricConfigs: [
          {
            id: "tsh",
            name: "TSH",
            unit: "mIU/L",
            normalRange: "0.4-4.0",
            startValue: 5.2,
            trend: "decreasing",
            variabilityFactor: 0.1,
          },
        ],
      },
      {
        categoryId: "liver",
        categoryName: "Liver Function",
        metricConfigs: [
          {
            id: "alt",
            name: "ALT",
            unit: "U/L",
            normalRange: "7-35",
            startValue: 28,
            trend: "stable",
            variabilityFactor: 0.05,
          },
          {
            id: "ast",
            name: "AST",
            unit: "U/L",
            normalRange: "10-30",
            startValue: 25,
            trend: "stable",
            variabilityFactor: 0.05,
          },
          {
            id: "alp",
            name: "Alkaline Phosphatase",
            unit: "U/L",
            normalRange: "40-130",
            startValue: 75,
            trend: "stable",
            variabilityFactor: 0.05,
          },
          {
            id: "bili",
            name: "Total Bilirubin",
            unit: "mg/dL",
            normalRange: "0.1-1.2",
            startValue: 0.7,
            trend: "stable",
            variabilityFactor: 0.08,
          },
        ],
      },
      {
        categoryId: "kidney",
        categoryName: "Kidney Function",
        metricConfigs: [
          {
            id: "creatinine",
            name: "Creatinine",
            unit: "mg/dL",
            normalRange: "0.5-1.1",
            startValue: 0.8,
            trend: "stable",
            variabilityFactor: 0.04,
          },
          {
            id: "bun",
            name: "BUN",
            unit: "mg/dL",
            normalRange: "7-20",
            startValue: 16,
            trend: "stable",
            variabilityFactor: 0.06,
          },
        ],
      },
      {
        categoryId: "vitals",
        categoryName: "Vital Signs",
        metricConfigs: [
          {
            id: "bp_sys",
            name: "Systolic BP",
            unit: "mmHg",
            normalRange: "<120",
            startValue: 114,
            trend: "stable",
            variabilityFactor: 0.02,
          },
          {
            id: "hr",
            name: "Heart Rate",
            unit: "bpm",
            normalRange: "60-100",
            startValue: 68,
            trend: "stable",
            variabilityFactor: 0.04,
          },
          {
            id: "temp",
            name: "Temperature",
            unit: "°C",
            normalRange: "36.1-37.2",
            startValue: 36.7,
            trend: "stable",
            variabilityFactor: 0.005,
          },
        ],
      },
    ],
  },
];

// --- Utility Function calculateAge ---
function calculateAge(dateOfBirth: string): number {
  try {
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      console.error("Invalid date of birth:", dateOfBirth);
      return 0; // Return 0 for invalid dates
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0; // Ensure age is not negative
  } catch (e) {
    console.error("Error calculating age:", e);
    return 0; // Return 0 on error
  }
}

// --- Sub-Component for Table View ---
const MetricTable: React.FC<{ metric: TestMetric }> = ({ metric }) => {
  const sortedReadings = useMemo(() => {
    const validReadings =
      metric.readings?.filter(
        (r) => r && r.date && typeof r.value === "number",
      ) || [];
    return [...validReadings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [metric.readings]);

  if (!sortedReadings || sortedReadings.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic mt-2">
        No historical data available.
      </p>
    );
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-md border">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left font-semibold text-gray-700 border-b">
              Date
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-b">
              Value
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-b">
              Unit
            </th>
            <th className="p-2 text-left font-semibold text-gray-700 border-b">
              Interpretation
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedReadings.map((reading, index) => (
            <tr
              key={`${reading.date}-${index}`}
              className="hover:bg-gray-50 even:bg-gray-50/50"
            >
              <td className="p-2 border-b border-gray-200">
                {new Date(reading.date).toLocaleDateString()}
              </td>
              <td className="p-2 border-b border-gray-200">{reading.value}</td>
              <td className="p-2 border-b border-gray-200">{metric.unit}</td>
              <td className="p-2 border-b border-gray-200">
                <span
                  className={`font-semibold ${
                    reading.interpretation === "High"
                      ? "text-red-600"
                      : reading.interpretation === "Low"
                      ? "text-blue-600"
                      : reading.interpretation === "Normal"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {reading.interpretation || "-"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Custom Dot Component for Line Chart ---
interface CustomDotPayload extends TimeSeriesReading {
  // Add other potential payload fields if known
}

interface CustomDotProps extends DotProps {
  payload?: CustomDotPayload; // Override payload type
}

const CustomDot: React.FC<CustomDotProps> = (props) => {
  const { cx, cy, payload } = props;

  // Default dot style (e.g., for 'Normal' or undefined interpretation)
  let fill = "#14b8a6"; // Teal (base line color)
  let stroke = "#0f766e"; // Darker teal for stroke
  let r = 3; // Default radius

  if (payload) {
      switch (payload.interpretation) {
          case "High":
              fill = "#ef4444"; // Red-500
              stroke = "#b91c1c"; // Red-700
              r = 4; // Slightly larger radius for emphasis
              break;
          case "Low":
              fill = "#3b82f6"; // Blue-500
              stroke = "#1d4ed8"; // Blue-700
              r = 4; // Slightly larger radius for emphasis
              break;
          case "Normal":
               fill = "#22c55e"; // Green-500
               stroke = "#15803d"; // Green-700
               r = 3;
               break;
          // Keep default (teal) for other cases
      }
  }

  // Don't render dot if coordinates are invalid
  if (typeof cx !== 'number' || typeof cy !== 'number') {
      return null;
  }

  return (
      <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
      />
  );
};


// --- Sub-Component for Displaying a Single Metric ---
interface MetricDisplayProps {
  metric: TestMetric;
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({ metric }) => {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "chart" ? "table" : "chart"));
  };

  const chartData = useMemo(() => {
    if (!metric.readings) return [];
    const validReadings = metric.readings.filter(
      (r) => r && r.date && typeof r.value === "number",
    );
    // Ensure data is sorted by date for the chart
    return [...validReadings]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({
        date: r.date,
        value: r.value,
        interpretation: r.interpretation, // Make sure interpretation is included
      }));
  }, [metric.readings]);

  const latestReading = useMemo(() => {
    // Use chartData which is already sorted
    if (!chartData || chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  }, [chartData]);

  const hasReadings = chartData.length > 0;
  const canChartView = chartData.length > 1;
  const effectiveViewMode =
    viewMode === "chart" && !canChartView ? "table" : viewMode;

  const normalRangeLimits = useMemo(
    () => parseNormalRange(metric.normalRange),
    [metric.normalRange],
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col h-full hover:shadow-sm transition-shadow duration-200 bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex-grow">
                <h3 className="font-semibold text-base text-gray-800 leading-tight">
                  {metric.name}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    ({metric.unit})
                  </span>
                </h3>
                {metric.normalRange && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Normal: {metric.normalRange} {metric.unit}
                  </p>
                )}
                {latestReading ? (
                  <p className="text-xs mt-1 text-gray-600">
                    <span className="font-medium">Latest:</span>{' '}
                    {latestReading.value}{' '}
                    <span className={`font-semibold ${
                      latestReading.interpretation === 'High' ? 'text-red-600' :
                      latestReading.interpretation === 'Low' ? 'text-blue-600' :
                      latestReading.interpretation === 'Normal' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {latestReading.interpretation ? `(${latestReading.interpretation})` : ''}
                    </span>
                    {' on '} {new Date(latestReading.date).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-1">
                    No readings available.
                  </p>
                )}
            </div>
            {hasReadings && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2 shrink-0"
                onClick={toggleViewMode}
                aria-label={`Switch ${metric.name} to ${
                  effectiveViewMode === 'chart' ? 'Table' : 'Chart'
                } View`}
                title={`Switch to ${
                  effectiveViewMode === 'chart' ? 'Table' : 'Chart'
                } View`}
              >
                {effectiveViewMode === 'chart' ? (
                  <Table className="h-3 w-3 mr-1"/>
                ) : (
                  <LineChartIcon className="h-3 w-3 mr-1" />
                )}
                {effectiveViewMode === 'chart' ? 'Table' : 'Chart'}
              </Button>
            )}
        </div>

      {/* Warning for single data point chart view */}
      {viewMode === "chart" && !canChartView && hasReadings && (
        <p className="text-xs text-amber-700 italic my-2 bg-amber-50 p-1 rounded border border-amber-200">
          Chart requires at least two data points. Showing table instead.
        </p>
      )}

      {/* Content Area (Chart or Table) */}
      <div className="flex-grow mt-2">
        {hasReadings ? (
          effectiveViewMode === 'chart' ? (
            // Chart View
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData} // Ensure chartData includes interpretation
                  margin={{ top: 5, right: 15, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(dateStr) =>
                      new Date(dateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    tick={{ fontSize: 9 }}
                    angle={-30}
                    textAnchor="end"
                    interval="preserveStartEnd"
                    height={30}
                    dy={3}
                  />
                  <YAxis
                    tick={{ fontSize: 9 }}
                    domain={["auto", "auto"]}
                    allowDecimals={true}
                    width={45}
                    dx={-2}
                  />
                  <Tooltip
                    labelFormatter={(label) =>
                      `Date: ${new Date(label).toLocaleDateString()}`}
                    formatter={(value: number, name: string, props: any) => {
                      const interpretation = props.payload.interpretation
                        ? ` (${props.payload.interpretation})`
                        : "";
                      const formattedValue =
                        typeof value === "number" ? value : "-";
                      return [
                        `Value: ${formattedValue} ${metric.unit}${interpretation}`,
                        metric.name,
                      ];
                    }}
                    contentStyle={{
                      fontSize: 11, padding: '4px 8px', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                    cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: "3 3" }}
                  />
                   {/* Reference Lines */}
                   {normalRangeLimits.min !== undefined && (
                     <ReferenceLine
                       y={normalRangeLimits.min}
                       label={{ value: `Min: ${normalRangeLimits.min}`, fontSize: 8, fill: '#666', position: 'insideBottomLeft', dy: -2, dx: 5 }}
                       stroke="#a0aec0"
                       strokeDasharray="3 3"
                       strokeWidth={1}
                     />
                   )}
                   {normalRangeLimits.max !== undefined && (
                     <ReferenceLine
                       y={normalRangeLimits.max}
                       label={{ value: `Max: ${normalRangeLimits.max}`, fontSize: 8, fill: '#666', position: 'insideTopLeft', dy: 10, dx: 5 }}
                       stroke="#a0aec0"
                       strokeDasharray="3 3"
                       strokeWidth={1}
                     />
                   )}

                  {/* Line with Custom Dots */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={metric.name}
                    stroke="#14b8a6" // Main line color (teal)
                    strokeWidth={2}
                    dot={<CustomDot />} // Use the custom dot component
                    activeDot={{ r: 6, strokeWidth: 1, fill: '#0f766e', stroke: '#fff' }} // Hover dot style
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            // Table View
            <MetricTable metric={metric} />
          )
        ) : (
          // No Data View
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-500 italic">
              No data points recorded.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Component Definition ---
export default function PatientTrackerPanel() {
  // Generate data only once using useMemo
  const generatedPatientData = useMemo(
    () => generatePatientData(patientConfigurations, 30),
    [],
  );

  // State for the currently selected patient ID
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    generatedPatientData[0]?.id || "",
  );

  // State to track expanded categories: Record<categoryId, isExpanded>
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Find the currently selected patient object
  const currentPatient = generatedPatientData.find(
    (p) => p.id === selectedPatientId,
  );

  // Function to toggle the expansion state of a category
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId], // Toggle the boolean value
    }));
  };

  // Reset expansion state when patient changes
  useEffect(() => {
    setExpandedCategories({}); // Collapse all when patient changes
  }, [selectedPatientId]);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Title and Disclaimers */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Patient Tracker</h1>
          <h2>
            <span className="text-red-500 font-bold block">* Patient data is simulated and not real.</span>
            <span className="text-red-500 font-bold block">* Future work can include adding new patients and notes.</span>
          </h2>
        </div>

        {/* Patient Selector and Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedPatientId}
            onValueChange={(value) => setSelectedPatientId(value)}
          >
            <SelectTrigger className="w-full sm:w-[220px] bg-white shadow-sm">
              <SelectValue placeholder="Select Patient..." />
            </SelectTrigger>
            <SelectContent>
              {generatedPatientData.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} ({patient.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="bg-teal-600 hover:bg-teal-700 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled
            title="Add New Patient (Future Work)"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add New
          </Button>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-grow overflow-y-auto space-y-6 pr-2 pb-6">
        {!currentPatient ? (
          // No Patient Selected View
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Please select a patient to view details.
              </p>
            </CardContent>
          </Card>
        ) : (
          // Patient Details View
          <>
            {/* Patient Demographics Card */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="pb-4 bg-slate-50 border-b">
                <CardTitle className="text-xl text-slate-800">
                  {currentPatient.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-gray-700 space-y-1.5">
                <p>
                  <span className="font-medium text-gray-800 w-16 inline-block">
                    DOB:
                  </span>
                  {new Date(
                    currentPatient.dateOfBirth,
                  ).toLocaleDateString()}{" "}
                  ({calculateAge(currentPatient.dateOfBirth)} years)
                </p>
                <p>
                  <span className="font-medium text-gray-800 w-16 inline-block">
                    Gender:
                  </span>
                  {currentPatient.gender}
                </p>
                <p>
                  <span className="font-medium text-gray-800 w-16 inline-block">
                    Patient ID:
                  </span>
                  {currentPatient.id}
                </p>
              </CardContent>
            </Card>

            {/* Test Results Categories (Expandable) */}
            {currentPatient.testResults.map((category) => {
              const isExpanded = expandedCategories[category.categoryId] || false;
              const contentId = `category-content-${category.categoryId}`;
              return (
                <Card key={category.categoryId} className="shadow-md overflow-hidden">
                  <CardHeader
                    className={`p-3 bg-slate-50 border-b ${
                      isExpanded ? '' : 'hover:bg-slate-100'
                    } cursor-pointer transition-colors duration-150`}
                    onClick={() => toggleCategoryExpansion(category.categoryId)}
                    role="button"
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    tabIndex={0} // Make it focusable
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault(); // Prevent page scroll on space
                        toggleCategoryExpansion(category.categoryId);
                      }
                    }} // Allow keyboard activation
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-slate-800">
                        {category.categoryName}
                      </CardTitle>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-600 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-600 shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {/* Conditionally render the content */}
                  {isExpanded && (
                    <CardContent className="p-4" id={contentId}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.metrics.map((metric) => (
                          <MetricDisplay key={metric.id} metric={metric} />
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {/* Patient Notes Card */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50 border-b">
                <CardTitle className="text-lg text-slate-800">
                  Patient Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {currentPatient.notes && currentPatient.notes.length > 0 ? (
                  currentPatient.notes
                    .sort((a, b) => {
                      // Sort with proper date handling, newest first
                      const dateA = new Date(a.date).getTime();
                      const dateB = new Date(b.date).getTime();
                      // Handle potential invalid dates gracefully
                      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                    })
                    .map((note) => (
                      <div
                        key={note.id}
                        className="pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                      >
                        <p className="text-xs text-gray-500 mb-1.5">
                          <span className="font-medium">
                            {new Date(note.date).toLocaleDateString()}
                          </span>
                          {note.author && ` - ${note.author}`}
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {note.text}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500 italic py-4 text-center">
                    No notes recorded for this period.
                  </p>
                )}
                {/* Add Note Button (Future Work) */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                    title="Add New Note (Future Work)"
                  >
                    <Plus className="mr-1.5 h-3 w-3" /> Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}