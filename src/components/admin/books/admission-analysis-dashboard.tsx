"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, TrendingUp, BookOpen } from "lucide-react";
import CombinedEnrollmentAdmissionsChart from "./combined-enrollment-admissions-chart";

interface ClassEnrollmentChartProps {
  data: Array<{
    name: string;
    students: number;
  }>;
}

interface NewAdmissionsChartProps {
  data: Array<{
    name: string;
    admissions: number;
  }>;
}

interface AdmissionAnalysisProps {
  enrollmentData: Array<{ name: string; students: number; }>;
  admissionData: Array<{ name: string; admissions: number; }>;
}

export default function AdmissionAnalysisDashboard({ enrollmentData, admissionData }: AdmissionAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate totals and statistics
  const totalStudents = enrollmentData.reduce((sum, item) => sum + item.students, 0);
  const totalAdmissions = admissionData.reduce((sum, item) => sum + item.admissions, 0);
  
  // Find top performing classes
  const topEnrollmentClass = enrollmentData.reduce((max, item) => 
    item.students > max.students ? item : max, enrollmentData[0] || { name: "N/A", students: 0 }
  );
  
  const topAdmissionClass = admissionData.reduce((max, item) => 
    item.admissions > max.admissions ? item : max, admissionData[0] || { name: "N/A", admissions: 0 }
  );

  // Enhanced enrollment chart with color variations
  const EnhancedClassEnrollmentChart = ({ data }: ClassEnrollmentChartProps) => {
    const getBarColor = (index: number) => {
      const colors = [
        "#3b82f6", // blue
        "#06b6d4", // cyan
        "#10b981", // emerald
        "#84cc16", // lime
        "#f59e0b", // amber
        "#ef4444", // red
        "#8b5cf6", // violet
        "#ec4899", // pink
        "#6366f1", // indigo
        "#14b8a6", // teal
        "#f97316", // orange
        "#06b6d4", // cyan
      ];
      return colors[index % colors.length];
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{payload[0].value}</span> students enrolled
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((payload[0].value / totalStudents) * 100).toFixed(1)}% of total enrollment
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="h-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Class Enrollment Distribution</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalStudents} Total Students
          </Badge>
        </div>
        <div className="h-64">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: getBarColor(index) }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="h-56">
            <div className="grid grid-cols-2 gap-4 h-full">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getBarColor(index) }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="font-semibold text-gray-700">{item.students}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(item.students / Math.max(...data.map(d => d.students))) * 100}%`,
                          backgroundColor: getBarColor(index)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced admissions chart with color variations
  const EnhancedNewAdmissionsChart = ({ data }: NewAdmissionsChartProps) => {
    const getBarColor = (index: number) => {
      const colors = [
        "#8b5cf6", // violet
        "#a855f7", // purple
        "#c084fc", // fuchsia
        "#d946ef", // pink
        "#ec4899", // rose
        "#f43f5e", // red
        "#f97316", // orange
        "#fbbf24", // amber
        "#84cc16", // lime
        "#22c55e", // green
        "#10b981", // emerald
        "#06b6d4", // cyan
      ];
      return colors[index % colors.length];
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border rounded-lg shadow-lg">
            <p className="font-medium text-gray-900">{label}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{payload[0].value}</span> new admissions
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {((payload[0].value / totalAdmissions) * 100).toFixed(1)}% of total admissions
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="h-80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">New Admissions by Class</h3>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {totalAdmissions} Total Admissions
          </Badge>
        </div>
        <div className="h-64">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: getBarColor(index) }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="h-56">
            <div className="grid grid-cols-2 gap-4 h-full">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: getBarColor(index) }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="font-semibold text-gray-700">{item.admissions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${(item.admissions / Math.max(...data.map(d => d.admissions))) * 100}%`,
                          backgroundColor: getBarColor(index)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmissions}</div>
            <p className="text-xs text-muted-foreground">
              This academic year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Enrollment</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topEnrollmentClass.name}</div>
            <p className="text-xs text-muted-foreground">
              {topEnrollmentClass.students} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Admissions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topAdmissionClass.name}</div>
            <p className="text-xs text-muted-foreground">
              {topAdmissionClass.admissions} new students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Class Enrollment</TabsTrigger>
          <TabsTrigger value="admissions">New Admissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CombinedEnrollmentAdmissionsChart 
            enrollmentChartData={enrollmentData} 
            newAdmissionsChartData={admissionData} 
          />
        </TabsContent>

        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Class Enrollment</CardTitle>
              <CardDescription>
                Comprehensive view of student enrollment across all classes with color-coded visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedClassEnrollmentChart data={enrollmentData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admissions">
          <Card>
            <CardHeader>
              <CardTitle>Detailed New Admissions</CardTitle>
              <CardDescription>
                Comprehensive view of new student admissions with color-coded visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedNewAdmissionsChart data={admissionData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}