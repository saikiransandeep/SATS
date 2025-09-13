"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BarChart3, Settings, HelpCircle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  userRole?: "faculty" | "class-incharge" | "hod" | "principal"
  userName?: string
  userTitle?: string
}

export function Sidebar({ userRole = "faculty", userName = "Professor Davis", userTitle = "Faculty" }: SidebarProps) {
  const pathname = usePathname()
  const [showRoleSwitch, setShowRoleSwitch] = useState(false)

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-screen">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <div className="h-4 w-4 bg-white rounded transform rotate-12"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">EduTrack</h1>
          <p className="text-xs text-gray-500">Smart Attendance</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Role Switch */}
      <div className="border-t border-gray-200 p-4">
        {userRole !== "faculty" && (
          <div className="mb-4">
            <button
              onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm bg-blue-50 rounded-lg"
            >
              <span className="text-blue-700">Switch View</span>
              <ChevronDown className="h-4 w-4 text-blue-700" />
            </button>
            {showRoleSwitch && (
              <div className="mt-2 space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Faculty View
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded">
                  Class Incharge View
                </button>
              </div>
            )}
          </div>
        )}

        <Link
          href="/help"
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-4"
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Help
        </Link>
      </div>
    </div>
  )
}
