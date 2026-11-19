import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getAllStudents } from "@/data/seedData";
import { generateStudentAcademicRecord } from "@/data/examinationData";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Calendar,
  BookOpen,
  DollarSign,
  Search,
  ArrowRight,
  ShieldCheck,
  Send,
  Printer
} from "lucide-react";

export default function ParentPortal() {
  const allStudents = useMemo(() => getAllStudents(), []);

  // Selected student USN lookup state
  const [usnInput, setUsnInput] = useState("1MS21CS001");
  const [activeUsn, setActiveUsn] = useState("1MS21CS001");

  // Inquire form state
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");

  const targetStudent = useMemo(() => {
    return (
      allStudents.find(s => s.usn.toLowerCase() === activeUsn.toLowerCase()) ||
      allStudents[0]
    );
  }, [allStudents, activeUsn]);

  const studentBranchId = useMemo(() => {
    return typeof targetStudent?.branch === "object" ? targetStudent.branch.id : "cs";
  }, [targetStudent]);

  const studentBranchName = useMemo(() => {
    return typeof targetStudent?.branch === "object" ? targetStudent.branch.name : "Computer Science";
  }, [targetStudent]);

  // Academic record (CGPA, SGPA per semester, active backlogs)
  const academicRecord = useMemo(() => {
    return generateStudentAcademicRecord(targetStudent.id, studentBranchId, targetStudent.year || 2);
  }, [targetStudent, studentBranchId]);

  const isAttendanceShortage = targetStudent.attendancePercentage < 75;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usnInput.trim()) return;
    const found = allStudents.find(s => s.usn.toLowerCase() === usnInput.trim().toLowerCase());
    if (!found) {
      toast({
        variant: "destructive",
        title: "Student Not Found",
        description: `No active student found matching USN "${usnInput.trim().toUpperCase()}".`,
      });
      return;
    }
    setActiveUsn(found.usn);
    toast({
      title: "Student Verified",
      description: `Loaded academic portfolio for ${found.name} (${found.usn}).`,
    });
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim()) return;

    toast({
      title: "Message Routed to Department Proctor",
      description: `Your inquiry has been delivered to Dr. Ramesh Kumar. The department will contact ${parentPhone || "you"} shortly.`,
    });

    setInquiryMsg("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold font-display shadow-sm">
              C
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight">Campus OS</span>
              <span className="text-xs text-muted-foreground ml-2 font-medium">Guardian Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print Report
            </Button>
            <Link to="/login">
              <Button size="sm" className="gradient-primary border-0 text-xs">
                Staff / Student Login <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* USN Verification Bar */}
        <Card className="border-border/60 shadow-xs">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Student Academic Standing Verification
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter your ward's University Serial Number (USN) to inspect live grades, attendance, and arrears
              </p>
            </div>
            <form onSubmit={handleLookup} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Input
                  value={usnInput}
                  onChange={e => setUsnInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 1MS21CS001"
                  className="font-mono text-xs uppercase h-9"
                />
              </div>
              <Button type="submit" size="sm" className="gradient-primary border-0 text-xs gap-1.5">
                <Search className="h-3.5 w-3.5" /> Verify Ward
              </Button>
            </form>
          </CardContent>
          <div className="px-4 pb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
            <span>Quick Demo USNs:</span>
            {allStudents.slice(0, 4).map(s => (
              <button
                key={s.usn}
                type="button"
                onClick={() => {
                  setUsnInput(s.usn);
                  setActiveUsn(s.usn);
                }}
                className={`font-mono px-2 py-0.5 rounded border transition-colors ${
                  activeUsn === s.usn
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                {s.usn} ({s.name.split(" ")[0]})
              </button>
            ))}
          </div>
        </Card>

        {/* Ward Overview Header Banner */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-display font-bold text-2xl shadow-inner">
                  {targetStudent.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-foreground">{targetStudent.name}</h1>
                    <Badge variant="outline" className="font-mono text-xs border-primary/40 text-primary">
                      {targetStudent.usn}
                    </Badge>
                    <Badge className="bg-primary/20 text-primary border-0 text-xs">
                      Year {targetStudent.year} • Semester {targetStudent.year * 2}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Department of {studentBranchName} • Enrolled Section A • Roll No: {targetStudent.rollNo || "01"}
                  </p>
                </div>
              </div>

              {/* Proctor / Mentor Card */}
              <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex items-center gap-3 md:min-w-64">
                <div className="h-10 w-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Assigned Proctor</p>
                  <p className="font-semibold text-foreground">Dr. Ramesh Kumar</p>
                  <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Phone className="h-3 w-3" /> +91 98450 12345
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Attendance */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Attendance</span>
                <span className={`text-xs font-bold ${isAttendanceShortage ? "text-destructive" : "text-success"}`}>
                  {isAttendanceShortage ? "Shortage Alert" : "Eligible (>75%)"}
                </span>
              </div>
              <p className={`text-3xl font-display font-bold ${isAttendanceShortage ? "text-destructive" : "text-success"}`}>
                {targetStudent.attendancePercentage}%
              </p>
              <Progress value={targetStudent.attendancePercentage} className="h-2" />
              <p className="text-[11px] text-muted-foreground">Min 75% required for exam hall ticket</p>
            </CardContent>
          </Card>

          {/* Cumulative CGPA */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Cumulative CGPA</span>
                <Badge className="bg-success/15 text-success border-0 text-[10px]">Distinction</Badge>
              </div>
              <p className="text-3xl font-display font-bold text-primary">
                {academicRecord.cgpa} <span className="text-xs font-normal text-muted-foreground">/ 10.0</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {academicRecord.totalCreditsEarned} / {academicRecord.totalDegreeCredits} Total Credits
              </p>
            </CardContent>
          </Card>

          {/* Active Backlogs */}
          <Card className={`border-border/50 ${academicRecord.activeBacklogsCount > 0 ? "border-destructive/30 bg-destructive/5" : ""}`}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Backlog Arrears</span>
                {academicRecord.activeBacklogsCount === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className={`text-3xl font-display font-bold ${academicRecord.activeBacklogsCount === 0 ? "text-success" : "text-destructive"}`}>
                {academicRecord.activeBacklogsCount === 0 ? "0 Backlogs" : `${academicRecord.activeBacklogsCount} Arrears`}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {academicRecord.activeBacklogsCount === 0
                  ? "All enrolled courses cleared"
                  : "Supplementary re-test registration pending"}
              </p>
            </CardContent>
          </Card>

          {/* Fee Dues */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Fee Clearance</span>
                <Badge className="bg-success/15 text-success border-0 text-[10px]">No Dues</Badge>
              </div>
              <p className="text-3xl font-display font-bold text-success">
                ₹0 <span className="text-xs font-normal text-muted-foreground">Pending</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Semester 2026-27 fully settled</p>
            </CardContent>
          </Card>
        </div>

        {/* Backlog Alert if Any */}
        {academicRecord.activeBacklogsCount > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-destructive">
                  Academic Attention Notice: {academicRecord.activeBacklogsCount} Uncleared Course(s)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your ward has not cleared the following subject(s). Remedial coaching sessions are underway:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {academicRecord.backlogCourses.map(b => (
                    <Badge key={b.courseCode} variant="outline" className="border-destructive/40 text-destructive text-xs">
                      {b.courseCode}: {b.courseTitle} (Semester {b.semester})
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Semester-wise SGPA Progression */}
        <Card className="border-border/50">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="font-display text-base">Semester-wise Academic Progression</CardTitle>
            <CardDescription>
              Official university semester grade points and credit completion history
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-center">Enrolled Credits</TableHead>
                  <TableHead className="text-center">Earned Credits</TableHead>
                  <TableHead className="text-center">Semester SGPA</TableHead>
                  <TableHead className="text-center">Cumulative CGPA</TableHead>
                  <TableHead className="text-center">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicRecord.semesters.map(sem => (
                  <TableRow key={sem.semester}>
                    <TableCell className="font-semibold text-xs">Semester {sem.semester}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{sem.totalCredits}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{sem.earnedCredits}</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary text-xs">
                      {sem.sgpa} / 10.0
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{academicRecord.cgpa}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`border-0 text-xs ${
                          sem.status === "PASSED" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {sem.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Direct Counselor & Proctor Inquiry Form */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Contact Department Proctor & Counselor
            </CardTitle>
            <CardDescription>
              Submit an inquiry or request an academic progress meeting with your ward's faculty proctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Parent / Guardian Full Name</label>
                  <Input value={parentName} onChange={e => setParentName(e.target.value)} placeholder="e.g. Rajesh Sharma" />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Contact Phone Number</label>
                  <Input value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="e.g. +91 98765 43210" />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Inquiry / Meeting Request Notes</label>
                <Input
                  value={inquiryMsg}
                  onChange={e => setInquiryMsg(e.target.value)}
                  placeholder="e.g. Would like to discuss semester 4 elective selections and campus placement preparedness..."
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" className="gradient-primary border-0 text-xs gap-1.5 font-medium">
                  <Send className="h-3.5 w-3.5" /> Dispatch Inquiry to Proctor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground mt-12">
        Campus OS Academic Governance System • Official Guardian & Parent Portal • Encrypted Academic Standing Delivery
      </footer>
    </div>
  );
}
