import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { branches } from "@/data/seedData";
import {
  standardTimeSlots,
  weekDays,
  getTimetableSessions,
  ClassSession
} from "@/data/timetableData";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Printer,
  Download,
  CalendarCheck,
  Sparkles,
  LayoutGrid,
  ListFilter
} from "lucide-react";

export default function Timetable() {
  const { role, user } = useAuth();

  // Detect current day of week (fallback to Monday if Sunday)
  const currentDayName = useMemo(() => {
    const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return weekDays.includes(day as any) ? (day as typeof weekDays[number]) : "Monday";
  }, []);

  const [selectedBranch, setSelectedBranch] = useState("cs");
  const [selectedDay, setSelectedDay] = useState<typeof weekDays[number]>(currentDayName);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const allSessions = useMemo(() => {
    return getTimetableSessions(selectedBranch);
  }, [selectedBranch]);

  // Filtered sessions for the selected day
  const daySessions = useMemo(() => {
    return allSessions.filter(s => s.day === selectedDay);
  }, [allSessions, selectedDay]);

  const handleExportCsv = () => {
    const branchName = branches.find(b => b.id === selectedBranch)?.name || "Engineering";
    exportToCsv(
      `timetable_${selectedBranch}_${new Date().toISOString().split("T")[0]}`,
      allSessions,
      [
        { header: "Day", accessor: s => s.day },
        { header: "Time Range", accessor: s => s.timeRange },
        { header: "Course Code", accessor: s => s.courseCode },
        { header: "Course Title", accessor: s => s.courseTitle },
        { header: "Session Type", accessor: s => s.type },
        { header: "Instructor", accessor: s => s.instructor },
        { header: "Classroom / Venue", accessor: s => s.room },
      ]
    );
    toast({ title: "Timetable Exported", description: `Exported full weekly schedule for ${branchName}.` });
  };

  const getTypeBadge = (type: ClassSession["type"]) => {
    switch (type) {
      case "Lab":
        return <Badge className="bg-accent/15 text-accent border-0 text-[11px] font-semibold">🔬 Practical Lab</Badge>;
      case "Tutorial":
        return <Badge className="bg-warning/15 text-warning border-0 text-[11px] font-semibold">📝 Tutorial</Badge>;
      default:
        return <Badge className="bg-primary/15 text-primary border-0 text-[11px] font-semibold">📘 Lecture</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Class Timetable</h1>
            <p className="text-muted-foreground text-sm">
              Weekly academic schedule, lecture halls, and laboratory sessions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print Timetable
            </Button>
          </div>
        </div>

        {/* Filter Bar & Today Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <Card className="border-border/50 md:col-span-2">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Branch:</span>
                <select
                  value={selectedBranch}
                  onChange={e => setSelectedBranch(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={viewMode === "day" ? "default" : "ghost"}
                  className={`h-7 px-3 text-xs gap-1.5 ${viewMode === "day" ? "gradient-primary border-0" : ""}`}
                  onClick={() => setViewMode("day")}
                >
                  <ListFilter className="h-3.5 w-3.5" /> Day Schedule
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "week" ? "default" : "ghost"}
                  className={`h-7 px-3 text-xs gap-1.5 ${viewMode === "week" ? "gradient-primary border-0" : ""}`}
                  onClick={() => setViewMode("week")}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Full Week Grid
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Context Banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Today's Schedule</p>
                <p className="text-sm font-bold truncate text-foreground">
                  {currentDayName} • {allSessions.filter(s => s.day === currentDayName).length} Sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =========================================================================
            DAY TIMELINE VIEW
           ========================================================================= */}
        {viewMode === "day" ? (
          <div className="space-y-4">
            {/* Days Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1">
              {weekDays.map(day => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  className={`h-9 px-4 shrink-0 font-medium ${
                    selectedDay === day ? "gradient-primary border-0 font-bold" : ""
                  }`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {day === currentDayName && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-background/20 text-[10px] uppercase">
                      Today
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Chronological Time Slot Timeline */}
            <div className="space-y-3">
              {standardTimeSlots.map(slot => {
                if (slot.isBreak) {
                  return (
                    <div
                      key={slot.id}
                      className="py-2.5 px-4 rounded-xl border border-dashed border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{slot.timeRange}</span>
                      </div>
                      <span className="italic">{slot.breakLabel}</span>
                    </div>
                  );
                }

                const session = daySessions.find(s => s.slotId === slot.id);

                return (
                  <Card
                    key={slot.id}
                    className={`border transition-all ${
                      session ? "border-border/70 hover:shadow-md" : "border-border/30 bg-muted/10 opacity-60"
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Time Period */}
                      <div className="flex items-center gap-3 sm:w-56 shrink-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-mono text-xs font-bold">
                          {slot.id.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground font-mono">{slot.timeRange}</p>
                          <p className="text-xs text-muted-foreground/80">60 Minutes</p>
                        </div>
                      </div>

                      {/* Middle: Course & Instructor */}
                      {session ? (
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                              {session.courseCode}
                            </span>
                            <span className="font-display font-semibold text-sm sm:text-base text-foreground truncate">
                              {session.courseTitle}
                            </span>
                            {getTypeBadge(session.type)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {session.instructor}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              {session.room}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-sm text-muted-foreground italic">
                          No class scheduled • Self Study / Library Hour
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          /* =========================================================================
              FULL WEEK GRID VIEW
             ========================================================================= */
          <Card className="border-border/50 overflow-x-auto">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="font-display text-lg">Master Weekly Timetable Grid</CardTitle>
              <CardDescription>Consolidated weekly schedule across all days and periods</CardDescription>
            </CardHeader>
            <CardContent className="p-0 min-w-[850px]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="p-3 font-semibold text-muted-foreground w-28">Time Slot</th>
                    {weekDays.map(day => (
                      <th
                        key={day}
                        className={`p-3 font-semibold text-center ${
                          day === currentDayName ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {standardTimeSlots.map(slot => {
                    if (slot.isBreak) {
                      return (
                        <tr key={slot.id} className="bg-muted/20">
                          <td className="p-2 font-mono text-[11px] text-muted-foreground font-semibold">
                            {slot.timeRange}
                          </td>
                          <td colSpan={weekDays.length} className="p-2 text-center text-xs text-muted-foreground italic font-medium">
                            {slot.breakLabel}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={slot.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-muted-foreground font-semibold align-top whitespace-nowrap">
                          {slot.timeRange}
                        </td>
                        {weekDays.map(day => {
                          const sess = allSessions.find(s => s.day === day && s.slotId === slot.id);
                          return (
                            <td
                              key={day}
                              className={`p-2 align-top border-l border-border/40 ${
                                day === currentDayName ? "bg-primary/5" : ""
                              }`}
                            >
                              {sess ? (
                                <div className="p-2 rounded-lg border border-border/70 bg-card shadow-xs space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-mono font-bold text-[10px] text-primary">{sess.courseCode}</span>
                                    <span className="text-[9px] uppercase font-semibold text-muted-foreground">{sess.type}</span>
                                  </div>
                                  <p className="font-semibold text-xs leading-tight line-clamp-1">{sess.courseTitle}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{sess.instructor}</p>
                                  <p className="text-[10px] text-primary/80 font-medium truncate">{sess.room}</p>
                                </div>
                              ) : (
                                <div className="h-16 flex items-center justify-center text-[11px] text-muted-foreground/40 italic">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
