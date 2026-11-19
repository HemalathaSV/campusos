import { useState, useMemo } from "react";
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
import { getAllStudents } from "@/data/seedData";
import {
  LeaveRequest,
  getLeaveRequests,
  submitLeaveRequest,
  updateLeaveStatus,
} from "@/data/leaveData";
import { addNotification } from "@/services/notifications";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";
import {
  CalendarOff,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  FileText,
  UserCheck,
  AlertCircle,
  Download,
  Filter,
  Search,
  ShieldCheck
} from "lucide-react";

export default function Leaves() {
  const { role, user, collegeId } = useAuth();
  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  // Current user student/faculty identity
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === (user as any)?.uid) || allStudents[0];
  }, [allStudents, user]);

  const applicantId = role === "student" ? currentStudent?.id || "student-1" : (user as any)?.uid || "faculty-1";
  const applicantName = role === "student" ? currentStudent?.name || "Student" : (user as any)?.name || "Faculty Member";
  const applicantIdentifier = role === "student" ? currentStudent?.usn || "1MS21CS001" : "FAC-CS-010";

  // Leave state
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>(() => getLeaveRequests());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Form inputs
  const [leaveType, setLeaveType] = useState<LeaveRequest["leaveType"]>("Casual");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetLeaveToReject, setTargetLeaveToReject] = useState<LeaveRequest | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");

  // Calculate day count
  const calculatedDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const myLeaves = useMemo(() => {
    return leaveList.filter(l => l.applicantId === applicantId || l.applicantIdentifier === applicantIdentifier);
  }, [leaveList, applicantId, applicantIdentifier]);

  const filteredLeaves = useMemo(() => {
    return leaveList.filter(l => {
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchRole = roleFilter === "all" || l.applicantRole === roleFilter;
      return matchStatus && matchRole;
    });
  }, [leaveList, statusFilter, roleFilter]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please explain the reason for your leave." });
      return;
    }

    const created = submitLeaveRequest({
      applicantId,
      applicantName,
      applicantRole: role === "student" ? "student" : "faculty",
      applicantIdentifier,
      department: typeof currentStudent?.branch === "object" ? currentStudent.branch.name : "Computer Science",
      leaveType,
      startDate,
      endDate,
      daysCount: calculatedDays,
      reason,
    });

    setLeaveList(getLeaveRequests());
    setIsApplyModalOpen(false);
    setReason("");

    toast({
      title: "Leave Application Submitted",
      description: `Your ${leaveType} leave application for ${calculatedDays} day(s) has been routed to the HOD.`,
    });

    addNotification({
      title: "Leave Application Received",
      message: `${applicantName} submitted a ${leaveType} leave request (${calculatedDays} days).`,
      type: "info",
      targetRole: "admin",
    });
  };

  const handleApprove = (leave: LeaveRequest) => {
    updateLeaveStatus(leave.id, "Approved", role === "admin" ? "Dean / Academic Office" : "HOD");
    setLeaveList(getLeaveRequests());

    toast({
      title: "Leave Approved",
      description: `Leave request for ${leave.applicantName} marked as Approved.`,
    });

    addNotification({
      title: "Leave Application Approved",
      message: `Your ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate} was approved.`,
      type: "success",
      targetRole: "all",
    });
  };

  const handleRejectConfirm = () => {
    if (!targetLeaveToReject) return;
    updateLeaveStatus(targetLeaveToReject.id, "Rejected", "HOD", rejectionRemarks || "Application not sanctioned");
    setLeaveList(getLeaveRequests());
    setRejectModalOpen(false);
    setTargetLeaveToReject(null);
    setRejectionRemarks("");

    toast({
      variant: "destructive",
      title: "Leave Rejected",
      description: `Leave application for ${targetLeaveToReject.applicantName} was rejected.`,
    });
  };

  const handleExportLeaves = () => {
    exportToCsv(
      `leave_records_${new Date().toISOString().split("T")[0]}`,
      leaveList,
      [
        { header: "Applicant Name", accessor: l => l.applicantName },
        { header: "Role", accessor: l => l.applicantRole },
        { header: "Identifier (USN / ID)", accessor: l => l.applicantIdentifier },
        { header: "Department", accessor: l => l.department },
        { header: "Leave Type", accessor: l => l.leaveType },
        { header: "Start Date", accessor: l => l.startDate },
        { header: "End Date", accessor: l => l.endDate },
        { header: "Days", accessor: l => l.daysCount },
        { header: "Reason", accessor: l => l.reason },
        { header: "Status", accessor: l => l.status },
        { header: "Approver", accessor: l => l.approvedBy || "Pending" },
      ]
    );
    toast({ title: "Export Successful", description: `Exported ${leaveList.length} leave records.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <CalendarOff className="h-6 w-6 text-primary" /> Leave & Absence Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Submit digital leave requests, track On-Duty approvals, and monitor departmental attendance quotas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportLeaves} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsApplyModalOpen(true)} className="gradient-primary border-0 gap-2 font-medium">
              <Plus className="h-4 w-4" /> Apply for Leave
            </Button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Casual Leave Balance</p>
                <p className="text-2xl font-bold font-display mt-1">12 <span className="text-sm font-normal text-muted-foreground">Days</span></p>
                <p className="text-xs text-muted-foreground mt-1">Academic Year 2026-27</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Medical Leave Balance</p>
                <p className="text-2xl font-bold font-display text-info mt-1">8 <span className="text-sm font-normal text-muted-foreground">Days</span></p>
                <p className="text-xs text-muted-foreground mt-1">Doctor certificate required</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">On-Duty / OD Leaves</p>
                <p className="text-2xl font-bold font-display text-success mt-1">Unlimited</p>
                <p className="text-xs text-muted-foreground mt-1">For hackathons & conferences</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <UserCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold font-display text-warning mt-1">
                  {leaveList.filter(l => l.status === "Pending").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Requires review</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student View: My Leave Applications */}
        {role === "student" && (
          <Card className="border-border/50">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> My Submitted Leave Requests
              </CardTitle>
              <CardDescription>
                Track your personal leave requests and approval remarks from your proctor and HOD
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-center">Applied On</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Remarks / Approver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeaves.map(leave => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-semibold text-xs">
                        <Badge variant="outline" className="font-medium text-xs">
                          {leave.leaveType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {leave.startDate} to {leave.endDate}
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">{leave.daysCount}d</TableCell>
                      <TableCell className="text-xs max-w-xs truncate text-muted-foreground">{leave.reason}</TableCell>
                      <TableCell className="text-center text-xs font-mono">{leave.appliedDate}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`border-0 text-xs ${
                            leave.status === "Approved"
                              ? "bg-success/20 text-success font-semibold"
                              : leave.status === "Pending"
                              ? "bg-warning/20 text-warning font-semibold"
                              : "bg-destructive/20 text-destructive font-semibold"
                          }`}
                        >
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {leave.remarks ? `${leave.remarks} (${leave.approvedBy})` : "Pending HOD Sign-off"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {myLeaves.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No leave requests submitted yet. Click "Apply for Leave" above.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin & Faculty Approver View */}
        {role !== "student" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold font-display">Department Leave Approval Inbox</h2>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="all">Students & Faculty</option>
                  <option value="student">Students Only</option>
                  <option value="faculty">Faculty Only</option>
                </select>
              </div>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaves.map(leave => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-xs">{leave.applicantName}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{leave.applicantIdentifier}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize text-[11px]">
                            {leave.applicantRole}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{leave.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {leave.leaveType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono whitespace-nowrap">
                          {leave.startDate} to {leave.endDate}
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">{leave.daysCount}d</TableCell>
                        <TableCell className="text-xs max-w-xs text-muted-foreground">
                          {leave.reason}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`border-0 text-xs ${
                              leave.status === "Approved"
                                ? "bg-success/20 text-success"
                                : leave.status === "Pending"
                                ? "bg-warning/20 text-warning"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {leave.status === "Pending" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-success border-success/40 hover:bg-success/10"
                                onClick={() => handleApprove(leave)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
                                onClick={() => {
                                  setTargetLeaveToReject(leave);
                                  setRejectModalOpen(true);
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">
                              {leave.approvedBy || "Processed"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Apply Leave Modal */}
        <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarOff className="h-5 w-5 text-primary" /> Submit Leave Application
              </DialogTitle>
              <DialogDescription>
                Provide leave dates and details for official attendance dispensation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplyLeave} className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-semibold block mb-1">Leave Classification *</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave (Doctor Slip Required)</option>
                  <option value="On-Duty (OD)">On-Duty / OD (Hackathons / Technical Competitions)</option>
                  <option value="Academic / Conference">Academic / Conference Presentation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Start Date *</label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Date *</label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs flex items-center justify-between">
                <span className="text-muted-foreground">Computed Leave Span:</span>
                <span className="font-bold text-primary">{calculatedDays} Calendar Day(s)</span>
              </div>

              <div>
                <label className="font-semibold block mb-1">Reason for Absence *</label>
                <Textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Clearly explain the reason for leave..."
                  rows={3}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary border-0">
                  Submit to HOD
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reject Leave Modal */}
        <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" /> Reject Leave Application
              </DialogTitle>
              <DialogDescription>
                Provide a reason for turning down this leave request.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <p className="text-muted-foreground">
                Applicant: <strong>{targetLeaveToReject?.applicantName}</strong> ({targetLeaveToReject?.leaveType} - {targetLeaveToReject?.daysCount} days)
              </p>
              <div>
                <label className="font-semibold block mb-1">Rejection Reason / Guidance</label>
                <Input
                  value={rejectionRemarks}
                  onChange={e => setRejectionRemarks(e.target.value)}
                  placeholder="e.g. Midterm examination scheduled on selected dates"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectConfirm}>
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
