// complementaryMedicineSearchBox.tsx
"use client";
import React from "react";
import AsyncSelect from "react-select/async";
import { searchComplementaryMedicines } from "../../lib/typesense-service"; // adjust the path as needed

export interface OptionType {
  value: string;
  label: string;
}

interface SearchBoxProps {
  name: string;
  label: string;
  defaultValue?: OptionType | null;
  onChange: (selected: OptionType | null) => void;
}

const complementaryMedicineSearchBox: React.FC<SearchBoxProps> = ({
  name,
  label,
  defaultValue,
  onChange,
}) => {
  // This function calls your Typesense search as the user types.
  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    try {
      const results = await searchComplementaryMedicines(inputValue);
      return results;
    } catch (error) {
      console.error("Error loading medication options:", error);
      return [];
    }
  };

  return (
    <div className="form-group mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <AsyncSelect
        cacheOptions
        defaultOptions={defaultValue ? [defaultValue] : []}
        loadOptions={loadOptions}
        defaultValue={defaultValue}
        placeholder={"Search  Complementary Medicine"}
        onChange={onChange}
        name={name}
        isClearable
      />
    </div>
  );
};

export default complementaryMedicineSearchBox;
