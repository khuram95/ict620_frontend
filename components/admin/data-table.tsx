"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Plus, FileDown } from "lucide-react"
import Link from "next/link"

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    title: string
    render?: (item: T) => React.ReactNode
  }[]
  primaryKey: keyof T
  searchable?: boolean
  actions?: {
    edit?: boolean
    delete?: boolean
    view?: boolean
    custom?: (item: T) => React.ReactNode
  }
  basePath: string
  onDelete?: (id: string | number) => void
}

export default function DataTable<T>({
  data,
  columns,
  primaryKey,
  searchable = true,
  actions = { edit: true, delete: true, view: true },
  basePath,
  onDelete,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) => {
        return Object.values(item).some((value) => {
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase())
          }
          if (typeof value === "number") {
            return value.toString().includes(searchTerm)
          }
          return false
        })
      })
    : data

  // Paginate data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleExport = () => {
    // Convert data to CSV
    const headers = columns.map((col) => col.title).join(",")
    const rows = filteredData.map((item) => {
      return columns
        .map((col) => {
          const value = item[col.key as keyof T]
          if (typeof value === "string") {
            // Escape quotes and wrap in quotes
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        .join(",")
    })

    const csv = [headers, ...rows].join("\n")

    // Create a download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `export-${Date.now()}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Link href={`${basePath}/new`} passHref>
            <Button className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.title}</TableHead>
              ))}
              {(actions.edit || actions.delete || actions.view || actions.custom) && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={String(item[primaryKey])}>
                  {columns.map((column) => (
                    <TableCell key={`${String(item[primaryKey])}-${column.key}`}>
                      {column.render ? column.render(item) : String(item[column.key as keyof T] || "")}
                    </TableCell>
                  ))}
                  {(actions.edit || actions.delete || actions.view || actions.custom) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {actions.view && (
                          <Link
                            href={`${basePath}/${item[primaryKey]}`}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            View
                          </Link>
                        )}
                        {actions.edit && (
                          <Link
                            href={`${basePath}/${item[primaryKey]}/edit`}
                            className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded hover:bg-amber-200"
                          >
                            Edit
                          </Link>
                        )}
                        {actions.delete && (
                          <button
                            onClick={() => onDelete && onDelete(String(item[primaryKey]))}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                        {actions.custom && actions.custom(item)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

