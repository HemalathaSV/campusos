import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAllStudents } from "@/data/seedData";
import { useAuth } from "@/contexts/AuthContext";
import { generateStudentAcademicRecord, getSupplementaryRegistrations } from "@/data/examinationData";
import { getHostelRooms } from "@/data/hostelData";
import { getBorrowedRecords } from "@/data/libraryData";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, 
  IndianRupee, CreditCard, CheckCircle2, AlertCircle, Clock, Send,
  Award, AlertTriangle, Building, Bed, Bookmark, ShieldCheck, User
} from "lucide-react";
import NotFound from "./NotFound";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, collegeId } = useAuth();
  
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [warningReason, setWarningReason] = useState("");

  const allStudents = getAllStudents(collegeId);
  const student = allStudents.find(s => s.id === id);

  if (!student) {
    return <NotFound />;
  }

  const branchId = typeof student.branch === "object" ? student.branch.id : "cs";
  const branchName = typeof student.branch === "object" ? student.branch.name : "Computer Science";

  // Academic record (SGPA trajectory, course marks, backlogs)
  const academicRecord = useMemo(() => {
    return generateStudentAcademicRecord(student.id, branchId, student.year || 2);
  }, [student.id, branchId, student.year]);

  const [selectedSemesterTab, setSelectedSemesterTab] = useState<number>(academicRecord.semesters.length || 1);

  // Active semester marksheet
  const currentSemMarksheet = useMemo(() => {
    return (
      academicRecord.semesters.find(s => s.semester === selectedSemesterTab) ||
      academicRecord.semesters[academicRecord.semesters.length - 1]
    );
  }, [academicRecord, selectedSemesterTab]);

  // Supplementary registrations
  const supplementaryRegs = useMemo(() => {
    return getSupplementaryRegistrations(student.id);
  }, [student.id]);

  // Hostel residence info
  const residentRoom = useMemo(() => {
    const allRooms = getHostelRooms();
    return allRooms.find(r => r.occupants.some(o => o.studentId === student.id));
  }, [student.id]);

  // Library active borrowings
  const borrowedBooks = useMemo(() => {
    return getBorrowedRecords(student.id);
  }, [student.id]);

  const activeBorrowedBooks = useMemo(() => {
    return borrowedBooks.filter(b => b.status !== "Returned");
  }, [borrowedBooks]);

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({ title: "Error", description: "Please enter both subject and message.", variant: "destructive" });
      return;
    }
    toast({ title: "Email Sent", description: `The email has been sent to ${student.email}.` });
    setIsEmailOpen(false);
    setEmailSubject("");
    setEmailContent("");
  };

  const handleIssueWarning = () => {
    if (!warningReason.trim()) {
      toast({ title: "Error", description: "Please enter a reason for the warning.", variant: "destructive" });
      return;
    }
    toast({ title: "Warning Issued", description: `A formal warning has been logged for ${student.name}.`, variant: "destructive" });
    setIsWarningOpen(false);
    setWarningReason("");
  };

  const feeStatusColor = 
    student.feeStatus === "full" ? "bg-success text-success-foreground" :
    student.feeStatus === "half" ? "bg-warning text-warning-foreground" :
    "bg-destructive text-destructive-foreground";

  const initials = student.name.split(" ").map(n => n[0]).join("");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                Student 360° Profile & Academic File
              </h1>
              <p className="text-muted-foreground text-sm">
                Comprehensive academic transcripts, marks, backlogs, hostel residency, and circulation records for {student.usn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              Role: {role?.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Personal Info & Standing */}
          <div className="space-y-6 md:col-span-1">
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <div className="h-28 gradient-primary w-full"></div>
              <CardContent className="pt-0 relative px-6 pb-6">
                <div className="-mt-14 mb-4 flex justify-between items-end">
                  <div className="h-24 w-24 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-display font-bold text-primary">{initials}</span>
                  </div>
                  <Badge className={feeStatusColor + " mb-2 shadow-sm"}>
                    {student.feeStatus.toUpperCase()} FEE
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <h2 className="text-xl font-display font-bold">{student.name}</h2>
                  <p className="text-muted-foreground font-mono text-xs font-semibold">{student.usn}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-primary shrink-0" />
                    <span>{branchName} (Year {student.year})</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>Admitted on {student.admissionDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Standing & Backlog Summary Card */}
            <Card className={`border-border/50 shadow-sm ${academicRecord.activeBacklogsCount > 0 ? "border-destructive/40 bg-destructive/5" : ""}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Academic Standing</span>
                  {academicRecord.activeBacklogsCount === 0 ? (
                    <Badge className="bg-success/15 text-success border-0 text-xs">Clear (0 Arrears)</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      {academicRecord.activeBacklogsCount} Backlog(s)
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Cumulative CGPA:</span>
                  <span className="font-bold font-mono text-primary text-base">{academicRecord.cgpa} / 10.0</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Total Credits Earned:</span>
                  <span className="font-semibold">{academicRecord.totalCreditsEarned} / {academicRecord.totalDegreeCredits}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Attendance Percentage:</span>
                  <span className={`font-bold ${student.attendancePercentage >= 75 ? "text-success" : "text-destructive"}`}>
                    {student.attendancePercentage}% ({student.attendancePercentage >= 75 ? "Eligible" : "Shortage"})
                  </span>
                </div>

                {academicRecord.activeBacklogsCount > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-destructive block mb-1">
                      Uncleared Course Codes:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {academicRecord.backlogCourses.map(b => (
                        <Badge key={b.courseCode} variant="outline" className="text-[10px] font-mono border-destructive/40 text-destructive">
                          {b.courseCode} (Sem {b.semester})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions (Faculty / Admin) */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Faculty Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2">
                      <Mail className="h-3.5 w-3.5" /> Email Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Message to {student.name}</DialogTitle>
                      <DialogDescription>Deliver departmental guidance to {student.email}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 text-xs">
                      <div>
                        <Label>Subject</Label>
                        <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} placeholder="e.g. Remedial schedule" />
                      </div>
                      <div>
                        <Label>Message</Label>
                        <Textarea value={emailContent} onChange={e => setEmailContent(e.target.value)} placeholder="Type guidance notes..." rows={4} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendEmail} className="gradient-primary border-0">Send</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs gap-2 text-destructive hover:bg-destructive/10">
                      <AlertCircle className="h-3.5 w-3.5" /> Issue Warning / Remedial Notice
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Academic Warning to {student.name}</DialogTitle>
                      <DialogDescription>Logged into institutional student dossier</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 text-xs">
                      <div>
                        <Label>Reason for Notice</Label>
                        <Textarea value={warningReason} onChange={e => setWarningReason(e.target.value)} placeholder="e.g. Attendance shortfall or pending backlog clearance" rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsWarningOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleIssueWarning}>Issue Warning</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Deep Tabs: Marks, Backlogs, Campus Life, Fees */}
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="transcripts" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="transcripts" className="text-xs">
                  <Award className="h-3.5 w-3.5 mr-1.5" /> Marks & SGPA
                </TabsTrigger>
                <TabsTrigger value="backlogs" className="text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Backlogs ({academicRecord.activeBacklogsCount})
                </TabsTrigger>
                <TabsTrigger value="campuslife" className="text-xs">
                  <Building className="h-3.5 w-3.5 mr-1.5" /> Hostel & Library
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Marks & SGPA */}
              <TabsContent value="transcripts" className="space-y-4 mt-4">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="font-display text-base">Semester Examination Marksheet</CardTitle>
                        <CardDescription className="text-xs">
                          Course-wise internal, external, letter grades, and diagnostic improvement suggestions
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                        {academicRecord.semesters.map(sem => (
                          <Button
                            key={sem.semester}
                            size="sm"
                            variant={selectedSemesterTab === sem.semester ? "default" : "ghost"}
                            className={`h-7 px-2.5 text-xs ${selectedSemesterTab === sem.semester ? "gradient-primary border-0" : ""}`}
                            onClick={() => setSelectedSemesterTab(sem.semester)}
                          >
                            Sem {sem.semester}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead className="text-center">Credits</TableHead>
                          <TableHead className="text-center">Internal (40)</TableHead>
                          <TableHead className="text-center">Exam (60)</TableHead>
                          <TableHead className="text-center">Total (100)</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead>Diagnostic Remarks & Guidance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentSemMarksheet.courses.map(course => (
                          <TableRow key={course.courseCode}>
                            <TableCell className="text-xs">
                              <span className="font-mono font-bold text-primary block">{course.courseCode}</span>
                              <span className="font-medium">{course.courseTitle}</span>
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs">{course.credits}</TableCell>
                            <TableCell className="text-center font-mono text-xs">{course.internalMarks}</TableCell>
                            <TableCell className="text-center font-mono text-xs">{course.externalMarks}</TableCell>
                            <TableCell className="text-center font-mono font-bold text-xs">{course.totalMarks}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`border-0 text-xs font-bold ${
                                  course.gradeLetter === "O" || course.gradeLetter === "A+"
                                    ? "bg-success/15 text-success"
                                    : course.gradeLetter === "A" || course.gradeLetter === "B+"
                                    ? "bg-primary/15 text-primary"
                                    : course.gradeLetter === "F"
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-warning/15 text-warning"
                                }`}
                              >
                                {course.gradeLetter}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[11px] ${
                                  course.status === "Pass"
                                    ? "text-success border-success/30 bg-success/5"
                                    : "text-destructive border-destructive/30 bg-destructive/5 font-semibold"
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
                    <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs">
                      <span>Total Semester Credits: <strong>{currentSemMarksheet.totalCredits}</strong> (Earned: {currentSemMarksheet.earnedCredits})</span>
                      <span className="font-bold text-primary text-sm">Semester SGPA: {currentSemMarksheet.sgpa} / 10.0</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Backlogs & Supplementary Registrations */}
              <TabsContent value="backlogs" className="space-y-4 mt-4">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="font-display text-base">Arrears & Supplementary Clearance Record</CardTitle>
                    <CardDescription className="text-xs">
                      Comprehensive log of failed courses and student re-examination registrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {academicRecord.activeBacklogsCount === 0 ? (
                      <div className="p-8 text-center text-muted-foreground space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
                        <h4 className="font-semibold text-foreground text-sm">No Active Backlogs</h4>
                        <p className="text-xs">All enrolled courses cleared in regular semester sessions.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider">
                          Active Uncleared Courses ({academicRecord.activeBacklogsCount})
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {academicRecord.backlogCourses.map(b => (
                            <div key={b.courseCode} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-mono font-bold text-destructive">{b.courseCode}</span>
                                <h5 className="font-medium text-foreground">{b.courseTitle}</h5>
                                <p className="text-muted-foreground text-[11px]">
                                  Failed in Semester {b.semester} • Internal: {b.internalMarks}/40 • External: {b.externalMarks}/60 (Total: {b.totalMarks}/100)
                                </p>
                              </div>
                              <Badge variant="destructive" className="font-bold">
                                Grade F
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {supplementaryRegs.length > 0 && (
                      <div className="pt-3 border-t border-border/50 space-y-2">
                        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          Supplementary Re-Exam Registrations & Receipts
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Receipt #</TableHead>
                              <TableHead className="text-center">Fee Paid</TableHead>
                              <TableHead className="text-center">Date</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {supplementaryRegs.map(reg => (
                              <TableRow key={reg.id}>
                                <TableCell className="text-xs font-medium">
                                  {reg.courseCode}: {reg.courseTitle}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-primary">{reg.receiptNumber || "REC-SUPPL-2026"}</TableCell>
                                <TableCell className="text-center font-mono text-xs font-bold text-success">₹{reg.examFee}</TableCell>
                                <TableCell className="text-center font-mono text-xs">{reg.registrationDate}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <Badge
                                      className={`border-0 text-[11px] ${
                                        reg.status === "Approved - Passed"
                                          ? "bg-success/15 text-success font-semibold"
                                          : reg.status === "Approved - Failed"
                                          ? "bg-destructive/15 text-destructive font-semibold"
                                          : "bg-info/15 text-info font-medium"
                                      }`}
                                    >
                                      {reg.status}
                                    </Badge>
                                    {reg.retestMarks && (
                                      <span className="text-[10px] text-muted-foreground font-mono">
                                        Score: {reg.retestMarks.total}/100 ({reg.retestMarks.gradeLetter})
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Campus Life (Hostel & Library) */}
              <TabsContent value="campuslife" className="space-y-4 mt-4">
                {/* Hostel Resident Status */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" /> Hostel Residency
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Campus hostel room allocation, block details, and roommates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 text-xs">
                    {residentRoom ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Room Number</span>
                            <span className="font-mono font-bold text-foreground text-sm">{residentRoom.roomNumber}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Block</span>
                            <span className="font-medium text-foreground">{residentRoom.block}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Floor</span>
                            <span className="font-medium text-foreground">Floor {residentRoom.floor}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Monthly Rent</span>
                            <span className="font-mono font-bold text-success">₹{residentRoom.monthlyRent}</span>
                          </div>
                        </div>

                        <div>
                          <span className="font-semibold text-muted-foreground block mb-1">Roommates in {residentRoom.roomNumber}:</span>
                          <div className="flex flex-wrap gap-2">
                            {residentRoom.occupants.map(o => (
                              <Badge key={o.studentId} variant="outline" className="text-xs py-1 px-2.5 gap-1.5">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {o.name} ({o.usn})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Student is a Day Scholar (Not currently allocated to campus hostel).
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Library Borrowed Books */}
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-primary" /> Active Library Book Borrowings
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Textbooks issued to student with exact borrow dates, due dates, and countdowns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Book Title</TableHead>
                          <TableHead>ISBN</TableHead>
                          <TableHead className="text-center">Issued On</TableHead>
                          <TableHead className="text-center">Return Due Date</TableHead>
                          <TableHead className="text-center">Status / Fine</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {borrowedBooks.map(b => (
                          <TableRow key={b.id}>
                            <TableCell className="font-medium text-xs">{b.bookTitle}</TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground">{b.isbn}</TableCell>
                            <TableCell className="text-center font-mono text-xs">{b.borrowDate}</TableCell>
                            <TableCell className="text-center font-mono text-xs font-semibold">{b.dueDate}</TableCell>
                            <TableCell className="text-center">
                              {b.status === "Overdue" ? (
                                <Badge variant="destructive" className="text-[11px]">
                                  Overdue (Fine: ₹{b.fineAmount})
                                </Badge>
                              ) : b.status === "Returned" ? (
                                <Badge variant="secondary" className="text-[11px]">Returned</Badge>
                              ) : (
                                <Badge className="bg-success/20 text-success border-0 text-[11px]">
                                  Active (In Possession)
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {borrowedBooks.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground text-xs">
                        No active or past book borrowings registered in digital library.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
