// EditDrugDrugInteractionPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormBuilder from "@/components/admin/form-builder";
import { toast } from "@/components/ui/use-toast";
import {
  drugDrugInteractionApi,
  type DrugDrugInteraction,
} from "@/lib/api-service";
import MedicationSearchBox, {
  OptionType,
} from "../../../../../components/ui/medication-search-box";
import { getMedicationById } from "../../../../../lib/typesense-service";

export default function EditDrugDrugInteractionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [interaction, setInteraction] = useState<DrugDrugInteraction | null>(
    null
  );
  const [defaultMed1, setDefaultMed1] = useState<OptionType | null>(null);
  const [defaultMed2, setDefaultMed2] = useState<OptionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const interactionData = await drugDrugInteractionApi.getById(params.id);
        const raw = interactionData.data;
        const interactionRecord = Array.isArray(raw) ? raw[0] : raw;

        if (!interactionRecord) {
          throw new Error("No interaction data found.");
        }

        setInteraction(interactionRecord);
        console.log("Interaction details:", interactionRecord);
        // Ensure both IDs exist before fetching meds
        const [med1, med2] = await Promise.all([
          interactionRecord.medication1_id
            ? getMedicationById(interactionRecord.medication1_id.toString())
            : null,
          interactionRecord.medication2_id
            ? getMedicationById(interactionRecord.medication2_id.toString())
            : null,
        ]);
        console.log(interactionRecord.medication2_id.toString(),  "Medication 2:", med2);
        console.log(interactionRecord.medication1_id.toString(), "Medication 1:", med1);
        setDefaultMed1(med1);
        setDefaultMed2(med2);
        console.log("Medication 2:", med2);
        console.log("Medication 1:", med1);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load interaction details. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (data: Record<string, any>) => {
    setSaving(true);

    try {
      await drugDrugInteractionApi.update(params.id, data);

      toast({
        title: "Interaction updated",
        description: "The interaction has been updated successfully.",
      });

      router.push("/admin/drug-drug-interactions");
    } catch (error) {
      console.error("Error updating interaction:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the interaction.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Define form fields; for the medications we use a custom render
  const formFields = [
    {
      name: "medication1_id",
      label: "Medication 1",
      type: "custom" as const,
      render: (fieldProps: any) => (
        <MedicationSearchBox
          name="medication1_id"
          label="Medication 1"
          defaultValue={defaultMed1}
          onChange={(selected) =>
            fieldProps.onChange(selected ? selected.value : null)
          }
        />
      ),
    },
    {
      name: "medication2_id",
      label: "Medication 2",
      type: "custom" as const,
      render: (fieldProps: any) => (
        <MedicationSearchBox
          name="medication2_id"
          label="Medication 2"
          defaultValue={defaultMed2}
          onChange={(selected) =>
            fieldProps.onChange(selected ? selected.value : null)
          }
        />
      ),
    },
    {
      name: "severity",
      label: "Severity",
      type: "select" as const,
      required: true,
      options: [
        { value: "Major", label: "Major" },
        { value: "Moderate", label: "Moderate" },
        { value: "Minor", label: "Minor" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      required: true,
    },
    {
      name: "recommendation",
      label: "Recommendation",
      type: "textarea" as const,
      required: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading interaction details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit Drug-Drug Interaction</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!interaction) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Interaction Not Found</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>The requested drug-drug interaction could not be found.</p>
          <button
            onClick={() => router.push("/admin/drug-drug-interactions")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
          >
            Back to Drug-Drug Interactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormBuilder
      fields={formFields}
      onSubmit={handleSubmit}
      // Pass initialData with string values; your custom fields will update these via their onChange handlers
      initialData={{
        ...interaction,
        medication1_id: interaction.medication1_id.toString(),
        medication2_id: interaction.medication2_id.toString(),
      }}
      isLoading={saving}
      backUrl="/admin/drug-drug-interactions"
      title="Edit Drug-Drug Interaction"
    />
  );
}
