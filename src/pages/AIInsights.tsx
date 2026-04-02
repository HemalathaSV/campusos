import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { students } from "@/data/seedData";
import { Brain, AlertTriangle, TrendingDown, Lightbulb, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["hsl(0,72%,51%)", "hsl(38,92%,50%)", "hsl(152,69%,40%)"];

export default function AIInsights() {
  const feeDefaulters = students.filter(s => s.feeStatus === "pending").sort((a, b) => a.attendancePercentage - b.attendancePercentage);
  const lowAttendance = students.filter(s => s.attendancePercentage < 75).sort((a, b) => a.attendancePercentage - b.attendancePercentage);

  // Mock risk scoring
  const atRiskStudents = students
    .map(s => ({
      ...s,
      riskScore: Math.round(
        (s.feeStatus === "pending" ? 40 : s.feeStatus === "half" ? 15 : 0) +
        (s.attendancePercentage < 60 ? 50 : s.attendancePercentage < 75 ? 25 : 0) +
        Math.random() * 10
      ),
    }))
    .filter(s => s.riskScore > 50)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 10);

  const riskDistribution = [
    { name: "High Risk", value: atRiskStudents.filter(s => s.riskScore > 70).length },
    { name: "Medium Risk", value: atRiskStudents.filter(s => s.riskScore > 50 && s.riskScore <= 70).length },
    { name: "Low Risk", value: students.length - atRiskStudents.length },
  ];

  const insights = [
    { icon: AlertTriangle, title: `${feeDefaulters.length} students have pending fees`, desc: "Consider sending automated reminders", type: "warning" as const },
    { icon: TrendingDown, title: `${lowAttendance.length} students below 75% attendance`, desc: "Faculty should counsel these students", type: "destructive" as const },
    { icon: Target, title: `${atRiskStudents.length} students at dropout risk`, desc: "Based on combined fee + attendance analysis", type: "destructive" as const },
    { icon: Lightbulb, title: "CS branch has highest collection rate", desc: "Other branches may need targeted follow-up", type: "info" as const },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground text-sm">AI-powered analysis of student data</p>
          </div>
        </div>

        {/* AI Summary Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <Card key={ins.title} className="border-border/50">
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ins.type === "warning" ? "bg-warning/10" : ins.type === "destructive" ? "bg-destructive/10" : "bg-info/10"}`}>
                  <ins.icon className={`h-5 w-5 ${ins.type === "warning" ? "text-warning" : ins.type === "destructive" ? "text-destructive" : "text-info"}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{ins.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ins.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg">Dropout Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={riskDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label>
                    {riskDistribution.map((item, i) => <Cell key={item.name} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* At-Risk Students */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-lg">Students Likely to Drop Out</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Fees</TableHead>
                    <TableHead>Attend.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskStudents.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.usn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border-0 ${s.riskScore > 70 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                          {s.riskScore}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs capitalize">{s.feeStatus}</TableCell>
                      <TableCell>
                        <Badge variant={s.attendancePercentage >= 75 ? "secondary" : "destructive"} className="text-xs">
                          {s.attendancePercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
