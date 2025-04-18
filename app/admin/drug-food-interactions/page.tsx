"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table"; // Adjust path if needed
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Adjust path if needed
import { toast } from "@/components/ui/use-toast"; // Adjust path if needed
import { Coffee, Pill, Loader2, AlertCircle } from "lucide-react"; // Added icons
import { Badge } from "@/components/ui/badge"; // Adjust path if needed
// Ensure api-service path is correct
import {
  drugFoodInteractionApi,
  type DrugFoodInteraction,
} from "@/lib/api-service";

export default function DrugFoodInteractionsPage() {
  const [interactions, setInteractions] = useState<DrugFoodInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null); // Store ID as number

  // Fetch interactions
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        const response = await drugFoodInteractionApi.getAll(); // Get the AxiosResponse
        // Set the state with the actual data array from the response
        setInteractions(response.data); // <<<<< FIX: Use response.data
      } catch (err: any) {
        console.error("Error fetching drug-food interactions:", err);
        let errorMsg = "Failed to load interactions. Please try again later.";
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []); // Empty dependency array means this runs once on mount

  // Handle initiating the delete confirmation
  const handleDelete = (id: string | number) => {
    // Accept string or number
    const numericId = typeof id === "string" ? parseInt(id, 10) : id; // Convert string to number if needed
    setDeleteId(numericId);
  };

  // Handle confirming the delete action
  const confirmDelete = async () => {
    if (deleteId === null) return; // Check for null explicitly

    const idToDelete = deleteId; // Store id before resetting state
    setDeleteId(null); // Close dialog immediately

    try {
      // Uncomment and ensure the delete method exists and works
      await drugFoodInteractionApi.delete(idToDelete);

      // Update state optimistically or after successful deletion
      setInteractions((prevInteractions) =>
        prevInteractions.filter(
          (interaction) => interaction.df_interaction_id !== idToDelete
        )
      );

      toast({
        title: "Interaction Deleted",
        description: `Interaction with ID ${idToDelete} has been deleted.`,
      });
    } catch (err: any) {
      console.error("Error deleting interaction:", err);
      let errorMsg = "Failed to delete interaction. Please try again.";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast({
        title: "Deletion Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  // Helper to render severity badge
  const getSeverityBadge = (severity?: string | null) => {
    // Mark severity as optional
    if (!severity) return <Badge variant="outline">Unknown</Badge>;

    switch (severity.toLowerCase()) {
      case "major":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
            {severity}
          </Badge>
        );
      case "moderate":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
            {severity}
          </Badge>
        );
      case "minor":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
            {severity}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  // Define columns for the DataTable
  const columns = [
    {
      key: "df_interaction_id",
      title: "ID",
    },
    {
      key: "items",
      title: "Interacting Items",
      render: (item: DrugFoodInteraction) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Pill className="h-4 w-4 text-teal-600 flex-shrink-0" />
            <span
              className="truncate"
              title={item.medication_name || `Med ID: ${item.medication_id}`}
            >
              {item.medication_name || `Med ID: ${item.medication_id}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coffee className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span
              className="truncate"
              title={item.food_name || `Food ID: ${item.food_id}`}
            >
              {item.food_name || `Food ID: ${item.food_id}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "severity",
      title: "Severity",
      render: (item: DrugFoodInteraction) => getSeverityBadge(item.severity),
    },
    {
      key: "description",
      title: "Description",
      render: (item: DrugFoodInteraction) => (
        <div className="max-w-md truncate" title={item.description || ""}>
          {item.description || (
            <span className="text-gray-400 italic">No description</span>
          )}
        </div>
      ),
    },
  ];

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading interactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Coffee className="h-6 w-6 text-green-600" />
          Drug-Food Interactions
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold mb-1">Error Loading Data</h2>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()} // Simple retry
              className="mt-3 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Retry Page Load
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {" "}
      {/* Add padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coffee className="h-6 w-6 text-green-600" />
          Drug-Food Interactions ({interactions.length})
        </h1>
        {/* Add Button Link (assuming you have an add page) */}
        {/* <Link href="/admin/drug-food-interactions/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add New Interaction
                    </Button>
                </Link> */}
      </div>
      <DataTable
        // Ensure data is always an array
        data={interactions || []}
        columns={columns}
        primaryKey="df_interaction_id" // Matches DrugFoodInteraction interface
        basePath="/admin/drug-food-interactions" // Used for edit links etc.
        onDelete={handleDelete} // Pass the handler
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              interaction with ID{" "}
              <span className="font-medium">{deleteId}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
