import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents } from "@/data/seedData";
import { generateStudentAcademicRecord } from "@/data/examinationData";
import {
  PlacementDrive,
  StudentApplication,
  getPlacementDrives,
  savePlacementDrive,
  getStudentApplications,
  applyForPlacementDrive,
  updateApplicationStatus,
} from "@/data/placementData";
import { addNotification } from "@/services/notifications";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";
import {
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Award,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Download,
  Users
} from "lucide-react";

export default function Placements() {
  const { role, user, collegeId } = useAuth();
  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  // Current student identity
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === (user as any)?.uid) || allStudents[0];
  }, [allStudents, user]);

  const studentBranchId = useMemo(() => {
    return typeof currentStudent?.branch === "object" ? currentStudent.branch.id : "cs";
  }, [currentStudent]);

  // Student academic standing for placement eligibility
  const academicRecord = useMemo(() => {
    return generateStudentAcademicRecord(currentStudent?.id || "student-1", studentBranchId, currentStudent?.year || 3);
  }, [currentStudent, studentBranchId]);

  // Drives state
  const [drives, setDrives] = useState<PlacementDrive[]>(() => getPlacementDrives());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("drives");

  // Applications state
  const [applications, setApplications] = useState<StudentApplication[]>(() => getStudentApplications());

  // Modal for new drive (Admin / TPO)
  const [isAddDriveOpen, setIsAddDriveOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPackage, setNewPackage] = useState("12.0");
  const [newType, setNewType] = useState<"Full Time" | "Internship" | "Intern + PPO">("Full Time");
  const [newLocation, setNewLocation] = useState("Bengaluru, Karnataka");
  const [newMinCgpa, setNewMinCgpa] = useState("7.0");
  const [newMaxBacklogs, setNewMaxBacklogs] = useState("0");
  const [newDeadline, setNewDeadline] = useState("2026-12-31");
  const [newOpenings, setNewOpenings] = useState("15");
  const [newDesc, setNewDesc] = useState("");

  // Filtered drives
  const filteredDrives = useMemo(() => {
    return drives.filter(d => {
      const matchSearch =
        d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || d.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [drives, searchQuery, typeFilter]);

  const studentApplications = useMemo(() => {
    return applications.filter(a => a.studentId === currentStudent?.id);
  }, [applications, currentStudent]);

  const handleApply = (drive: PlacementDrive) => {
    if (!currentStudent) return;

    const res = applyForPlacementDrive(drive, {
      id: currentStudent.id,
      name: currentStudent.name,
      usn: currentStudent.usn,
      branchId: studentBranchId,
      cgpa: academicRecord.cgpa,
      activeBacklogs: academicRecord.activeBacklogsCount,
    });

    if (!res.success) {
      toast({
        variant: "destructive",
        title: "Application Not Submitted",
        description: res.message,
      });
      return;
    }

    setApplications(getStudentApplications());
    toast({
      title: "Application Successful! 🎉",
      description: res.message,
    });

    addNotification({
      title: "Placement Application Submitted",
      message: `Your application to ${drive.company} for ${drive.role} has been received.`,
      type: "success",
      targetRole: "student",
    });
  };

  const handleAddDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) {
      toast({ variant: "destructive", title: "Validation Error", description: "Company and Role are required." });
      return;
    }

    const created = savePlacementDrive({
      company: newCompany,
      role: newRole,
      packageLpa: parseFloat(newPackage) || 10,
      type: newType,
      location: newLocation,
      minCgpa: parseFloat(newMinCgpa) || 6.5,
      maxBacklogs: parseInt(newMaxBacklogs) || 0,
      allowedBranches: ["all"],
      deadline: newDeadline,
      driveDate: newDeadline,
      rounds: ["Online Assessment", "Technical Interview", "HR Interview"],
      status: "Active",
      description: newDesc || "Exciting engineering role in high-impact projects.",
      totalOpenings: parseInt(newOpenings) || 10,
    });

    setDrives(getPlacementDrives());
    setIsAddDriveOpen(false);

    toast({
      title: "Placement Drive Created",
      description: `${created.company} recruitment drive has been published for eligible students.`,
    });

    addNotification({
      title: "New Placement Drive Added",
      message: `${created.company} is hiring for ${created.role} (₹${created.packageLpa} LPA).`,
      type: "info",
      targetRole: "all",
    });

    // Reset form
    setNewCompany("");
    setNewRole("");
  };

  const handleStatusChange = (appId: string, newStatus: StudentApplication["status"]) => {
    updateApplicationStatus(appId, newStatus);
    setApplications(getStudentApplications());
    toast({
      title: "Candidate Status Updated",
      description: `Application marked as ${newStatus}.`,
    });
  };

  const handleExportApplications = () => {
    exportToCsv(
      `placement_applications_${new Date().toISOString().split("T")[0]}`,
      applications,
      [
        { header: "Company", accessor: a => a.company },
        { header: "Role", accessor: a => a.role },
        { header: "Package (LPA)", accessor: a => `₹${a.packageLpa} LPA` },
        { header: "Student USN", accessor: a => a.usn },
        { header: "Student Name", accessor: a => a.studentName },
        { header: "Branch", accessor: a => a.branch },
        { header: "CGPA", accessor: a => a.cgpa },
        { header: "Active Backlogs", accessor: a => a.activeBacklogs },
        { header: "Applied Date", accessor: a => a.appliedDate },
        { header: "Status", accessor: a => a.status },
      ]
    );
    toast({ title: "Report Exported", description: `Exported ${applications.length} applications to CSV.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" /> Campus Placements & Corporate Drives
            </h1>
            <p className="text-muted-foreground text-sm">
              Explore corporate recruitment drives, verify eligibility benchmarks, and track offer status
            </p>
          </div>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportApplications} className="gap-2">
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
                <Button size="sm" onClick={() => setIsAddDriveOpen(true)} className="gradient-primary border-0 gap-2 font-medium">
                  <Plus className="h-4 w-4" /> Add Drive
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Active Drives</p>
                <p className="text-2xl font-bold font-display mt-1">{drives.filter(d => d.status === "Active").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Companies hiring this term</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Highest Package</p>
                <p className="text-2xl font-bold font-display text-success mt-1">₹28.5 LPA</p>
                <p className="text-xs text-muted-foreground mt-1">Google Cloud (SDE)</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Award className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Average Package</p>
                <p className="text-2xl font-bold font-display text-primary mt-1">₹14.6 LPA</p>
                <p className="text-xs text-muted-foreground mt-1">Across top recruiting tiers</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Your Applications</p>
                <p className="text-2xl font-bold font-display mt-1">
                  {role === "student" ? studentApplications.length : applications.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role === "student" ? "Drives applied to" : "Total candidate submissions"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                <FileCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Eligibility Profile Banner */}
        {role === "student" && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" /> Placement Eligibility Profile: {currentStudent?.name} ({currentStudent?.usn})
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>Branch: <strong className="text-foreground uppercase">{studentBranchId}</strong></span>
                  <span>•</span>
                  <span>Cumulative CGPA: <strong className="text-primary font-bold">{academicRecord.cgpa} / 10.0</strong></span>
                  <span>•</span>
                  <span>
                    Backlogs:{" "}
                    <strong className={academicRecord.activeBacklogsCount === 0 ? "text-success" : "text-destructive"}>
                      {academicRecord.activeBacklogsCount === 0 ? "0 Active Arrears (Clear)" : `${academicRecord.activeBacklogsCount} Active`}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {academicRecord.activeBacklogsCount === 0 && academicRecord.cgpa >= 7.0 ? (
                  <Badge className="bg-success text-success-foreground border-0 py-1 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Eligible for Tier-1 Companies
                  </Badge>
                ) : academicRecord.activeBacklogsCount === 0 ? (
                  <Badge variant="outline" className="border-primary/40 text-primary py-1 px-3">
                    Eligible for Mass & Core Drives
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="py-1 px-3">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" /> Clear Backlogs to Unlock Tier-1
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs: Drives vs Applications */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <TabsList>
              <TabsTrigger value="drives" className="gap-2">
                <Building2 className="h-4 w-4" /> Placement Drives ({filteredDrives.length})
              </TabsTrigger>
              <TabsTrigger value="applications" className="gap-2">
                <FileCheck className="h-4 w-4" />
                {role === "student" ? `My Applications (${studentApplications.length})` : `All Candidates (${applications.length})`}
              </TabsTrigger>
            </TabsList>

            {activeTab === "drives" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search company or role..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Employment Types</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Internship">Internship</option>
                  <option value="Intern + PPO">Intern + PPO</option>
                </select>
              </div>
            )}
          </div>

          {/* Drives Tab */}
          <TabsContent value="drives" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrives.map(drive => {
                const isApplied = applications.some(a => a.driveId === drive.id && a.studentId === currentStudent?.id);
                const isCgpaEligible = academicRecord.cgpa >= drive.minCgpa;
                const isBacklogEligible = academicRecord.activeBacklogsCount <= drive.maxBacklogs;
                const isBranchEligible =
                  drive.allowedBranches.includes("all") || drive.allowedBranches.includes(studentBranchId.toLowerCase());
                const isFullyEligible = isCgpaEligible && isBacklogEligible && isBranchEligible;

                return (
                  <Card key={drive.id} className="border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="outline" className="text-[11px] font-mono text-muted-foreground mb-1">
                            {drive.type}
                          </Badge>
                          <CardTitle className="text-base font-bold text-foreground leading-tight">{drive.company}</CardTitle>
                          <p className="text-xs font-medium text-primary mt-0.5">{drive.role}</p>
                        </div>
                        <Badge className="bg-success/15 text-success border-0 font-bold font-mono text-sm py-1">
                          ₹{drive.packageLpa} LPA
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-2 line-clamp-2">
                        {drive.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0 text-xs">
                      <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</span>
                          <span className="text-foreground font-medium">{drive.location}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Min CGPA</span>
                          <span className={isCgpaEligible ? "text-success font-semibold" : "text-destructive font-semibold"}>
                            {drive.minCgpa} (Yours: {academicRecord.cgpa})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> Max Backlogs</span>
                          <span className={isBacklogEligible ? "text-success font-semibold" : "text-destructive font-semibold"}>
                            {drive.maxBacklogs === 0 ? "Strictly 0" : `Up to ${drive.maxBacklogs}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Deadline</span>
                          <span className="text-foreground font-mono">{drive.deadline}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                        {isApplied ? (
                          <Button size="sm" variant="outline" disabled className="w-full h-8 text-xs gap-1.5 text-success border-success/40 bg-success/5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Application Submitted
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className={`w-full h-8 text-xs font-medium ${isFullyEligible ? "gradient-primary border-0" : ""}`}
                            variant={isFullyEligible ? "default" : "outline"}
                            onClick={() => handleApply(drive)}
                          >
                            {isFullyEligible ? "Apply for Drive" : "Check Eligibility / Apply"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="font-display text-base">
                  {role === "student" ? "My Placement Application Tracker" : "Candidate Recruitment Review"}
                </CardTitle>
                <CardDescription>
                  Real-time interview pipeline, shortlist status, and offer management
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Package</TableHead>
                      {role !== "student" && <TableHead>Candidate</TableHead>}
                      {role !== "student" && <TableHead className="text-center">CGPA</TableHead>}
                      <TableHead className="text-center">Applied Date</TableHead>
                      <TableHead className="text-center">Current Status</TableHead>
                      {role === "admin" && <TableHead className="text-center">Update Pipeline</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(role === "student" ? studentApplications : applications).map(app => (
                      <TableRow key={app.id}>
                        <TableCell className="font-semibold text-sm">{app.company}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{app.role}</TableCell>
                        <TableCell className="text-center font-mono font-bold text-success text-xs">
                          ₹{app.packageLpa} LPA
                        </TableCell>
                        {role !== "student" && (
                          <TableCell>
                            <div>
                              <p className="font-medium text-xs">{app.studentName}</p>
                              <p className="font-mono text-[11px] text-muted-foreground">{app.usn} • {app.branch}</p>
                            </div>
                          </TableCell>
                        )}
                        {role !== "student" && (
                          <TableCell className="text-center font-mono font-bold text-xs">{app.cgpa}</TableCell>
                        )}
                        <TableCell className="text-center font-mono text-xs">{app.appliedDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`border-0 text-xs font-semibold ${
                              app.status === "Offer Selected"
                                ? "bg-success/20 text-success"
                                : app.status === "Shortlisted" || app.status === "Technical Round" || app.status === "HR Round"
                                ? "bg-primary/20 text-primary"
                                : app.status === "Not Shortlisted"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {app.status}
                          </Badge>
                        </TableCell>
                        {role === "admin" && (
                          <TableCell className="text-center">
                            <select
                              value={app.status}
                              onChange={e => handleStatusChange(app.id, e.target.value as any)}
                              className="h-7 text-xs rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Technical Round">Technical Round</option>
                              <option value="HR Round">HR Round</option>
                              <option value="Offer Selected">Offer Selected 🎉</option>
                              <option value="Not Shortlisted">Not Shortlisted</option>
                            </select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(role === "student" ? studentApplications : applications).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No placement applications submitted yet. Browse active corporate drives above!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Drive Modal (Admin) */}
        <Dialog open={isAddDriveOpen} onOpenChange={setIsAddDriveOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Post New Campus Placement Drive
              </DialogTitle>
              <DialogDescription>
                Publish a corporate hiring drive for eligible graduating students.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddDrive} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Company Name *</label>
                  <Input value={newCompany} onChange={e => setNewCompany(e.target.value)} placeholder="e.g. Oracle" required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Job Role / Designation *</label>
                  <Input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="e.g. SDE-1" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">CTC (LPA) *</label>
                  <Input type="number" step="0.1" value={newPackage} onChange={e => setNewPackage(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Intern + PPO">Intern + PPO</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Openings</label>
                  <Input type="number" value={newOpenings} onChange={e => setNewOpenings(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Min CGPA</label>
                  <Input type="number" step="0.1" value={newMinCgpa} onChange={e => setNewMinCgpa(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Max Backlogs</label>
                  <Input type="number" value={newMaxBacklogs} onChange={e => setNewMaxBacklogs(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Deadline</label>
                  <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Work Location</label>
                <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} />
              </div>

              <div>
                <label className="font-semibold block mb-1">Job Brief & Technology Stack</label>
                <Input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Required skills, languages, or tools" />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDriveOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary border-0">
                  Publish Drive
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
