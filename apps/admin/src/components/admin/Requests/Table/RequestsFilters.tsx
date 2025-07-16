"use client";

import React, { useEffect, useState } from "react";
import { CircleDashed, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TableFilters } from "@/components/admin/Table/TableFilters";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/useDebounce";

interface RequestsFiltersProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  uniqueStatuses: string[];
  uniqueTypes: string[];
  typeSearchValue: string;
  setTypeSearchValue: (value: string) => void;
  updateUrlParams: (params: {
    page?: number;
    query?: string;
    statuses?: string[];
    types?: string[];
  }) => void;
}

const PREDEFINED_STATUSES = ["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const formatTypeName = (name: string): string => {
  if (!name) return "";
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatStatus = (status: string): string => {
  if (!status) return "";
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function RequestsFilters({
  globalFilter,
  setGlobalFilter,
  selectedTypes,
  setSelectedTypes,
  selectedStatuses,
  setSelectedStatuses,
  uniqueStatuses,
  uniqueTypes,
  typeSearchValue,
  setTypeSearchValue,
  updateUrlParams,
}: RequestsFiltersProps) {
  
  const [localSearch, setLocalSearch] = useState(globalFilter);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Update search when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== globalFilter) {
      setGlobalFilter(debouncedSearch);
    }
  }, [debouncedSearch, globalFilter, setGlobalFilter]);

  // Sync local search with external changes
  useEffect(() => {
    if (globalFilter !== localSearch) {
      setLocalSearch(globalFilter);
    }
  }, [globalFilter]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setLocalSearch("");
    updateUrlParams({ page: 1, query: "", statuses: [], types: [] });
  };

  const handleTypeChange = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
  };

  const handleStatusChange = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((item) => item !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
  };

  const clearTypes = () => {
    setSelectedTypes([]);
  };

  const clearStatuses = () => {
    setSelectedStatuses([]);
  };

  const removeType = (type: string) => {
    const newTypes = selectedTypes.filter((t) => t !== type);
    setSelectedTypes(newTypes);
  };

  const removeStatus = (status: string) => {
    const newStatuses = selectedStatuses.filter((s) => s !== status);
    setSelectedStatuses(newStatuses);
  };

  // Show all types, filtered by search, but don't hide selected ones
  const allTypes = Array.from(new Set([...(uniqueTypes || []), ...selectedTypes]));
  const filteredTypes = typeSearchValue.trim() === ""
    ? allTypes
    : allTypes.filter((type) =>
        formatTypeName(type).toLowerCase().includes(typeSearchValue.toLowerCase())
      );

  return (
    <>
      <TableFilters
        globalFilter={localSearch}
        setGlobalFilter={handleSearchChange}
        placeholder="Search requests..."
      >
        {/* Request Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10">
              <Tag className="h-4 w-4 mr-2" />
              Request Types
              {selectedTypes.length > 0 && (
                <>
                  <div className="w-px h-4 bg-muted mx-2" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm w-6 h-6 p-0 flex items-center justify-center text-xs"
                  >
                    {selectedTypes.length}
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search Request Types..."
                value={typeSearchValue}
                onValueChange={setTypeSearchValue}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {filteredTypes.map((type) => (
                  <CommandItem
                    key={type}
                    onSelect={() => handleTypeChange(type)}
                  >
                    <Checkbox
                      checked={selectedTypes.includes(type)}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="capitalize">
                      {formatTypeName(type)}
                    </span>
                  </CommandItem>
                ))}
              </CommandList>
              {selectedTypes.length > 0 && (
                <div className="border-t border-border p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearTypes}
                  >
                    Clear
                    <X className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10">
              <CircleDashed className="h-4 w-4 mr-2" />
              Status
              {selectedStatuses.length > 0 && (
                <>
                  <div className="w-px h-4 bg-muted mx-2" />
                  <Badge
                    variant="secondary"
                    className="rounded-sm w-6 h-6 p-0 flex items-center justify-center text-xs"
                  >
                    {selectedStatuses.length}
                  </Badge>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandList>
                <CommandEmpty>No statuses found.</CommandEmpty>
                {PREDEFINED_STATUSES.map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => handleStatusChange(status)}
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status)}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="capitalize">{formatStatus(status)}</span>
                  </CommandItem>
                ))}
              </CommandList>
              {selectedStatuses.length > 0 && (
                <div className="border-t border-border p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={clearStatuses}
                  >
                    Clear
                    <X className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </TableFilters>

      {/* Active filters display */}
      {(selectedTypes.length > 0 || selectedStatuses.length > 0) && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Type badges */}
          {selectedTypes.map((type) => (
            <Badge
              key={`type-${type}`}
              variant="secondary"
              className="px-2 py-1"
            >
              <span className="capitalize">{formatTypeName(type)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => removeType(type)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Status badges */}
          {selectedStatuses.map((status) => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="px-2 py-1"
            >
              <span className="capitalize">{formatStatus(status)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => removeStatus(status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Clear all button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>
        </div>
      )}
    </>
  );
}