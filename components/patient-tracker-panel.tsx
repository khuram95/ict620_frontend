"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PatientTrackerPanel() {
  // In a real implementation, this would fetch patient data from an API
  const patientData = {
    name: "John Smith",
    dateOfBirth: "01/01/2000",
    age: 25,
    gender: "Male",
    organFunctionTests: [
      {
        name: "Liver Enzymes (ALT, AST, ALP)",
        value: "ALT: 58 U/L (High)",
        range: "10-40 U/L",
      },
      {
        name: "Kidney Function (Creatinine, BUN)",
        value: "Creatinine: 1.8 mg/dL (High)",
        range: "0.6-1.2 mg/dL",
      },
    ],
    fullBloodPicture: [
      {
        name: "WBC, RBC",
        value: "WBC: 13 x10^9",
        range: "4-11 x10^9",
      },
      {
        name: "Hemoglobin, Hematocrit",
        value: "Hb: 9 g/dL",
        range: "12-16 g/dL",
      },
    ],
    electrolytes: [
      {
        name: "Sodium (Na+)",
        value: "136 mEq/L (Normal)",
        range: "135-145 mEq/L",
      },
      {
        name: "Potassium (K+)",
        value: "5.8 mEq/L (High)",
        range: "3.5-5.0 mEq/L",
      },
    ],
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient Information</h2>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <div className="space-y-4 flex-grow overflow-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{patientData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Date of Birth: {patientData.dateOfBirth}</p>
            <p>
              AGE: {patientData.age} | {patientData.gender}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">ORGAN FUNCTION TESTS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientData.organFunctionTests.map((test, index) => (
              <div key={index}>
                <h3 className="font-medium">{test.name}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Latest Value: {test.value}</li>
                  <li>Normal Range: {test.range}</li>
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">FULL BLOOD PICTURE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientData.fullBloodPicture.map((test, index) => (
              <div key={index}>
                <h3 className="font-medium">{test.name}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Latest Value: {test.value}</li>
                  <li>Normal Range: {test.range}</li>
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">ELECTROLYTE CONCENTRATIONS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientData.electrolytes.map((electrolyte, index) => (
              <div key={index}>
                <h3 className="font-medium">{electrolyte.name}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Latest Value: {electrolyte.value}</li>
                  <li>Normal Range: {electrolyte.range}</li>
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Patient Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-b border-gray-200 py-2"></div>
            <div className="border-b border-gray-200 py-2"></div>
            <div className="border-b border-gray-200 py-2"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

