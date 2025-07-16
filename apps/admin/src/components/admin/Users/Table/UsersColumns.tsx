"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/api/services/types";
import { formatDate } from "@/utils/dateFormatter";

// Helper functions for rendering cells
const renderNameCell = (value: string | undefined, id: string) => (
  <div className="max-w-[200px]">
    <a href={`/user-management/${id}`} className="font-medium text-foreground hover:underline truncate block" title={value || "-"}>
      {value || "-"}
    </a>
    <div className="text-xs text-muted-foreground truncate">
      {id || "-"}
    </div>
  </div>
);

const renderEmailCell = (email: string | undefined, verified: boolean) => (
  <div className="max-w-[200px]">
    <div className="truncate" title={email || "-"}>
      {email || "-"}
    </div>
    {verified ? (
      <div className="text-xs text-green-500">Verified</div>
    ) : (
      <div className="text-xs text-amber-500">Not verified</div>
    )}
  </div>
);

const renderCompanyCell = (company: any) => {
  let companyName = "-";
  
  if (!company) {
    companyName = "-";
  } else if (typeof company === 'string') {
    companyName = company;
  } else if (typeof company === 'object' && company !== null && 'name' in company) {
    companyName = company.name || "-";
  }
  
  return (
    <div className="max-w-[180px] truncate" title={companyName}>
      {companyName === "-" ? (
        <span className="text-muted-foreground italic">Not specified</span>
      ) : (
        companyName
      )}
    </div>
  );
};

const renderRoleCell = (role: any) => {
  let roleName = "-";
  
  if (!role) {
    roleName = "-";
  } else if (typeof role === 'string') {
    roleName = role;
  } else if (typeof role === 'object' && role !== null && 'name' in role) {
    roleName = role.name || "-";
  }
  
  return (
    <div className="max-w-[150px]">
      <div className="font-medium capitalize">{roleName}</div>
    </div>
  );
};

const renderDateCell = (dateString: string | undefined) => {
  if (!dateString) return "-";
  
  try {
    return formatDate(dateString);
  } catch (error) {
    console.error("Error formatting date:", error, dateString);
    return "-";
  }
};

const renderStatusCell = (status: string | undefined) => {
  // Normalize status to lowercase for consistent handling
  const rawStatus = status || "";
  
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";
  let badgeClass = "";
  
  switch(rawStatus) {
    case "ACTIVE":
      badgeVariant = "default";
      badgeClass = "bg-green-900/55 text-green-300 capitalize";
      break;
    case "INACTIVE":
      badgeVariant = "destructive";
      badgeClass = "bg-red-900/55 text-red-300 capitalize";
      break;
    case "INVITED":
      badgeVariant = "secondary";
      badgeClass = "bg-orange-900/55 text-orange-300 capitalize";
      break;
    case "PENDING":
      badgeVariant = "secondary";
      badgeClass = "bg-yellow-900/55 text-yellow-300 capitalize";
      break;
    case "BLOCKED":
      badgeVariant = "destructive";
      badgeClass = "bg-red-900/55 text-red-300 capitalize";
      break;
    case "SUSPENDED":
      badgeVariant = "destructive";
      badgeClass = "bg-red-900/55 text-red-300 capitalize";
      break;
    case "DELETED":
      badgeVariant = "outline";
      badgeClass = "bg-gray-900/80 text-gray-300 capitalize";
      break;
    default:
      badgeVariant = "outline";
      badgeClass = "capitalize";
  }
  
  return <Badge variant={badgeVariant} className={badgeClass}>{status ? status : "-"}</Badge>;
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      width: "w-[40px]"
    }
  },    
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Full name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => renderNameCell(row.getValue("fullName"), row.original.id),
    meta: {
      width: "w-[200px]"
    }
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => renderEmailCell(row.getValue("email"), row.original.emailVerified),
    meta: {
      width: "w-[200px]"
    }
  },
  {
    accessorKey: "company",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => renderCompanyCell(row.getValue("company")),
    meta: {
      width: "w-[180px]"
    }
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => renderRoleCell(row.getValue("role")),
    meta: {
      width: "w-[150px]"
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created at
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="w-[150px]">{renderDateCell(row.getValue("createdAt"))}</div>,
    meta: {
      width: "w-[150px]"
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => renderStatusCell(row.getValue("status")),
    meta: {
      width: "w-[100px]"
    }
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    meta: {
      width: "w-[60px]"
    }
  }
];