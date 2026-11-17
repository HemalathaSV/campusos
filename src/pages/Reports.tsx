import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select as CustomSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAllStudents, branches } from "@/data/seedData";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Download, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type ReportType = "student" | "fee" | "attendance";

export default function Reports() {
  const { collegeId } = useAuth();
  const [reportType, setReportType] = useState<ReportType>("student");
  const [branchFilter, setBranchFilter] = useState("all");

  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);
  const filtered = branchFilter === "all" ? allStudents : allStudents.filter(s => s.branch.id === branchFilter);

  const feeData = branches.map(b => {
    const branchStudents = allStudents.filter(s => s.branch.id === b.id);
    return {
      name: b.code,
      collected: branchStudents.reduce((sum, s) => sum + s.paidAmount, 0) / 100000,
      pending: branchStudents.reduce((sum, s) => sum + (s.totalFee - s.paidAmount), 0) / 100000,
    };
  });

  const attendanceData = branches.map(b => {
    const branchStudents = allStudents.filter(s => s.branch.id === b.id);
    return {
      name: b.code,
      avg: branchStudents.length === 0 ? 0 : Math.round(branchStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / branchStudents.length),
      below75: branchStudents.filter(s => s.attendancePercentage < 75).length,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground text-sm">Generate and export detailed reports</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print / Export PDF
          </Button>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-3">
          {[
            { value: "student" as const, label: "Student Report" },
            { value: "fee" as const, label: "Fee Report" },
            { value: "attendance" as const, label: "Attendance Report" },
          ].map(t => (
            <Button
              key={t.value}
              variant={reportType === t.value ? "default" : "outline"}
              className={reportType === t.value ? "gradient-primary border-0" : ""}
              onClick={() => setReportType(t.value)}
            >
              {t.label}
            </Button>
          ))}
          <select 
            value={branchFilter} 
            onChange={e => setBranchFilter(e.target.value)}
            className="flex h-10 w-44 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {reportType === "student" && (
          <Card className="border-border/50">
            <CardHeader><CardTitle className="font-display text-lg">Student Report ({filtered.length} students)</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>USN</TableHead><TableHead>Name</TableHead><TableHead>Branch</TableHead>
                    <TableHead>Year</TableHead><TableHead>Fee Status</TableHead><TableHead>Attendance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 30).map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.usn}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.branch.name}</TableCell>
                      <TableCell>{s.year}</TableCell>
                      <TableCell><Badge className={`text-xs border-0 ${s.feeStatus === "full" ? "bg-success/10 text-success" : s.feeStatus === "half" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>{s.feeStatus}</Badge></TableCell>
                      <TableCell><Badge variant={s.attendancePercentage >= 75 ? "secondary" : "destructive"} className="text-xs">{s.attendancePercentage}%</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportType === "fee" && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-display text-lg">Fee Collection by Branch (in Lakhs)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={feeData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={v => `₹${v}L`} />
                    <Tooltip formatter={(v: number) => `₹${v.toFixed(1)}L`} />
                    <Bar dataKey="collected" fill="hsl(152,69%,40%)" name="Collected" radius={[4,4,0,0]} />
                    <Bar dataKey="pending" fill="hsl(0,72%,51%)" name="Pending" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-display text-lg">Fee Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-success">{students.filter(s => s.feeStatus === "full").length}</p><p className="text-sm text-muted-foreground">Full Paid</p></div>
                  <div><p className="text-2xl font-bold text-warning">{students.filter(s => s.feeStatus === "half").length}</p><p className="text-sm text-muted-foreground">Half Paid</p></div>
                  <div><p className="text-2xl font-bold text-destructive">{students.filter(s => s.feeStatus === "pending").length}</p><p className="text-sm text-muted-foreground">Pending</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "attendance" && (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader><CardTitle className="font-display text-lg">Attendance by Branch</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="hsl(230,75%,55%)" name="Avg %" radius={[4,4,0,0]} />
                    <Bar dataKey="below75" fill="hsl(0,72%,51%)" name="Below 75%" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
