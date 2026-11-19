import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select as CustomSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllStudents, branches, Student } from "@/data/seedData";
import { Search, Filter, Eye, Download } from "lucide-react";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";

export default function Students() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [feeFilter, setFeeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const activeCollegeId = localStorage.getItem("activeCollegeId") || "mit-college-id";
  
  const allData = getAllStudents(activeCollegeId);

  const filtered = useMemo(() => {
    return allData.filter((s: any) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.usn.toLowerCase().includes(search.toLowerCase());
      const matchBranch = branchFilter === "all" || s.branch.id === branchFilter;
      const matchYear = yearFilter === "all" || s.year === parseInt(yearFilter);
      const matchFee = feeFilter === "all" || s.feeStatus === feeFilter;
      return matchSearch && matchBranch && matchYear && matchFee;
    });
  }, [search, branchFilter, yearFilter, feeFilter, allData]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      toast({ title: "No data to export", description: "Filter criteria matched 0 students.", variant: "destructive" });
      return;
    }
    exportToCsv(
      `students_export_${new Date().toISOString().split("T")[0]}`,
      filtered,
      [
        { header: "USN", accessor: s => s.usn },
        { header: "Name", accessor: s => s.name },
        { header: "Email", accessor: s => s.email },
        { header: "Phone", accessor: s => s.phone },
        { header: "Branch", accessor: s => typeof s.branch === 'object' ? s.branch.name : s.branch },
        { header: "Year", accessor: s => s.year },
        { header: "Fee Status", accessor: s => s.feeStatus },
        { header: "Paid Amount (INR)", accessor: s => s.paidAmount },
        { header: "Total Fee (INR)", accessor: s => s.totalFee },
        { header: "Attendance (%)", accessor: s => `${s.attendancePercentage}%` },
        { header: "Admission Date", accessor: s => s.admissionDate },
      ]
    );
    toast({ title: "Export Successful", description: `Exported ${filtered.length} students to CSV.` });
  };

  const feeStatusBadge = (status: string) => {
    if (status === "full") return <Badge className="bg-success/10 text-success border-0">Full</Badge>;
    if (status === "half") return <Badge className="bg-warning/10 text-warning border-0">Half</Badge>;
    return <Badge className="bg-destructive/10 text-destructive border-0">Pending</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Students</h1>
            <p className="text-muted-foreground text-sm">{filtered.length} students found</p>
          </div>
          <Button variant="outline" onClick={handleExportCsv} className="gap-2 shrink-0">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or USN..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select 
                value={branchFilter} 
                onChange={e => { setBranchFilter(e.target.value); setPage(1); }}
                className="flex h-10 w-full sm:w-44 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Branches</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select 
                value={yearFilter} 
                onChange={e => { setYearFilter(e.target.value); setPage(1); }}
                className="flex h-10 w-full sm:w-32 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={String(y)}>Year {y}</option>)}
              </select>
              <select 
                value={feeFilter} 
                onChange={e => { setFeeFilter(e.target.value); setPage(1); }}
                className="flex h-10 w-full sm:w-36 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Status</option>
                <option value="full">Full</option>
                <option value="half">Half</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>USN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Branch</TableHead>
                  <TableHead className="hidden sm:table-cell">Year</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead className="hidden lg:table-cell">Attendance</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map(s => (
                  <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/students/${s.id}`)}>
                    <TableCell className="font-mono text-sm">{s.usn}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{s.branch.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{s.year}</TableCell>
                    <TableCell>{feeStatusBadge(s.feeStatus)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={s.attendancePercentage >= 75 ? "secondary" : "destructive"} className="text-xs">
                        {s.attendancePercentage}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>


    </DashboardLayout>
  );
}
