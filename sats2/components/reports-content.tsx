"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Filter, TrendingUp, Users, Clock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function ReportsContent() {
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedClass, setSelectedClass] = useState("all")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive attendance insights and trends</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="semester">This Semester</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(user?.role === "class_incharge" || user?.role === "hod" || user?.role === "principal") && (
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="cse-a">CSE-A</SelectItem>
                  <SelectItem value="cse-b">CSE-B</SelectItem>
                  <SelectItem value="ece-a">ECE-A</SelectItem>
                  <SelectItem value="me-a">ME-A</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
                <p className="text-3xl font-bold text-green-600">87.5%</p>
                <p className="text-sm text-gray-500 mt-1">+2.3% from last month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-600">1,247</p>
                <p className="text-sm text-gray-500 mt-1">Across all sections</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Classes Conducted</p>
                <p className="text-3xl font-bold text-purple-600">342</p>
                <p className="text-sm text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Attendance</p>
                <p className="text-3xl font-bold text-red-600">23</p>
                <p className="text-sm text-gray-500 mt-1">Students below 75%</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Attendance trend chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* Subject-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { subject: "Data Structures", attendance: 92, color: "bg-green-500" },
                { subject: "Computer Networks", attendance: 88, color: "bg-blue-500" },
                { subject: "Database Systems", attendance: 85, color: "bg-yellow-500" },
                { subject: "Software Engineering", attendance: 78, color: "bg-orange-500" },
                { subject: "Operating Systems", attendance: 72, color: "bg-red-500" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.attendance}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12">{item.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Attendance Students */}
      <Card>
        <CardHeader>
          <CardTitle>Students Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Roll Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Section</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Attendance %</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Rajesh Kumar", roll: "21CSE045", section: "CSE-A", attendance: 68, status: "Critical" },
                  { name: "Priya Sharma", roll: "21CSE067", section: "CSE-B", attendance: 72, status: "Warning" },
                  { name: "Amit Singh", roll: "21ECE023", section: "ECE-A", attendance: 74, status: "Warning" },
                ].map((student, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.roll}</td>
                    <td className="py-3 px-4">{student.section}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${student.attendance < 70 ? "text-red-600" : "text-orange-600"}`}>
                        {student.attendance}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "Critical" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
