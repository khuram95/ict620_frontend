"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Pill,
  Database,
  Coffee,
  BookOpen,
  Users,
  AlertTriangle,
  FileText,
  Calendar,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  children?: NavItem[]
}

export default function AdminNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Medications: true,
  })

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "Medications",
      href: "#",
      icon: <Pill className="h-5 w-5" />,
      children: [
        {
          title: "Medications",
          href: "/admin/medications",
          icon: <Pill className="h-4 w-4" />,
        },
        {
          title: "Drug-Drug Interactions",
          href: "/admin/drug-drug-interactions",
          icon: <Pill className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Complementary",
      href: "#",
      icon: <Coffee className="h-5 w-5" />,
      children: [
        {
          title: "Complementary Medicines",
          href: "/admin/complementary-medicines",
          icon: <Coffee className="h-4 w-4" />,
        },
        {
          title: "Drug-Complementary Interactions",
          href: "/admin/drug-complementary-interactions",
          icon: <Coffee className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Food",
      href: "#",
      icon: <Coffee className="h-5 w-5" />,
      children: [
        {
          title: "Food Items",
          href: "/admin/food-items",
          icon: <Coffee className="h-4 w-4" />,
        },
        {
          title: "Drug-Food Interactions",
          href: "/admin/drug-food-interactions",
          icon: <Coffee className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Allergies",
      href: "/admin/allergies",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: "Schedules",
      href: "/admin/schedules",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "References",
      href: "/admin/references",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
  ]

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-teal-700 text-white">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-teal-600">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-white transform transition-transform duration-300 md:relative md:translate-x-0 md:bg-transparent",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full bg-white border-r p-4 md:w-64">
          <div className="hidden md:block mb-6">
            <h1 className="text-xl font-bold text-teal-700">Admin Dashboard</h1>
          </div>

          <nav className="space-y-1 flex-1 overflow-auto">
            {navItems.map((item) => (
              <div key={item.title} className="mb-2">
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleGroup(item.title)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.title}</span>
                      </div>
                      {expandedGroups[item.title] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {expandedGroups[item.title] && (
                      <div className="mt-1 pl-4 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                              pathname === child.href ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-100",
                            )}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.icon}
                            <span className="ml-3">{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      pathname === item.href ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-100",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="pt-4 border-t">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="h-5 w-5" />
              <span className="ml-3">Return to Main App</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

