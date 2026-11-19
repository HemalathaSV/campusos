import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { subscribeToApplications, updateApplicationStatus, ApplicationData } from "@/services/admissions";
import { useAuth } from "@/contexts/AuthContext";
import { addNotification } from "@/services/notifications";

export default function Admissions() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationData[]>([]);

  useEffect(() => {
    // Real-time subscription to Firebase (or local fallback)
    const unsubscribe = subscribeToApplications((apps) => {
      // Sort by newest first based on rough ID or Date if we had proper timestamps
      setApplications(apps);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: "Pay" | "No Payment", name: string) => {
    // Write instantly to local mock database (or Firebase)
    await updateApplicationStatus(id, status);
    
    // Optimistic UI Update for instant feedback and consistency
    setApplications(prev => prev.map(app => 
      app.id === id 
        ? { ...app, status } 
        : app
    ));

    const descriptionNode = status === "Pay" 
      ? (
          <div className="flex flex-col gap-1 mt-1 text-sm">
            <p>Approval confirmation has been sent.</p>
            <p>You can proceed with the payment process.</p>
          </div>
        )
      : (
          <div className="flex flex-col gap-1 mt-1 text-sm">
            <p>Rejection confirmation has been sent to the applicant.</p>
          </div>
        );

    toast({ 
      title: status === "Pay" ? "Application approved successfully." : "Application rejected.", 
      description: descriptionNode,
      className: status === "Pay" 
        ? "border-green-600 bg-green-50 text-green-900 shadow-lg animate-in slide-in-from-bottom border-2 font-medium" 
        : "border-red-600 bg-red-50 text-red-900 shadow-lg animate-in slide-in-from-bottom border-2 font-medium",
    });

    addNotification({
      title: status === "Pay" ? "Admission Approved" : "Admission Rejected",
      message: status === "Pay"
        ? `Application for ${name} was approved for admission.`
        : `Application for ${name} was rejected.`,
      type: status === "Pay" ? "success" : "warning",
      targetRole: "admin",
    });
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    pay: applications.filter(a => a.status === "Pay").length,
    nopayment: applications.filter(a => a.status === "No Payment").length,
  };

  const statusBadge = (status: string) => {
    if (status === "Pay") return <Badge className="bg-success/10 text-success border-0">Pay</Badge>;
    if (status === "No Payment") return <Badge className="bg-destructive/10 text-destructive border-0">No Payment</Badge>;
    return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Admissions Approval</h1>
            <p className="text-muted-foreground text-sm">Review, approve, or reject student admission applications</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold font-display">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Applications</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold font-display text-warning">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold font-display text-success">{stats.pay}</p>
              <p className="text-sm text-muted-foreground">Pay</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold font-display text-destructive">{stats.nopayment}</p>
              <p className="text-sm text-muted-foreground">No Payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Applications {applications.length > 0 ? `(${applications.length})` : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{app.email}</TableCell>
                    <TableCell>{app.branch}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{app.date}</TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell>
                      {app.status === "Pay" || app.status === "No Payment" ? (
                        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Processed</span>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs border-success/30 hover:bg-success hover:text-success-foreground transition-colors" 
                            onClick={() => handleStatusUpdate(app.id, "Pay", app.name)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors border border-transparent hover:border-destructive" 
                            onClick={() => handleStatusUpdate(app.id, "No Payment", app.name)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
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
