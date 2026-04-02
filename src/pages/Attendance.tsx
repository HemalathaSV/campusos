import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select as CustomSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { branches, recordDailyAttendance, dailyLedger, getAllStudents } from "@/data/seedData";
import { CalendarCheck, Save, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Attendance() {
  const { role, collegeId } = useAuth();
  const [branchFilter, setBranchFilter] = useState("cs");
  const [yearFilter, setYearFilter] = useState("1");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const activeStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  const filtered = useMemo(() => {
    return activeStudents.filter(s => 
      (branchFilter === "all" || s.branch.id === branchFilter) && 
      (yearFilter === "all" || s.year === parseInt(yearFilter))
    );
  }, [activeStudents, branchFilter, yearFilter]);

  // Initialize attendance
  useMemo(() => {
    const init: Record<string, boolean> = {};
    const record = dailyLedger[date];
    filtered.forEach(s => { 
      if (record && record[s.id] !== undefined) {
        init[s.id] = record[s.id];
      } else {
        init[s.id] = true; // default present if not recorded
      }
    });
    setAttendance(init);
    setSaved(!!record);
  }, [branchFilter, yearFilter, date]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const markAllPresent = () => {
    const all: Record<string, boolean> = {};
    filtered.forEach(s => { all[s.id] = true; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = () => {
    recordDailyAttendance(date, attendance, collegeId);
    setSaved(true);
    const presentCount = Object.values(attendance).filter(Boolean).length;
    toast({ title: "Attendance Saved", description: `${presentCount}/${filtered.length} students marked present for ${date}` });
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = Object.keys(attendance).length - presentCount;
  
  const chartData = role === "admin" ? [
    { name: "Present", value: presentCount, color: "#10b981" },
    { name: "Absent", value: absentCount, color: "#ef4444" }
  ].filter(d => d.value > 0) : [];

  if (role === "student") {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center animate-fade-in">
          <Card className="max-w-md w-full border-border/50 text-center p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-destructive mb-3">Access Restricted</h2>
            <p className="text-muted-foreground">Students do not have access to the master attendance ledger. Please view your attendance standing directly from your profile page.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Attendance</h1>
            <p className="text-muted-foreground text-sm">Mark daily attendance for students</p>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <select 
                value={branchFilter} 
                onChange={e => setBranchFilter(e.target.value)}
                className="flex h-10 w-48 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select 
                value={yearFilter} 
                onChange={e => setYearFilter(e.target.value)}
                className="flex h-10 w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={String(y)}>Year {y}</option>)}
              </select>
              <div className="flex-1" />
              <div className="flex items-center gap-2 border border-border/50 rounded-md px-3 py-1.5 bg-background shadow-sm">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm p-0 w-[110px]"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              {role === "faculty" && (
                <>
                  <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
                  <Button size="sm" className="gradient-primary border-0" onClick={handleSave} disabled={saved}>
                    {saved ? <><CheckCircle className="h-4 w-4 mr-1" /> Saved</> : <><Save className="h-4 w-4 mr-1" /> Save Attendance</>}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary & Chart */}
        {role === "admin" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-border/50 h-full shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-semibold">Daily Attendance Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[250px] flex items-end">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "hsl(var(--background))" }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-4xl font-bold text-success">
                    {presentCount}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Present</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-4xl font-bold text-destructive">
                    {absentCount}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Absent</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
                  <p className="text-4xl font-bold">{filtered.length}</p>
                  <p className="text-sm font-medium text-muted-foreground mt-2">Total Enrolled</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Present</TableHead>
                  <TableHead>USN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Overall %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className={!attendance[s.id] ? "bg-destructive/5" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={attendance[s.id] ?? true} 
                        onCheckedChange={() => toggleAttendance(s.id)}
                        disabled={role !== "faculty"} 
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{s.usn}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant={s.attendancePercentage >= 75 ? "secondary" : "destructive"} className="text-xs">
                        {s.attendancePercentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.attendancePercentage < 75 && (
                        <Badge className="bg-destructive/10 text-destructive border-0 text-xs">⚠ Below 75%</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
