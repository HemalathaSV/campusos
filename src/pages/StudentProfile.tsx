import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getAllStudents } from "@/data/seedData";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, 
  IndianRupee, CreditCard, CheckCircle2, AlertCircle, Clock, Send
} from "lucide-react";
import NotFound from "./NotFound";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collegeId } = useAuth();
  
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [warningReason, setWarningReason] = useState("");

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast({ title: "Error", description: "Please enter both subject and message.", variant: "destructive" });
      return;
    }
    toast({ title: "Email Sent", description: "The email has been successfully sent to the student." });
    setIsEmailOpen(false);
    setEmailSubject("");
    setEmailContent("");
  };

  const handleIssueWarning = () => {
    if (!warningReason.trim()) {
      toast({ title: "Error", description: "Please enter a reason for the warning.", variant: "destructive" });
      return;
    }
    toast({ title: "Warning Issued", description: "A formal warning has been issued to the student.", variant: "destructive" });
    setIsWarningOpen(false);
    setWarningReason("");
  };

  const allStudents = getAllStudents(collegeId);
  const student = allStudents.find(s => s.id === id);

  if (!student) {
    return <NotFound />;
  }

  const feeStatusColor = 
    student.feeStatus === "full" ? "bg-success text-success-foreground" :
    student.feeStatus === "half" ? "bg-warning text-warning-foreground" :
    "bg-destructive text-destructive-foreground";

  const initials = student.name.split(" ").map(n => n[0]).join("");

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold">Student Profile</h1>
            <p className="text-muted-foreground text-sm">Detailed overview for {student.usn}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <Card className="md:col-span-1 border-border/50 shadow-sm overflow-hidden">
            <div className="h-32 gradient-primary w-full"></div>
            <CardContent className="pt-0 relative px-6 pb-6">
              <div className="-mt-16 mb-4 flex justify-between items-end">
                <div className="h-32 w-32 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-display font-bold text-primary">{initials}</span>
                </div>
                <Badge className={feeStatusColor + " mb-2 shadow-sm"}>
                  {student.feeStatus.toUpperCase()} FEE
                </Badge>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-display font-bold">{student.name}</h2>
                <p className="text-muted-foreground font-mono">{student.usn}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <span>{student.branch.name} (Year {student.year})</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span>Admitted on {student.admissionDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Stats & Details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
                    <Clock className="h-6 w-6 text-info" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-1">Attendance</p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-display font-bold">{student.attendancePercentage}%</span>
                      <span className="text-xs text-muted-foreground mr-1">Target: 75%</span>
                    </div>
                    <Progress value={student.attendancePercentage} className={`h-2 ${student.attendancePercentage >= 75 ? "[&>div]:bg-info" : "[&>div]:bg-destructive"}`} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <IndianRupee className="h-6 w-6 text-success" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-1">Fees Paid</p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-display font-bold">₹{student.paidAmount.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground mr-1">/ ₹{student.totalFee.toLocaleString()}</span>
                    </div>
                    <Progress value={(student.paidAmount / student.totalFee) * 100} className="h-2 [&>div]:bg-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* In-depth Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Academic Overview</CardTitle>
                <CardDescription>Current semester standing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border/50">
                  <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/50 bg-muted/20">
                    <div className="text-sm font-medium text-muted-foreground">Semester</div>
                    <div className="text-sm font-medium text-muted-foreground text-center">CGPA</div>
                    <div className="text-sm font-medium text-muted-foreground text-right">Credits</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/50">
                    <div className="text-sm font-medium">Semester {student.year * 2 - 1}</div>
                    <div className="text-sm font-medium text-center">8.4</div>
                    <div className="text-sm font-medium text-right">24/24</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4">
                    <div className="text-sm font-medium">Semester {student.year * 2} (Current)</div>
                    <div className="text-sm font-medium text-center">-</div>
                    <div className="text-sm font-medium text-right">18/22</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" className="gap-2" onClick={() => navigate("/fees")}>
                  <CreditCard className="h-4 w-4" /> Manage Fees
                </Button>
                
                <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <AlertCircle className="h-4 w-4" /> Issue Warning
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Warning to {student.name}</DialogTitle>
                      <DialogDescription>
                        This action will send an official warning notice to the student's email and register it in their physical file.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Reason for Warning</Label>
                        <Textarea 
                          placeholder="E.g., Low attendance, Pending fees..." 
                          value={warningReason}
                          onChange={(e) => setWarningReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsWarningOpen(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleIssueWarning} disabled={!warningReason.trim()}>Issue Warning</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" /> Email Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Email to {student.name}</DialogTitle>
                      <DialogDescription>
                        Send a direct email to {student.email}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input 
                          placeholder="Email subject" 
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea 
                          placeholder="Type your message here..." 
                          className="min-h-[100px]"
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                      <Button onClick={handleSendEmail} className="gap-2" disabled={!emailSubject.trim() || !emailContent.trim()}><Send className="h-4 w-4"/> Send Message</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
