"use client";

import React, { useEffect } from "react";
import { CircleDashed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ReviewsFiltersProps {
  selectedStatuses: string[];
  setSelectedStatuses: React.Dispatch<React.SetStateAction<string[]>>;
  uniqueStatuses: string[];
}

const PREDEFINED_STATUSES = ["PENDING", "ACTIVE", "REJECTED", "FLAGGED", "ARCHIVED"];

export function ReviewsFilters({
  selectedStatuses,
  setSelectedStatuses,
  uniqueStatuses,
}: ReviewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update URL when statuses change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.set("page", "1");
    
    selectedStatuses.forEach((status) => {
      params.append("status", status);
    });

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedStatuses, router, pathname, searchParams]);

  const clearAllFilters = () => {
    setSelectedStatuses([]);

    const params = new URLSearchParams();
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
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
                    onSelect={() => {
                      setSelectedStatuses((prev) => {
                        if (prev.includes(status)) {
                          return prev.filter((item) => item !== status);
                        } else {
                          return [...prev, status];
                        }
                      });
                    }}
                  >
                    <Checkbox
                      checked={selectedStatuses.includes(status)}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="capitalize">{status.toLowerCase()}</span>
                  </CommandItem>
                ))}
              </CommandList>
              {selectedStatuses.length > 0 && (
                <div className="border-t border-border p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const params = new URLSearchParams(
                        searchParams.toString()
                      );
                      params.delete("status");
                      params.set("page", "1");
                      router.replace(`${pathname}?${params.toString()}`, {
                        scroll: false,
                      });
                      setSelectedStatuses([]);
                    }}
                  >
                    Clear
                    <X className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Prikaz aktivnih filtera */}
      {selectedStatuses.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Oznake za statuse */}
          {selectedStatuses.map((status) => (
            <Badge
              key={`status-${status}`}
              variant="secondary"
              className="px-2 py-1"
            >
              <span className="capitalize">{status.toLowerCase()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  const remainingStatuses = selectedStatuses.filter(
                    (s) => s !== status
                  );
                  params.delete("status");
                  remainingStatuses.forEach((s) => params.append("status", s));
                  params.set("page", "1");
                  router.replace(`${pathname}?${params.toString()}`, {
                    scroll: false,
                  });
                  setSelectedStatuses(remainingStatuses);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {/* Dugme za brisanje svih filtera */}
          {selectedStatuses.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </>
  );
}