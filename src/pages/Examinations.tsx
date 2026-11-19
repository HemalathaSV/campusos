import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents, branches } from "@/data/seedData";
import { branchCourses, calculateGrade, generateStudentAcademicRecord, SubjectCourse } from "@/data/examinationData";
import { exportToCsv } from "@/utils/exportCsv";
import { addNotification } from "@/services/notifications";
import { toast } from "@/hooks/use-toast";
import {
  Award,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Download,
  Save,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Printer
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function Examinations() {
  const { role, user, collegeId } = useAuth();
  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  // Current student identity for student portal view
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === (user as any)?.uid) || allStudents[0];
  }, [allStudents, user]);

  // Student academic transcript record
  const studentAcademicRecord = useMemo(() => {
    const branchId = typeof currentStudent?.branch === "object" ? currentStudent.branch.id : "cs";
    return generateStudentAcademicRecord(currentStudent?.id || "student-1", branchId, currentStudent?.year || 2);
  }, [currentStudent]);

  // Student selected semester tab
  const [selectedSemester, setSelectedSemester] = useState<number>(studentAcademicRecord.semesters.length || 1);

  // Faculty / Admin Filter State
  const [facultyBranch, setFacultyBranch] = useState("cs");
  const [facultyYear, setFacultyYear] = useState("2");
  const [facultySemester, setFacultySemester] = useState("3");
  const [facultyCourseCode, setFacultyCourseCode] = useState("CS301");

  // Available courses for current filter
  const availableCourses = useMemo(() => {
    const list = branchCourses.filter(c => c.branchId === facultyBranch && c.semester === parseInt(facultySemester));
    return list.length > 0 ? list : [
      { code: `${facultyBranch.toUpperCase()}101`, title: "Core Engineering Principles", credits: 4, type: "Theory" as const, branchId: facultyBranch, semester: parseInt(facultySemester) },
      { code: `${facultyBranch.toUpperCase()}102`, title: "Laboratory Applied Workshop", credits: 2, type: "Lab" as const, branchId: facultyBranch, semester: parseInt(facultySemester) },
    ];
  }, [facultyBranch, facultySemester]);

  // Ensure selected course code exists in current list
  useEffect(() => {
    if (availableCourses.length > 0 && !availableCourses.some(c => c.code === facultyCourseCode)) {
      setFacultyCourseCode(availableCourses[0].code);
    }
  }, [availableCourses, facultyCourseCode]);

  // Students in selected branch & year
  const rosterStudents = useMemo(() => {
    return allStudents.filter(s => {
      const bId = typeof s.branch === "object" ? s.branch.id : "cs";
      return (facultyBranch === "all" || bId === facultyBranch) && s.year === parseInt(facultyYear);
    });
  }, [allStudents, facultyBranch, facultyYear]);

  // Editable marks map: studentId -> { internal: number, external: number }
  const [marksState, setMarksState] = useState<Record<string, { internal: number; external: number }>>({});

  // Initialize marks from storage or generator
  useEffect(() => {
    const storageKey = `exam_marks_${facultyCourseCode}_${collegeId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setMarksState(JSON.parse(stored));
        return;
      } catch {}
    }

    // Default seeded marks for roster
    const initialMap: Record<string, { internal: number; external: number }> = {};
    rosterStudents.forEach((student, index) => {
      const seed = (index * 7 + parseInt(facultySemester) * 13) % 15;
      initialMap[student.id] = {
        internal: Math.min(40, 26 + seed),
        external: Math.min(60, 38 + seed * 2),
      };
    });
    setMarksState(initialMap);
  }, [facultyCourseCode, rosterStudents, collegeId, facultySemester]);

  const handleScoreChange = (studentId: string, field: "internal" | "external", valStr: string) => {
    const max = field === "internal" ? 40 : 60;
    const num = Math.max(0, Math.min(max, parseInt(valStr) || 0));
    setMarksState(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { internal: 25, external: 35 }),
        [field]: num,
      },
    }));
  };

  const handleSaveMarks = () => {
    const storageKey = `exam_marks_${facultyCourseCode}_${collegeId}`;
    localStorage.setItem(storageKey, JSON.stringify(marksState));
    toast({
      title: "Grades Saved Successfully",
      description: `Evaluation records updated for ${facultyCourseCode} (${rosterStudents.length} students).`,
    });

    addNotification({
      title: "Exam Marks Published",
      message: `Results published for ${facultyCourseCode} (${rosterStudents.length} students).`,
      type: "success",
      targetRole: "all",
    });
  };

  const handleExportMarks = () => {
    const activeCourse = availableCourses.find(c => c.code === facultyCourseCode);
    exportToCsv(
      `grade_sheet_${facultyCourseCode}_${new Date().toISOString().split("T")[0]}`,
      rosterStudents,
      [
        { header: "USN", accessor: s => s.usn },
        { header: "Student Name", accessor: s => s.name },
        { header: "Course Code", accessor: () => facultyCourseCode },
        { header: "Course Title", accessor: () => activeCourse?.title || "Course" },
        { header: "Internal Marks (Max 40)", accessor: s => marksState[s.id]?.internal ?? 0 },
        { header: "External Marks (Max 60)", accessor: s => marksState[s.id]?.external ?? 0 },
        {
          header: "Total Marks (Max 100)",
          accessor: s => (marksState[s.id]?.internal ?? 0) + (marksState[s.id]?.external ?? 0),
        },
        {
          header: "Letter Grade",
          accessor: s => {
            const tot = (marksState[s.id]?.internal ?? 0) + (marksState[s.id]?.external ?? 0);
            return calculateGrade(tot).gradeLetter;
          },
        },
        {
          header: "Status",
          accessor: s => {
            const tot = (marksState[s.id]?.internal ?? 0) + (marksState[s.id]?.external ?? 0);
            return calculateGrade(tot).status;
          },
        },
      ]
    );
    toast({ title: "Grade Sheet Exported", description: `Exported ${rosterStudents.length} records to CSV.` });
  };

  // Student active semester record
  const currentSemesterResult = useMemo(() => {
    return (
      studentAcademicRecord.semesters.find(s => s.semester === selectedSemester) ||
      studentAcademicRecord.semesters[studentAcademicRecord.semesters.length - 1]
    );
  }, [studentAcademicRecord, selectedSemester]);

  // Chart data for semester SGPA trajectory
  const sgpaChartData = useMemo(() => {
    return studentAcademicRecord.semesters.map(s => ({
      semester: `Sem ${s.semester}`,
      sgpa: s.sgpa,
    }));
  }, [studentAcademicRecord]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Examinations & Grading</h1>
            <p className="text-muted-foreground text-sm">
              Academic score evaluation, semester GPA tracking, and official grade transcripts
            </p>
          </div>
          {role === "student" && (
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print Transcript
            </Button>
          )}
        </div>

        {/* =========================================================================
            STUDENT VIEW: Personal Report Card, SGPA/CGPA Tracker & Transcript
           ========================================================================= */}
        {role === "student" ? (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                      Cumulative GPA
                    </p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {studentAcademicRecord.cgpa} <span className="text-sm text-muted-foreground font-normal">/ 10.0</span>
                    </p>
                    <Badge className="bg-success/15 text-success border-0 text-xs mt-2">
                      First Class with Distinction
                    </Badge>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                      Total Credits Completed
                    </p>
                    <p className="text-3xl font-display font-bold text-foreground">
                      {studentAcademicRecord.totalCreditsEarned} <span className="text-sm text-muted-foreground font-normal">Credits</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">160 required for graduation</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center text-info">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                      Academic Standing
                    </p>
                    <p className="text-3xl font-display font-bold text-success">Good</p>
                    <p className="text-xs text-muted-foreground mt-2">0 Backlogs • Eligible for Campus Placement</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center text-success">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SGPA Progress Chart */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">Semester SGPA Trajectory</CardTitle>
                    <CardDescription>Academic progression across enrolled semesters</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Current Sem {studentAcademicRecord.semesters.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sgpaChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sgpaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                      <XAxis dataKey="semester" stroke="#888" fontSize={12} tickLine={false} />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#888" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                        }}
                        formatter={(val: any) => [`${val} / 10.0`, "SGPA"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="sgpa"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#sgpaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Semester-wise Subject Grade Table */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="font-display text-lg">Semester Grade Card</CardTitle>
                    <CardDescription>Detailed subject scores and grade points</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Select Semester:</span>
                    <div className="flex gap-1 bg-muted p-1 rounded-lg">
                      {studentAcademicRecord.semesters.map(sem => (
                        <Button
                          key={sem.semester}
                          size="sm"
                          variant={selectedSemester === sem.semester ? "default" : "ghost"}
                          className={`h-7 px-3 text-xs ${selectedSemester === sem.semester ? "gradient-primary border-0" : ""}`}
                          onClick={() => setSelectedSemester(sem.semester)}
                        >
                          Sem {sem.semester}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Internal (40)</TableHead>
                      <TableHead className="text-center">Exam (60)</TableHead>
                      <TableHead className="text-center">Total (100)</TableHead>
                      <TableHead className="text-center">Grade Point</TableHead>
                      <TableHead className="text-center">Letter Grade</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSemesterResult.courses.map(course => (
                      <TableRow key={course.courseCode}>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {course.courseCode}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{course.courseTitle}</TableCell>
                        <TableCell className="text-center">{course.credits}</TableCell>
                        <TableCell className="text-center font-mono">{course.internalMarks}</TableCell>
                        <TableCell className="text-center font-mono">{course.externalMarks}</TableCell>
                        <TableCell className="text-center font-mono font-bold">{course.totalMarks}</TableCell>
                        <TableCell className="text-center font-mono">{course.gradePoint}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`border-0 text-xs font-bold ${
                              course.gradeLetter === "O" || course.gradeLetter === "A+"
                                ? "bg-success/15 text-success"
                                : course.gradeLetter === "A" || course.gradeLetter === "B+"
                                ? "bg-primary/15 text-primary"
                                : "bg-warning/15 text-warning"
                            }`}
                          >
                            {course.gradeLetter}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs bg-success/5 text-success border-success/30">
                            {course.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 bg-muted/20 border-t border-border flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      Total Credits: <strong>{currentSemesterResult.totalCredits}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Earned Credits: <strong>{currentSemesterResult.earnedCredits}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Semester SGPA: <strong className="text-primary text-base">{currentSemesterResult.sgpa}</strong>
                    </span>
                  </div>
                  <Badge className="bg-success text-success-foreground border-0 py-1 px-3">
                    Semester Result: PASSED
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* =========================================================================
             FACULTY & ADMIN VIEW: Grade Entry, Score Evaluation & Class Sheets
             ========================================================================= */
          <div className="space-y-6">
            {/* Filter Controls Card */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                      Branch
                    </label>
                    <select
                      value={facultyBranch}
                      onChange={e => setFacultyBranch(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                      Year
                    </label>
                    <select
                      value={facultyYear}
                      onChange={e => {
                        setFacultyYear(e.target.value);
                        setFacultySemester(String(parseInt(e.target.value) * 2 - 1));
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {[1, 2, 3, 4].map(y => (
                        <option key={y} value={String(y)}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                      Semester
                    </label>
                    <select
                      value={facultySemester}
                      onChange={e => setFacultySemester(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(s => (
                        <option key={s} value={String(s)}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                      Course Subject
                    </label>
                    <select
                      value={facultyCourseCode}
                      onChange={e => setFacultyCourseCode(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                    >
                      {availableCourses.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roster Evaluation Table */}
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" /> Evaluation Sheet: {facultyCourseCode}
                  </CardTitle>
                  <CardDescription>
                    {availableCourses.find(c => c.code === facultyCourseCode)?.title || "Selected Course"} •{" "}
                    {rosterStudents.length} Students Enrolled
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportMarks} className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                  <Button size="sm" onClick={handleSaveMarks} className="gradient-primary border-0 gap-2 font-medium">
                    <Save className="h-4 w-4" /> Save Grades
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>USN</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center w-32">Internal (Max 40)</TableHead>
                      <TableHead className="text-center w-32">External (Max 60)</TableHead>
                      <TableHead className="text-center">Total (100)</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rosterStudents.slice(0, 30).map(student => {
                      const m = marksState[student.id] || { internal: 30, external: 45 };
                      const total = m.internal + m.external;
                      const { gradeLetter, status } = calculateGrade(total);

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-xs font-semibold">{student.usn}</TableCell>
                          <TableCell className="font-medium text-sm">{student.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={student.attendancePercentage >= 75 ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {student.attendancePercentage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={0}
                              max={40}
                              value={m.internal}
                              onChange={e => handleScoreChange(student.id, "internal", e.target.value)}
                              className="h-8 w-24 mx-auto text-center font-mono font-bold"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={0}
                              max={60}
                              value={m.external}
                              onChange={e => handleScoreChange(student.id, "external", e.target.value)}
                              className="h-8 w-24 mx-auto text-center font-mono font-bold"
                            />
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold text-base">{total}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={`border-0 font-bold ${
                                gradeLetter === "O" || gradeLetter === "A+"
                                  ? "bg-success/15 text-success"
                                  : gradeLetter === "A" || gradeLetter === "B+"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-warning/15 text-warning"
                              }`}
                            >
                              {gradeLetter}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={
                                status === "Pass"
                                  ? "text-success border-success/30 bg-success/5"
                                  : "text-destructive border-destructive/30 bg-destructive/5"
                              }
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {rosterStudents.length > 30 && (
                  <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
                    Showing top 30 of {rosterStudents.length} students. Export CSV for the full department evaluation sheet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
