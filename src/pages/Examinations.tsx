import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents, branches } from "@/data/seedData";
import {
  branchCourses,
  calculateGrade,
  getPerformanceRemark,
  getUnifiedMarksStore,
  saveCourseMarksForRoster,
  getStudentCourseMarks,
  generateStudentAcademicRecord,
  registerSupplementaryExam,
  approveSupplementaryExam,
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

  // Selectable student identity for student portal view
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    return (user as any)?.uid || "student-1";
  });

  // Sync with auth user switch
  useEffect(() => {
    if ((user as any)?.uid) {
      setSelectedStudentId((user as any)?.uid);
    }
  }, [(user as any)?.uid]);

  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === selectedStudentId) || allStudents[0];
  }, [allStudents, selectedStudentId]);

  // Student academic transcript record
  const studentAcademicRecord = useMemo(() => {
    const branchId = typeof currentStudent?.branch === "object" ? currentStudent.branch.id : "cs";
    return generateStudentAcademicRecord(currentStudent?.id || "student-1", branchId, currentStudent?.year || 2);
  }, [currentStudent]);

  // Student selected semester tab
  const [selectedSemester, setSelectedSemester] = useState<number>(() => studentAcademicRecord.semesters.length || 1);

  // Sync selected semester when student changes
  useEffect(() => {
    if (studentAcademicRecord.semesters.length > 0) {
      if (selectedSemester > studentAcademicRecord.semesters.length || !studentAcademicRecord.semesters.some(s => s.semester === selectedSemester)) {
        setSelectedSemester(studentAcademicRecord.semesters.length);
      }
    }
  }, [studentAcademicRecord]);

  // Supplementary registrations state
  const [supplementaryList, setSupplementaryList] = useState<SupplementaryRegistration[]>(() =>
    getSupplementaryRegistrations(currentStudent?.id)
  );
  const [allSupplementaryRegistrations, setAllSupplementaryRegistrations] = useState<SupplementaryRegistration[]>(() =>
    getSupplementaryRegistrations()
  );

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedBacklogForRegistration, setSelectedBacklogForRegistration] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<"details" | "scanner" | "processing" | "success">("details");
  const [activeReceiptNumber, setActiveReceiptNumber] = useState("");

  // Faculty Supplementary Evaluation Dialog State
  const [evaluatingSupplementary, setEvaluatingSupplementary] = useState<SupplementaryRegistration | null>(null);
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalInternal, setEvalInternal] = useState(32);
  const [evalExternal, setEvalExternal] = useState(48);
  const [evalRemarks, setEvalRemarks] = useState(
    "Demonstrated satisfactory understanding of core concepts in supplementary test viva."
  );

  // Admin / Faculty active tab
  const [adminTab, setAdminTab] = useState<"evaluation" | "backlogs">("evaluation");

  const refreshAllRegistrations = () => {
    setAllSupplementaryRegistrations(getSupplementaryRegistrations());
    if (currentStudent?.id) {
      setSupplementaryList(getSupplementaryRegistrations(currentStudent.id));
    }
  };

  // Reload supplementary list when student changes
  useEffect(() => {
    refreshAllRegistrations();
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
        "Admit Card Issued",
        currentStudent.name,
        currentStudent.usn
      );
      setActiveReceiptNumber(reg.receiptNumber || `REC-SUPPL-${Math.floor(100000 + Math.random() * 900000)}`);
      refreshAllRegistrations();
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

  const handleOpenEvalModal = (reg: SupplementaryRegistration) => {
    setEvaluatingSupplementary(reg);
    if (reg.retestMarks) {
      setEvalInternal(reg.retestMarks.internal);
      setEvalExternal(reg.retestMarks.external);
    } else {
      setEvalInternal(32);
      setEvalExternal(48);
    }
    setEvalRemarks(
      reg.evaluationRemarks ||
        "Demonstrated satisfactory understanding of core concepts in supplementary test viva."
    );
    setIsEvalModalOpen(true);
  };

  const handleConfirmApproval = (decision: "Passed" | "Failed") => {
    if (!evaluatingSupplementary) return;
    const facultyName = (user as any)?.fullName || "Dr. Ramesh Kumar";
    const updated = approveSupplementaryExam(
      evaluatingSupplementary.id,
      decision,
      { internal: evalInternal, external: evalExternal },
      facultyName,
      evalRemarks
    );

    setIsEvalModalOpen(false);
    refreshAllRegistrations();

    if (decision === "Passed") {
      toast({
        title: "Supplementary Re-Exam: APPROVED (PASSED)",
        description: `${evaluatingSupplementary.studentName || "Student"} has passed ${evaluatingSupplementary.courseCode} with ${evalInternal + evalExternal} marks. Backlog cleared!`,
      });
    } else {
      toast({
        title: "Supplementary Re-Exam: EVALUATED (FAILED)",
        description: `${evaluatingSupplementary.studentName || "Student"} scored below pass mark in ${evaluatingSupplementary.courseCode}. Backlog remains active.`,
        variant: "destructive",
      });
    }

    // If currently evaluating the same course in evaluation view, sync local state
    if (facultyCourseCode === evaluatingSupplementary.courseCode) {
      setMarksState(prev => ({
        ...prev,
        [evaluatingSupplementary.studentId]: { internal: evalInternal, external: evalExternal },
      }));
    }
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

  // Initialize marks from unified store or getStudentCourseMarks
  useEffect(() => {
    const unifiedStore = getUnifiedMarksStore();
    const courseStore = unifiedStore[facultyCourseCode] || {};

    const initialMap: Record<string, { internal: number; external: number }> = {};
    rosterStudents.forEach((student, index) => {
      if (courseStore[student.id]) {
        initialMap[student.id] = courseStore[student.id];
      } else {
        initialMap[student.id] = getStudentCourseMarks(
          student.id,
          facultyCourseCode,
          parseInt(facultySemester),
          index
        );
      }
    });
    setMarksState(initialMap);
  }, [facultyCourseCode, rosterStudents, facultySemester]);

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
    saveCourseMarksForRoster(facultyCourseCode, marksState);
    toast({
      title: "Grades Saved & Synchronized",
      description: `Evaluation records updated for ${facultyCourseCode} (${rosterStudents.length} students). Transcripts across faculty and student portals are now synchronized.`,
    });

    addNotification({
      title: "Exam Marks Published",
      message: `Results published for ${facultyCourseCode} (${rosterStudents.length} students). Official transcripts updated.`,
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
        {
          header: "Improvement Diagnostic",
          accessor: s => {
            const intM = marksState[s.id]?.internal ?? 0;
            const extM = marksState[s.id]?.external ?? 0;
            return getPerformanceRemark(intM + extM, intM, extM).recommendation;
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
            {/* Student Record Selector & Identity Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                    studentAcademicRecord.activeBacklogsCount > 0
                      ? "bg-destructive/15 text-destructive border border-destructive/30"
                      : "bg-primary/15 text-primary border border-primary/30"
                  }`}
                >
                  {currentStudent?.name?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base">{currentStudent?.name}</span>
                    <Badge variant="outline" className="text-xs font-mono font-semibold">
                      {currentStudent?.usn}
                    </Badge>
                    {studentAcademicRecord.activeBacklogsCount > 0 ? (
                      <Badge variant="destructive" className="text-xs font-semibold gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {studentAcademicRecord.activeBacklogsCount} Active Backlog (CS202)
                      </Badge>
                    ) : (
                      <Badge className="bg-success/15 text-success border-0 text-xs font-semibold gap-1">
                        <Check className="h-3 w-3" /> All Clear (0 Backlogs)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Branch: {typeof currentStudent?.branch === "object" ? currentStudent.branch.name : "Computer Science"} • Year {currentStudent?.year} • Current Sem {studentAcademicRecord.semesters.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Switch Student Profile:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-input bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                >
                  <option value="student-1">Aarav Sharma (1SI22CS001 - Clear, 0 Backlogs)</option>
                  <option value="student-5">Arjun Reddy (1SI22CS005 - ⚠️ 1 Backlog in CS202)</option>
                  {allStudents.slice(0, 15).map(st => {
                    if (st.id === "student-1" || st.id === "student-5") return null;
                    return (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.usn})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

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
                    <Badge
                      className={`border-0 text-xs mt-2 ${
                        studentAcademicRecord.cgpa >= 8.5
                          ? "bg-success/15 text-success"
                          : studentAcademicRecord.cgpa >= 7.0
                          ? "bg-primary/15 text-primary"
                          : studentAcademicRecord.cgpa >= 5.5
                          ? "bg-warning/15 text-warning"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {studentAcademicRecord.cgpa >= 8.5
                        ? "First Class with Distinction"
                        : studentAcademicRecord.cgpa >= 7.0
                        ? "First Class"
                        : studentAcademicRecord.cgpa >= 5.5
                        ? "Second Class"
                        : "Pass Class"}
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
                          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                            {isRegistered ? (
                              (() => {
                                const reg = supplementaryList.find(r => r.courseCode === backlog.courseCode);
                                if (reg?.status === "Approved - Passed") {
                                  return (
                                    <div className="p-2 rounded bg-success/10 border border-success/30 text-xs text-success flex items-center justify-between">
                                      <span className="font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="h-4 w-4" /> Approved - PASSED (Score: {reg.retestMarks?.total}/100)
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">Sign-off by {reg.evaluatedBy}</span>
                                    </div>
                                  );
                                }
                                if (reg?.status === "Approved - Failed") {
                                  return (
                                    <div className="space-y-1.5">
                                      <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-center justify-between">
                                        <span className="font-semibold flex items-center gap-1.5">
                                          <AlertTriangle className="h-4 w-4" /> Evaluated - FAILED ({reg.retestMarks?.total}/100)
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{reg.evaluatedBy}</span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 text-xs w-full gap-1.5"
                                        onClick={() => handleOpenRegistrationModal(backlog)}
                                      >
                                        <RotateCcw className="h-3 w-3" /> Re-Register for Next Retest Cycle (₹500)
                                      </Button>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                      <Badge className="bg-warning/15 text-warning border-0 text-xs py-1 px-2.5 gap-1.5 font-medium">
                                        <Clock className="h-3.5 w-3.5" /> Re-Exam Submitted • Awaiting Faculty Approval
                                      </Badge>
                                      <span className="text-[11px] font-mono text-muted-foreground">
                                        Receipt: {reg?.receiptNumber || "REC-SUPPL"}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                      Answer scripts and practical test are pending official evaluation by <strong>Dr. Ramesh Kumar</strong>.
                                    </p>
                                  </div>
                                );
                              })()
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs gap-1.5 w-fit"
                                onClick={() => handleOpenRegistrationModal(backlog)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Register for Re-Exam (₹500)
                              </Button>
                            )}
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
                              course.gradeLetter === "F"
                                ? "bg-destructive/15 text-destructive"
                                : course.gradeLetter === "O" || course.gradeLetter === "A+"
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
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              course.status === "Pass"
                                ? "bg-success/5 text-success border-success/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }`}
                          >
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
                  <Badge
                    className={`border-0 py-1 px-3 ${
                      currentSemesterResult.courses.some(c => c.status === "Fail")
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {currentSemesterResult.courses.some(c => c.status === "Fail")
                      ? "Semester Result: BACKLOG RECORDED"
                      : "Semester Result: PASSED"}
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
                <FileCheck className="h-4 w-4 mr-2" /> Regular Grade Entry & Marksheets
              </Button>
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                  adminTab === "backlogs"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setAdminTab("backlogs")}
              >
                <AlertTriangle className="h-4 w-4 mr-2" /> Backlogs & Retest Approvals
                {allSupplementaryRegistrations.filter(r => r.status === "Admit Card Issued" || r.status === "Under Evaluation").length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0 h-4">
                    {allSupplementaryRegistrations.filter(r => r.status === "Admit Card Issued" || r.status === "Under Evaluation").length}
                  </Badge>
                )}
              </Button>
            </div>
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
                          <TableHead>Diagnostic Guidance & Improvement Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rosterStudents.slice(0, 30).map(student => {
                          const m = marksState[student.id] || { internal: 30, external: 45 };
                          const total = m.internal + m.external;
                          const { gradeLetter, status } = calculateGrade(total);
                          const remark = getPerformanceRemark(total, m.internal, m.external);

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
                                    gradeLetter === "F"
                                      ? "bg-destructive/15 text-destructive"
                                      : gradeLetter === "O" || gradeLetter === "A+"
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
                              <TableCell className="text-xs max-w-xs">
                                <span className="font-semibold text-foreground block">{remark.remark}</span>
                                <span className="text-[11px] text-muted-foreground block truncate" title={remark.recommendation}>
                                  {remark.recommendation}
                                </span>
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
                        {allSupplementaryRegistrations.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {allSupplementaryRegistrations.filter(r => r.status === "Approved - Passed").length} Approved & Cleared
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Supplementary Re-Exam Faculty Evaluation & Approvals Queue */}
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="font-display text-lg flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" /> Supplementary Re-Exam Faculty Approvals
                      </CardTitle>
                      <CardDescription>
                        Review completed re-examinations, score test answer scripts, and officially approve Pass or Fail clearance.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-medium border-primary/30 text-primary w-fit">
                      {allSupplementaryRegistrations.filter(r => r.status === "Admit Card Issued" || r.status === "Under Evaluation").length} Pending Review
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>USN</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Arrear Subject</TableHead>
                          <TableHead className="text-center">Receipt #</TableHead>
                          <TableHead className="text-center">Fee Paid</TableHead>
                          <TableHead className="text-center">Exam Status</TableHead>
                          <TableHead className="text-center">Score & Verdict</TableHead>
                          <TableHead className="text-center">Faculty Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSupplementaryRegistrations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground">
                              No supplementary re-examination registrations found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          allSupplementaryRegistrations.map(reg => (
                            <TableRow key={reg.id}>
                              <TableCell className="font-mono text-xs font-semibold">{reg.usn || "1SI22CS005"}</TableCell>
                              <TableCell className="font-medium text-sm">{reg.studentName || "Arjun Reddy"}</TableCell>
                              <TableCell className="text-xs">
                                <span className="font-mono font-bold text-primary block">{reg.courseCode}</span>
                                <span className="text-muted-foreground">{reg.courseTitle}</span>
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                {reg.receiptNumber}
                              </TableCell>
                              <TableCell className="text-center font-mono text-xs font-semibold text-success">
                                ₹{reg.examFee}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    reg.status === "Approved - Passed"
                                      ? "bg-success/10 text-success border-success/30 font-semibold"
                                      : reg.status === "Approved - Failed"
                                      ? "bg-destructive/10 text-destructive border-destructive/30 font-semibold"
                                      : "bg-warning/10 text-warning border-warning/30 font-medium"
                                  }`}
                                >
                                  {reg.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-xs">
                                {reg.retestMarks ? (
                                  <div>
                                    <span className="font-mono font-bold text-foreground">
                                      {reg.retestMarks.total}/100 ({reg.retestMarks.gradeLetter})
                                    </span>
                                    <span className="text-[10px] text-muted-foreground block">
                                      By {reg.evaluatedBy}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground italic text-[11px]">Pending Evaluation</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  className={`h-8 text-xs gap-1.5 font-medium ${
                                    reg.status === "Approved - Passed"
                                      ? "border border-success/30 bg-success/10 text-success hover:bg-success/20"
                                      : "gradient-primary border-0"
                                  }`}
                                  onClick={() => handleOpenEvalModal(reg)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {reg.status === "Approved - Passed" || reg.status === "Approved - Failed"
                                    ? "Re-Evaluate / Edit"
                                    : "Evaluate & Approve"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

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

        {/* Faculty Evaluation & Pass/Fail Approval Modal */}
        <Dialog open={isEvalModalOpen} onOpenChange={setIsEvalModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" /> Evaluate Supplementary Re-Exam
              </DialogTitle>
              <DialogDescription>
                Score re-examination answers, verify practical viva, and officially approve Pass or Fail clearance.
              </DialogDescription>
            </DialogHeader>

            {evaluatingSupplementary && (
              <div className="space-y-4 py-2 text-sm">
                {/* Student Context Card */}
                <div className="p-3.5 rounded-lg bg-muted/50 border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Student Candidate:</span>
                    <span className="font-semibold text-foreground text-xs">
                      {evaluatingSupplementary.studentName || "Arjun Reddy"}{" "}
                      <span className="font-mono text-muted-foreground">({evaluatingSupplementary.usn || "1SI22CS005"})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Course Arrear:</span>
                    <span className="font-mono font-bold text-primary text-xs">
                      {evaluatingSupplementary.courseCode} - {evaluatingSupplementary.courseTitle}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">Registration Fee:</span>
                    <span className="text-xs font-semibold text-success font-mono">
                      ₹{evaluatingSupplementary.examFee} Paid (Receipt: {evaluatingSupplementary.receiptNumber})
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-1.5 mt-1">
                    <span className="text-muted-foreground text-xs">Original Score:</span>
                    <Badge variant="destructive" className="text-[10px]">
                      30/100 (Grade F - Fail)
                    </Badge>
                  </div>
                </div>

                {/* Score Input Fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                        Re-Exam Internal (Max 40)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={40}
                        value={evalInternal}
                        onChange={e => setEvalInternal(Math.max(0, Math.min(40, parseInt(e.target.value) || 0)))}
                        className="font-mono font-bold text-center h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                        Re-Exam External (Max 60)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        value={evalExternal}
                        onChange={e => setEvalExternal(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
                        className="font-mono font-bold text-center h-9"
                      />
                    </div>
                  </div>

                  {/* Live Evaluation Preview */}
                  <div className="p-3 rounded-lg border border-border/80 bg-background flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">Computed Re-Exam Score:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xl font-bold font-mono text-primary">
                          {evalInternal + evalExternal} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                        </span>
                        <Badge
                          className={`border-0 font-bold text-xs ${
                            calculateGrade(evalInternal + evalExternal).status === "Pass"
                              ? "bg-success/15 text-success"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          Grade {calculateGrade(evalInternal + evalExternal).gradeLetter}
                        </Badge>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold py-1 px-3 ${
                        calculateGrade(evalInternal + evalExternal).status === "Pass"
                          ? "border-success/30 bg-success/5 text-success"
                          : "border-destructive/30 bg-destructive/5 text-destructive"
                      }`}
                    >
                      {calculateGrade(evalInternal + evalExternal).status === "Pass" ? "ELIGIBLE TO PASS" : "BELOW PASS MARK"}
                    </Badge>
                  </div>

                  {/* Examiner Remarks */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
                      Examiner Evaluation Remarks & Sign-off
                    </label>
                    <Textarea
                      rows={2}
                      value={evalRemarks}
                      onChange={e => setEvalRemarks(e.target.value)}
                      placeholder="e.g. Completed viva, verified lab experiments, demonstrated satisfactory understanding."
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* Faculty Decision Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-1/2 border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 h-9 text-xs font-semibold"
                    onClick={() => handleConfirmApproval("Failed")}
                  >
                    <AlertTriangle className="h-4 w-4" /> Mark as FAILED
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-1/2 bg-success hover:bg-success/90 text-success-foreground gap-1.5 h-9 text-xs font-semibold border-0"
                    onClick={() => handleConfirmApproval("Passed")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve as PASSED
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
