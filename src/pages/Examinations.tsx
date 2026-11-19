import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents, branches } from "@/data/seedData";
import {
  branchCourses,
  calculateGrade,
  generateStudentAcademicRecord,
  registerSupplementaryExam,
  getSupplementaryRegistrations,
  SupplementaryRegistration,
  SubjectCourse
} from "@/data/examinationData";
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
  AlertTriangle,
  Printer,
  RotateCcw,
  Clock,
  ShieldCheck,
  QrCode,
  Smartphone,
  Check,
  Loader2,
  ArrowRight,
  ExternalLink
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

  // Supplementary registrations state
  const [supplementaryList, setSupplementaryList] = useState<SupplementaryRegistration[]>(() =>
    getSupplementaryRegistrations(currentStudent?.id)
  );
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedBacklogForRegistration, setSelectedBacklogForRegistration] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<"details" | "scanner" | "processing" | "success">("details");
  const [activeReceiptNumber, setActiveReceiptNumber] = useState("");

  // Admin / Faculty active tab
  const [adminTab, setAdminTab] = useState<"evaluation" | "backlogs">("evaluation");

  // Reload supplementary list when student changes
  useEffect(() => {
    if (currentStudent?.id) {
      setSupplementaryList(getSupplementaryRegistrations(currentStudent.id));
    }
  }, [currentStudent?.id]);

  const handleOpenRegistrationModal = (course: any) => {
    setSelectedBacklogForRegistration(course);
    setPaymentStep("details");
    setIsRegisterModalOpen(true);
  };

  const handleProceedToUpiScanner = () => {
    setPaymentStep("scanner");
  };

  const handleCompleteUpiPayment = (course: any) => {
    if (!currentStudent?.id) return;
    setPaymentStep("processing");

    setTimeout(() => {
      const reg = registerSupplementaryExam(
        currentStudent.id,
        course.courseCode,
        course.courseTitle,
        "UPI QR Code (SBI Gateway)",
        "Admit Card Issued"
      );
      setActiveReceiptNumber(reg.receiptNumber || `REC-SUPPL-${Math.floor(100000 + Math.random() * 900000)}`);
      setSupplementaryList(getSupplementaryRegistrations(currentStudent.id));
      setPaymentStep("success");

      toast({
        title: "UPI Payment Successful! (₹500.00)",
        description: `Supplementary fee received for ${course.courseCode}. Re-test admit card generated.`,
      });

      addNotification({
        title: "Supplementary Exam Fee Paid (₹500)",
        message: `Payment of ₹500 verified for ${course.courseCode} (${course.courseTitle}). Hall ticket & admit card issued.`,
        type: "success",
        targetRole: "student",
      });
    }, 1200);
  };

  const handleSimulateClearBacklog = (courseCode: string) => {
    if (!currentStudent?.id) return;
    const key = `cleared_backlogs_${currentStudent.id}`;
    const cleared: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    if (!cleared.includes(courseCode)) {
      cleared.push(courseCode);
      localStorage.setItem(key, JSON.stringify(cleared));
    }
    toast({
      title: "Backlog Cleared in Retest",
      description: `Supplementary examination for ${courseCode} passed successfully! Academic records updated.`,
    });
    // Force re-render
    window.location.reload();
  };

  // College-wide students with backlogs for Faculty / Admin
  const studentsWithBacklogs = useMemo(() => {
    return allStudents
      .map(st => {
        const bId = typeof st.branch === "object" ? st.branch.id : "cs";
        const record = generateStudentAcademicRecord(st.id, bId, st.year || 2);
        return {
          student: st,
          record,
        };
      })
      .filter(item => item.record.hasBacklogs);
  }, [allStudents]);

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
                    <p
                      className={`text-3xl font-display font-bold ${
                        studentAcademicRecord.activeBacklogsCount === 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {studentAcademicRecord.activeBacklogsCount === 0
                        ? "Clear"
                        : `${studentAcademicRecord.activeBacklogsCount} Backlog${
                            studentAcademicRecord.activeBacklogsCount > 1 ? "s" : ""
                          }`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {studentAcademicRecord.activeBacklogsCount === 0
                        ? "0 Backlogs • Eligible for Campus Placement"
                        : "Requires supplementary exam clearance"}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      studentAcademicRecord.activeBacklogsCount === 0
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {studentAcademicRecord.activeBacklogsCount === 0 ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backlog Alert & Supplementary Re-Exam Management */}
            {studentAcademicRecord.activeBacklogsCount > 0 && (
              <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
                      <CardTitle className="text-base font-semibold text-destructive">
                        Active Backlog Courses ({studentAcademicRecord.activeBacklogsCount})
                      </CardTitle>
                    </div>
                    <Badge variant="destructive" className="w-fit">
                      Supplementary Registration Open
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    The following course(s) were not cleared during regular semester evaluations. You may register for upcoming supplementary re-examinations below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {studentAcademicRecord.backlogCourses.map(backlog => {
                      const isRegistered = supplementaryList.some(r => r.courseCode === backlog.courseCode);
                      return (
                        <div
                          key={backlog.courseCode}
                          className="p-3.5 rounded-lg border border-border/80 bg-background/80 flex flex-col justify-between gap-3 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-primary">{backlog.courseCode}</span>
                              <Badge variant="outline" className="text-xs text-destructive border-destructive/40 bg-destructive/10">
                                Grade F • Semester {backlog.semester}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm mt-1">{backlog.courseTitle}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Credits: {backlog.credits} • Internal: {backlog.internalMarks}/40 • External: {backlog.externalMarks}/60 (Total: {backlog.totalMarks}/100)
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                            {isRegistered ? (
                              <Badge className="bg-info/15 text-info border-0 text-xs py-1 px-2.5 gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> Supplementary Registered (₹500 Paid)
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => handleOpenRegistrationModal(backlog)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Register for Re-Exam (₹500)
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-muted-foreground hover:text-foreground ml-auto"
                              title="Simulate Clearing Course"
                              onClick={() => handleSimulateClearBacklog(backlog.courseCode)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-success mr-1" /> Clear in Retest
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {supplementaryList.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border text-xs flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Registered for <strong>{supplementaryList.length}</strong> re-examination(s). Admit cards will be generated 7 days before examination dates.
                      </span>
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        Exam Fee Total: ₹{supplementaryList.length * 500}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                      <TableHead>Diagnostic Guidance</TableHead>
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
                        <TableCell className="text-xs max-w-xs text-muted-foreground">
                          <p className="font-medium text-foreground">{course.performanceRemark}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{course.remedialRecommendation}</p>
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
             FACULTY & ADMIN VIEW: Grade Entry, Evaluation & Backlog Management
             ========================================================================= */
          <div className="space-y-6">
            <div className="flex border-b border-border">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                  adminTab === "evaluation"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setAdminTab("evaluation")}
              >
                <FileCheck className="h-4 w-4 mr-2" /> Grade Entry & Marksheets
              </Button>
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                  adminTab === "backlogs"
                    ? "border-destructive text-destructive"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setAdminTab("backlogs")}
              >
                <AlertTriangle className="h-4 w-4 mr-2" /> Backlog & Arrears Tracker ({studentsWithBacklogs.length})
              </Button>
            </div>

            {adminTab === "evaluation" ? (
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
            ) : (
              /* Backlog / Arrears Register View */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase font-semibold text-muted-foreground">Total Cohort Students</p>
                      <p className="text-2xl font-bold font-display mt-1">{allStudents.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Across all branches & years</p>
                    </CardContent>
                  </Card>
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase font-semibold text-destructive">Students with Active Backlogs</p>
                      <p className="text-2xl font-bold font-display text-destructive mt-1">
                        {studentsWithBacklogs.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {((studentsWithBacklogs.length / (allStudents.length || 1)) * 100).toFixed(1)}% of total cohort
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase font-semibold text-muted-foreground">Supplementary Registrations</p>
                      <p className="text-2xl font-bold font-display text-primary mt-1">
                        {getSupplementaryRegistrations().length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Pending re-exam processing</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="font-display text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" /> Active Arrears Roster
                    </CardTitle>
                    <CardDescription>
                      Students requiring remedial classes or supplementary examination re-evaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>USN</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead className="text-center">Year</TableHead>
                          <TableHead className="text-center">Backlogs Count</TableHead>
                          <TableHead>Backlog Subject Codes</TableHead>
                          <TableHead className="text-center">CGPA</TableHead>
                          <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsWithBacklogs.map(({ student, record }) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-xs font-semibold">{student.usn}</TableCell>
                            <TableCell className="font-medium text-sm">{student.name}</TableCell>
                            <TableCell className="text-xs uppercase">
                              {typeof student.branch === "object" ? student.branch.name : student.branch}
                            </TableCell>
                            <TableCell className="text-center font-mono">Year {student.year}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="destructive" className="font-bold text-xs">
                                {record.activeBacklogsCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {record.backlogCourses.map(b => (
                                  <Badge key={b.courseCode} variant="outline" className="text-[11px] font-mono border-destructive/40 text-destructive">
                                    {b.courseCode} (Sem {b.semester})
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono font-bold text-primary">
                              {record.cgpa}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Link to={`/students/${student.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5"
                                  >
                                    <ExternalLink className="h-3 w-3" /> 360° Profile
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    toast({
                                      title: "Remedial Notice Dispatched",
                                      description: `Notification and counselor alert sent to ${student.name} (${student.usn}).`,
                                    });
                                  }}
                                >
                                  Notice
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Supplementary Exam Registration & Interactive UPI QR Scanner Modal */}
        <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
          <DialogContent className="sm:max-w-md">
            {paymentStep === "details" && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5 text-primary" /> Supplementary Re-Exam Registration
                  </DialogTitle>
                  <DialogDescription>
                    Review course arrears details and proceed to UPI fee payment gateway.
                  </DialogDescription>
                </DialogHeader>

                {selectedBacklogForRegistration && (
                  <div className="space-y-3 py-2 text-sm">
                    <div className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Course Code:</span>
                        <span className="font-mono font-bold text-primary">{selectedBacklogForRegistration.courseCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Subject Title:</span>
                        <span className="font-medium text-right text-xs">{selectedBacklogForRegistration.courseTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Original Semester:</span>
                        <span className="text-xs">Semester {selectedBacklogForRegistration.semester}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs">Payment Method:</span>
                        <span className="text-xs font-semibold flex items-center gap-1 text-primary">
                          <Smartphone className="h-3 w-3" /> Instant UPI QR Code
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2 mt-2">
                        <span className="font-semibold text-xs">Re-Exam Fee:</span>
                        <span className="font-bold text-success font-mono text-base">₹500.00</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-info/10 border border-info/20 text-xs text-info flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>Upon payment confirmation, your hall ticket and admit card will be generated immediately.</span>
                    </div>
                  </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsRegisterModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="gradient-primary border-0 gap-1.5"
                    onClick={handleProceedToUpiScanner}
                  >
                    <QrCode className="h-4 w-4" /> Open UPI Scanner (₹500)
                  </Button>
                </DialogFooter>
              </>
            )}

            {paymentStep === "scanner" && (
              <>
                <DialogHeader className="text-center sm:text-center">
                  <DialogTitle className="flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" /> Scan to Pay with Any UPI App
                  </DialogTitle>
                  <DialogDescription>
                    Scan using Google Pay, PhonePe, Paytm, or BHIM
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-3 space-y-3">
                  {/* Dynamic Styled UPI QR Code Graphic */}
                  <div className="relative p-3 bg-white rounded-2xl shadow-md border-2 border-primary/20 flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-44 h-44 text-black fill-current">
                      {/* Corner 1 */}
                      <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <rect x="13" y="13" width="12" height="12" rx="2" fill="#2563eb" />
                      {/* Corner 2 */}
                      <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <rect x="75" y="13" width="12" height="12" rx="2" fill="#2563eb" />
                      {/* Corner 3 */}
                      <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="#1e293b" strokeWidth="6" />
                      <rect x="13" y="75" width="12" height="12" rx="2" fill="#2563eb" />
                      {/* Matrix Patterns */}
                      <rect x="40" y="8" width="6" height="6" fill="#1e293b" />
                      <rect x="52" y="8" width="6" height="6" fill="#1e293b" />
                      <rect x="40" y="20" width="6" height="6" fill="#1e293b" />
                      <rect x="46" y="26" width="6" height="6" fill="#2563eb" />
                      <rect x="8" y="40" width="6" height="6" fill="#1e293b" />
                      <rect x="20" y="40" width="6" height="6" fill="#1e293b" />
                      <rect x="14" y="46" width="6" height="6" fill="#2563eb" />
                      <rect x="40" y="40" width="20" height="20" rx="3" fill="#2563eb" />
                      <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                      <rect x="68" y="42" width="8" height="8" fill="#1e293b" />
                      <rect x="82" y="42" width="6" height="6" fill="#1e293b" />
                      <rect x="76" y="52" width="8" height="8" fill="#2563eb" />
                      <rect x="40" y="68" width="8" height="8" fill="#1e293b" />
                      <rect x="54" y="74" width="8" height="8" fill="#2563eb" />
                      <rect x="42" y="84" width="6" height="6" fill="#1e293b" />
                      <rect x="68" y="68" width="8" height="8" fill="#1e293b" />
                      <rect x="80" y="74" width="8" height="8" fill="#1e293b" />
                      <rect x="72" y="86" width="14" height="6" fill="#2563eb" />
                    </svg>

                    <div className="mt-1 text-center text-slate-800">
                      <p className="font-mono text-xs font-bold tracking-tight">campusos-exams@sbi</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Campus OS Examination Cell</p>
                    </div>
                  </div>

                  {/* Payment Details Pill */}
                  <div className="w-full text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success font-mono font-bold text-sm">
                      Amount: ₹500.00
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ref: <strong>{selectedBacklogForRegistration?.courseCode}</strong> Supplementary Re-Test
                    </p>
                  </div>

                  {/* Supported UPI Apps */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/50 pt-2 w-full">
                    <span className="font-semibold text-xs">Apps:</span>
                    <Badge variant="outline" className="text-[10px]">Google Pay</Badge>
                    <Badge variant="outline" className="text-[10px]">PhonePe</Badge>
                    <Badge variant="outline" className="text-[10px]">Paytm</Badge>
                    <Badge variant="outline" className="text-[10px]">BHIM</Badge>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setPaymentStep("details")}>
                    Back
                  </Button>
                  <Button
                    className="gradient-primary border-0 gap-1.5 font-medium"
                    onClick={() => selectedBacklogForRegistration && handleCompleteUpiPayment(selectedBacklogForRegistration)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Simulate Scan & Pay (₹500)
                  </Button>
                </DialogFooter>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div>
                  <h4 className="font-semibold text-base">Verifying UPI Transaction</h4>
                  <p className="text-xs text-muted-foreground mt-1">Connecting with SBI Payment Gateway API...</p>
                </div>
              </div>
            )}

            {paymentStep === "success" && (
              <>
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="h-14 w-14 rounded-full bg-success/20 text-success flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Payment Verified & Admit Card Issued! 🎉
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Your supplementary registration fee for <strong>{selectedBacklogForRegistration?.courseCode}</strong> has been successfully credited.
                  </p>

                  <div className="w-full p-3 rounded-lg bg-muted/40 border border-border text-xs space-y-1.5 text-left mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receipt Number:</span>
                      <span className="font-mono font-bold text-primary">{activeReceiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid:</span>
                      <span className="font-mono font-bold text-success">₹500.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admit Card:</span>
                      <Badge className="bg-success text-success-foreground border-0 text-[10px]">Generated / Hall Ticket Ready</Badge>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    className="w-full gradient-primary border-0"
                    onClick={() => setIsRegisterModalOpen(false)}
                  >
                    Done & View Admit Card
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
