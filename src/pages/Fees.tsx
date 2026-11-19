import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select as CustomSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { students as initialStudents, branches } from "@/data/seedData";
import { IndianRupee, TrendingUp, CreditCard, FileText, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { listenForPaymentSMS } from "@/utils/smsListener";
import { useAuth } from "@/contexts/AuthContext";
import { getAllStudents } from "@/data/seedData";
import { addNotification } from "@/services/notifications";

export default function Fees() {
  const { collegeId, role, user } = useAuth();
  const [studentsData, setStudentsData] = useState(() => getAllStudents(collegeId));

  // Save updates (like payments) directly back to the master unified dataset to sync globally
  useEffect(() => {
    const globalDB = JSON.parse(localStorage.getItem("mock_generated_students") || "[]");
    let needsUpdate = false;
    
    // Efficiently merge memory updates tightly back to global disk array 
    const updatedGlobal = globalDB.map((gStudent: any) => {
      const local = studentsData.find(s => s.id === gStudent.id);
      if (local && (local.paidAmount !== gStudent.paidAmount || local.feeStatus !== gStudent.feeStatus)) {
        needsUpdate = true;
        return { ...gStudent, ...local };
      }
      return gStudent;
    });
    
    if (needsUpdate) {
      localStorage.setItem("mock_generated_students", JSON.stringify(updatedGlobal));
    }
  }, [studentsData]);
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [payingStudent, setPayingStudent] = useState<string | null>(null);
  const [receiptStudent, setReceiptStudent] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return studentsData.filter(s => {
      if (role === "student") {
        return s.id === (user as any)?.uid;
      }
      const matchBranch = branchFilter === "all" || s.branch.id === branchFilter;
      const matchStatus = statusFilter === "all" || s.feeStatus === statusFilter;
      const matchYear = yearFilter === "all" || String(s.year) === yearFilter;
      return matchBranch && matchStatus && matchYear;
    });
  }, [branchFilter, statusFilter, yearFilter, studentsData, role, user]);

  const totalCollected = studentsData.reduce((s, st) => s + st.paidAmount, 0);
  const totalPending = studentsData.reduce((s, st) => s + (st.totalFee - st.paidAmount), 0);
  const fullPaid = studentsData.filter(s => s.feeStatus === "full").length;
  const halfPaid = studentsData.filter(s => s.feeStatus === "half").length;
  const pending = studentsData.filter(s => s.feeStatus === "pending").length;

  const handlePayment = (studentId: string) => {
    // Deprecated for SMS workflow directly inside render
  };

  const feeStatusBadge = (status: string) => {
    if (status === "full") return <Badge className="bg-success/10 text-success border-0">Full ✅</Badge>;
    if (status === "half") return <Badge className="bg-warning/10 text-warning border-0">Half 🟡</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-0">Pending 🔴</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold">Fee Management</h1>



        {/* Filters */}
        {role !== "student" && (
          <div className="flex gap-3">
          <select 
            value={branchFilter} 
            onChange={e => setBranchFilter(e.target.value)}
            className="flex h-10 w-44 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select 
            value={yearFilter} 
            onChange={e => setYearFilter(e.target.value)}
            className="flex h-10 w-36 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All Years</option>
            {[1, 2, 3, 4].map(y => <option key={y} value={String(y)}>Year {y}</option>)}
          </select>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="flex h-10 w-36 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="all">All Status</option>
            <option value="full">Full</option>
            <option value="half">Half</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        )}

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Paid</TableHead>
                  <TableHead className="hidden sm:table-cell">Pending</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 30).map(s => (
                  <TableRow key={s.id} className={s.id === payingStudent ? "bg-muted/50" : ""}>
                    <TableCell className="font-mono text-sm">{s.usn}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{s.branch.name}</TableCell>
                    <TableCell>{feeStatusBadge(s.feeStatus)}</TableCell>
                    <TableCell className="hidden sm:table-cell">₹{s.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">₹{(s.totalFee - s.paidAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.feeStatus !== "full" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPayingStudent(s.id)}>
                            <CreditCard className="h-3 w-3 mr-1" /> Pay
                          </Button>
                        )}
                        {s.feeStatus !== "pending" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setReceiptStudent(s.id)}>
                            <FileText className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={!!payingStudent} onOpenChange={() => setPayingStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Scan QR to Pay Fees</DialogTitle>
          </DialogHeader>
          <div className="text-center py-2 space-y-4">
            <div className="mx-auto border-[6px] border-muted/30 rounded-2xl bg-white shadow-xl overflow-hidden relative" style={{ width: "260px", height: "260px" }}>
              <img 
                src="/qr-code.png" 
                alt="UPI Payment QR Code" 
                className="absolute inset-0 w-full h-full object-contain p-2"
              />
            </div>
            <div>
              <p className="text-sm font-medium">Scan using any UPI App (GPay, PhonePe, Paytm)</p>
              <p className="text-3xl mt-2 font-bold font-display text-primary">₹{((studentsData.find(s => s.id === payingStudent)?.totalFee ?? 0) - (studentsData.find(s => s.id === payingStudent)?.paidAmount ?? 0)).toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter className="flex items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setPayingStudent(null)}>Cancel</Button>
            <Button className="gradient-primary border-0 font-medium" onClick={() => {
              const selectedUser = studentsData.find(s => s.id === payingStudent);
              if (!selectedUser) return;
              
              const currentId = selectedUser.id;
              const studentName = selectedUser.name;
              const due = selectedUser.totalFee - selectedUser.paidAmount;
              
              setPayingStudent(null);
              toast({ 
                title: "Awaiting Confirmation...", 
                description: <div className="flex items-center"><Smartphone className="h-4 w-4 mr-2 animate-pulse" /> Listening for Bank SMS...</div>,
                duration: 5000 
              });
              
              listenForPaymentSMS(due, () => {
                // Update local status first so UI immediately catches it
                setStudentsData(prev => prev.map(s => 
                  s.id === currentId 
                    ? { ...s, paidAmount: s.totalFee, feeStatus: "full", payment: "paid" } 
                    : s
                ));
                
                // Then trigger popup
                toast({ 
                  title: `Payment successful for ${studentName}`, 
                  className: "border-green-600 bg-green-50 text-green-900 shadow-lg animate-in slide-in-from-bottom border-2 font-medium" 
                });

                // Post global notification
                addNotification({
                  title: "Fee Payment Received",
                  message: `Tuition payment of ₹${due.toLocaleString()} received for ${studentName}.`,
                  type: "success",
                  targetRole: "all",
                });
              });
            }}>Payment Completed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={!!receiptStudent} onOpenChange={() => setReceiptStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Fee Receipt</DialogTitle>
          </DialogHeader>
          {receiptStudent && (() => {
            const s = studentsData.find(st => st.id === receiptStudent);
            if (!s) return null;
            return (
              <div className="space-y-4 border rounded-lg p-6">
                <div className="text-center border-b pb-4">
                  <h3 className="font-display font-bold text-lg">Campus OS College</h3>
                  <p className="text-xs text-muted-foreground">Fee Payment Receipt</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Receipt No:</div><div className="font-mono">RCP-{s.usn}-001</div>
                  <div className="text-muted-foreground">Student:</div><div>{s.name}</div>
                  <div className="text-muted-foreground">USN:</div><div className="font-mono">{s.usn}</div>
                  <div className="text-muted-foreground">Branch:</div><div>{s.branch.name}</div>
                  <div className="text-muted-foreground">Amount Paid:</div><div className="font-bold">₹{s.paidAmount.toLocaleString()}</div>
                  <div className="text-muted-foreground">Status:</div><div>{feeStatusBadge(s.feeStatus)}</div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => window.print()}>Print Receipt</Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
