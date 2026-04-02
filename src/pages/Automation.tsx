import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Workflow, Zap, Bell, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastRun: string;
  runs: number;
}

const initialWorkflows: WorkflowItem[] = [
  { id: "1", name: "Low Attendance Alert", trigger: "Attendance < 75%", action: "Send notification to student & parent", enabled: true, lastRun: "2 hours ago", runs: 47 },
  { id: "2", name: "Fee Reminder", trigger: "Fee pending > 30 days", action: "Send email + SMS reminder", enabled: true, lastRun: "1 day ago", runs: 123 },
  { id: "3", name: "Admission Confirmation", trigger: "Payment successful", action: "Create student record + send welcome email", enabled: true, lastRun: "3 days ago", runs: 15 },
  { id: "4", name: "Monthly Report", trigger: "1st of every month", action: "Generate & email summary report to admin", enabled: false, lastRun: "30 days ago", runs: 6 },
  { id: "5", name: "Dropout Risk Alert", trigger: "Risk score > 70%", action: "Notify HOD and counselor", enabled: true, lastRun: "5 hours ago", runs: 8 },
];

const automationLog = [
  { time: "2026-03-26 10:30", workflow: "Low Attendance Alert", student: "Harsh Sharma", result: "success" },
  { time: "2026-03-26 09:15", workflow: "Fee Reminder", student: "Divya Reddy", result: "success" },
  { time: "2026-03-26 08:00", workflow: "Dropout Risk Alert", student: "Om Mishra", result: "success" },
  { time: "2026-03-25 16:45", workflow: "Low Attendance Alert", student: "Farhan Das", result: "success" },
  { time: "2026-03-25 14:30", workflow: "Fee Reminder", student: "Kavya Patel", result: "failed" },
  { time: "2026-03-25 10:00", workflow: "Admission Confirmation", student: "Ravi Shankar", result: "success" },
];

export default function Automation() {
  const [workflows, setWorkflows] = useState(initialWorkflows);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Workflow className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Automation</h1>
            <p className="text-muted-foreground text-sm">n8n-style workflow automation rules</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{workflows.filter(w => w.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{workflows.reduce((s, w) => s + w.runs, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Runs</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{automationLog.length}</p>
                <p className="text-sm text-muted-foreground">Recent Triggers</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflows */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Automation Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workflows.map(w => (
              <div key={w.id} className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${w.enabled ? "bg-card" : "bg-muted/50 opacity-70"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className={`h-4 w-4 ${w.enabled ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-medium text-sm">{w.name}</p>
                    <Badge variant="secondary" className="text-xs">{w.runs} runs</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="bg-muted rounded px-2 py-0.5">When: {w.trigger}</span>
                    <span>→</span>
                    <span className="bg-muted rounded px-2 py-0.5">Then: {w.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Last run: {w.lastRun}</p>
                </div>
                <Switch checked={w.enabled} onCheckedChange={() => toggleWorkflow(w.id)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Automation Log */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Automation Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead className="hidden sm:table-cell">Student</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automationLog.map((log) => (
                  <TableRow key={`${log.time}-${log.student}`}>
                    <TableCell className="text-sm text-muted-foreground">{log.time}</TableCell>
                    <TableCell className="font-medium text-sm">{log.workflow}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{log.student}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs border-0 ${log.result === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {log.result === "success" ? <><CheckCircle className="h-3 w-3 mr-1" /> Success</> : <><AlertTriangle className="h-3 w-3 mr-1" /> Failed</>}
                      </Badge>
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
