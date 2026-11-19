import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
import {
  BookItem,
  BorrowedBook,
  getLibraryCatalog,
  saveNewBook,
  getBorrowedRecords,
  borrowBookItem,
  returnBookItem,
} from "@/data/libraryData";
import { addNotification } from "@/services/notifications";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";
import {
  Library as LibraryIcon,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Download,
  RotateCcw,
  BookMarked,
  Layers,
  MapPin,
  ExternalLink,
  Bell
} from "lucide-react";

function getDueStatus(dueDateStr: string, status: string, fineAmount: number) {
  if (status === "Returned") {
    return {
      label: "Returned",
      badgeClass: "bg-muted text-muted-foreground",
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${overdueDays}d (Fine: ₹${fineAmount})`,
      badgeClass: "bg-destructive/20 text-destructive border-destructive/40 font-bold",
    };
  }
  if (diffDays === 0) {
    return {
      label: "Due Today!",
      badgeClass: "bg-warning/20 text-warning border-warning/40 font-bold animate-pulse",
    };
  }
  if (diffDays <= 3) {
    return {
      label: `Due Soon (${diffDays}d left)`,
      badgeClass: "bg-warning/20 text-warning border-warning/40 font-semibold",
    };
  }
  return {
    label: `Active (${diffDays}d remaining)`,
    badgeClass: "bg-success/20 text-success border-success/30 font-semibold",
  };
}

export default function Library() {
  const { role, user, collegeId } = useAuth();
  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  // Current student identity
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === (user as any)?.uid) || allStudents[0];
  }, [allStudents, user]);

  // State
  const [catalog, setCatalog] = useState<BookItem[]>(() => getLibraryCatalog());
  const [borrowedList, setBorrowedList] = useState<BorrowedBook[]>(() => getBorrowedRecords());
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(role === "student" ? "catalog" : "circulation");

  // Borrower search state (Faculty / Admin)
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [circulationStatusFilter, setCirculationStatusFilter] = useState("all");

  // Add Book Dialog State (Admin/Librarian)
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newIsbn, setNewIsbn] = useState("");
  const [newBranch, setNewBranch] = useState("Computer Science");
  const [newCopies, setNewCopies] = useState("5");
  const [newShelf, setNewShelf] = useState("Rack CS-06, Bay A");
  const [newPublisher, setNewPublisher] = useState("Pearson");
  const [newYear, setNewYear] = useState("2024");

  // Filtered books
  const filteredCatalog = useMemo(() => {
    return catalog.filter(book => {
      const matchSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBranch = branchFilter === "all" || book.branch === branchFilter;
      return matchSearch && matchBranch;
    });
  }, [catalog, searchQuery, branchFilter]);

  const studentBorrows = useMemo(() => {
    return borrowedList.filter(b => b.studentId === currentStudent?.id);
  }, [borrowedList, currentStudent]);

  const activeStudentBorrows = useMemo(() => {
    return studentBorrows.filter(b => b.status !== "Returned");
  }, [studentBorrows]);

  const filteredCirculation = useMemo(() => {
    return borrowedList.filter(b => {
      const matchSearch =
        b.bookTitle.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
        b.studentName.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
        b.usn.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
        b.isbn.toLowerCase().includes(borrowerSearch.toLowerCase());
      const matchStatus =
        circulationStatusFilter === "all" ||
        (circulationStatusFilter === "active" && b.status !== "Returned") ||
        (circulationStatusFilter === "overdue" && b.status === "Overdue") ||
        (circulationStatusFilter === "returned" && b.status === "Returned");
      return matchSearch && matchStatus;
    });
  }, [borrowedList, borrowerSearch, circulationStatusFilter]);

  const handleBorrow = (book: BookItem) => {
    if (!currentStudent) return;
    const res = borrowBookItem(book.id, {
      id: currentStudent.id,
      name: currentStudent.name,
      usn: currentStudent.usn,
    });

    if (!res.success) {
      toast({ variant: "destructive", title: "Cannot Borrow Book", description: res.message });
      return;
    }

    setCatalog(getLibraryCatalog());
    setBorrowedList(getBorrowedRecords());

    toast({
      title: "Book Issued Successfully",
      description: res.message,
    });

    addNotification({
      title: "Library Book Borrowed",
      message: `You borrowed "${book.title}". Please return by ${res.record?.dueDate}.`,
      type: "info",
      targetRole: "student",
    });
  };

  const handleReturn = (borrowId: string) => {
    const res = returnBookItem(borrowId);
    if (!res.success) {
      toast({ variant: "destructive", title: "Error", description: res.message });
      return;
    }

    setCatalog(getLibraryCatalog());
    setBorrowedList(getBorrowedRecords());

    toast({
      title: "Book Returned",
      description: res.message,
    });

    addNotification({
      title: "Library Book Returned",
      message: res.message,
      type: "success",
      targetRole: "student",
    });
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Title and author are required." });
      return;
    }

    const created = saveNewBook({
      title: newTitle,
      author: newAuthor,
      isbn: newIsbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      branch: newBranch,
      totalCopies: parseInt(newCopies) || 5,
      shelfLocation: newShelf,
      publisher: newPublisher,
      year: parseInt(newYear) || 2024,
    });

    setCatalog(getLibraryCatalog());
    setIsAddBookOpen(false);

    toast({
      title: "Book Added to Catalog",
      description: `"${created.title}" is now available in digital library inventory.`,
    });

    // Reset
    setNewTitle("");
    setNewAuthor("");
  };

  const handleExportCirculation = () => {
    exportToCsv(
      `library_circulation_${new Date().toISOString().split("T")[0]}`,
      borrowedList,
      [
        { header: "Book Title", accessor: b => b.bookTitle },
        { header: "ISBN", accessor: b => b.isbn },
        { header: "Student Name", accessor: b => b.studentName },
        { header: "USN", accessor: b => b.usn },
        { header: "Borrow Date", accessor: b => b.borrowDate },
        { header: "Due Date", accessor: b => b.dueDate },
        { header: "Return Date", accessor: b => b.returnDate || "Not Returned" },
        { header: "Status", accessor: b => b.status },
        { header: "Fine (₹)", accessor: b => `₹${b.fineAmount}` },
      ]
    );
    toast({ title: "Circulation Ledger Exported", description: `Exported ${borrowedList.length} records.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <LibraryIcon className="h-6 w-6 text-primary" /> Digital Campus Library & Book Tracker
            </h1>
            <p className="text-muted-foreground text-sm">
              Search departmental textbooks, check real-time rack availability, and track borrowing due dates
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCirculation} className="gap-2">
              <Download className="h-4 w-4" /> Export Ledger
            </Button>
            {role === "admin" && (
              <Button size="sm" onClick={() => setIsAddBookOpen(true)} className="gradient-primary border-0 gap-2 font-medium">
                <Plus className="h-4 w-4" /> Add Book to Catalog
              </Button>
            )}
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Catalog Titles</p>
                <p className="text-2xl font-bold font-display mt-1">{catalog.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {catalog.reduce((sum, b) => sum + b.totalCopies, 0)} Total Copies
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Currently Issued</p>
                <p className="text-2xl font-bold font-display text-info mt-1">
                  {borrowedList.filter(b => b.status !== "Returned").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Books in circulation</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                <BookMarked className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Overdue Returns</p>
                <p className="text-2xl font-bold font-display text-destructive mt-1">
                  {borrowedList.filter(b => b.status === "Overdue").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">₹5 / day fine policy</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">
                  {role === "student" ? "My Active Borrows" : "Total Circulations"}
                </p>
                <p className="text-2xl font-bold font-display text-success mt-1">
                  {role === "student" ? activeStudentBorrows.length : borrowedList.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {role === "student" ? "Max 3 books allowed" : "All-time borrow records"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <Bookmark className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Catalog vs My Borrowed vs Circulation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <TabsList>
              <TabsTrigger value="catalog" className="gap-2">
                <BookOpen className="h-4 w-4" /> Book Catalog ({filteredCatalog.length})
              </TabsTrigger>
              {role === "student" ? (
                <TabsTrigger value="my-borrows" className="gap-2">
                  <Bookmark className="h-4 w-4" /> My Borrowed Books ({activeStudentBorrows.length})
                </TabsTrigger>
              ) : (
                <TabsTrigger value="circulation" className="gap-2">
                  <BookMarked className="h-4 w-4" /> Circulation & Borrower Audit ({borrowedList.length})
                </TabsTrigger>
              )}
            </TabsList>

            {activeTab === "catalog" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search title, author, ISBN..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 text-xs"
                  />
                </div>
                <select
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
            )}
          </div>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredCatalog.map(book => {
                const isAvailable = book.availableCopies > 0;
                const hasBorrowed = studentBorrows.some(b => b.bookId === book.id && b.status !== "Returned");

                return (
                  <Card key={book.id} className="border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {book.branch}
                        </Badge>
                        <Badge
                          className={`border-0 text-[11px] ${
                            isAvailable ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {isAvailable ? `${book.availableCopies} Available` : "Checked Out"}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold mt-2 line-clamp-2 leading-snug">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        by {book.author}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0 text-xs">
                      <div className="space-y-1 p-2 rounded-lg bg-muted/40 border border-border/50 text-[11px] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Location:</span>
                          <span className="text-foreground font-mono">{book.shelfLocation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>ISBN:</span>
                          <span className="font-mono text-muted-foreground">{book.isbn}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Publisher:</span>
                          <span>{book.publisher} ({book.year})</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        {hasBorrowed ? (
                          <Button size="sm" variant="outline" disabled className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 bg-primary/5">
                            <CheckCircle2 className="h-3.5 w-3.5" /> In Your Possession
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!isAvailable}
                            className={`w-full h-8 text-xs font-medium ${isAvailable ? "gradient-primary border-0" : ""}`}
                            variant={isAvailable ? "default" : "outline"}
                            onClick={() => handleBorrow(book)}
                          >
                            {isAvailable ? "Borrow Book (14 Days)" : "No Copies Available"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Student "My Borrowed Books" Tab with Live Countdown */}
          <TabsContent value="my-borrows" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="font-display text-base">My Active & Past Borrowings</CardTitle>
                <CardDescription className="text-xs">
                  Keep track of book return deadlines and live days remaining countdowns to avoid library late fines
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
                      <TableHead className="text-center">Due Countdown Status</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentBorrows.map(record => {
                      const dueInfo = getDueStatus(record.dueDate, record.status, record.fineAmount);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-semibold text-xs max-w-xs">{record.bookTitle}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{record.isbn}</TableCell>
                          <TableCell className="text-center font-mono text-xs">{record.borrowDate}</TableCell>
                          <TableCell className="text-center font-mono text-xs font-semibold">{record.dueDate}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`border text-xs ${dueInfo.badgeClass}`}>
                              {dueInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {record.status !== "Returned" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1.5"
                                onClick={() => handleReturn(record.id)}
                              >
                                <RotateCcw className="h-3 w-3" /> Return Book
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground font-mono">
                                Returned on {record.returnDate}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {studentBorrows.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No borrowing records found. Browse the library catalog above!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Circulation & Borrower Audit Tab (Faculty & Admin View) */}
          <TabsContent value="circulation" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-base">Book Circulation & Borrower Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Institutional ledger of issued books, borrowing students, return deadlines, and overdue fines
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search student, USN, title..."
                      value={borrowerSearch}
                      onChange={e => setBorrowerSearch(e.target.value)}
                      className="pl-8 h-9 text-xs"
                    />
                  </div>
                  <select
                    value={circulationStatusFilter}
                    onChange={e => setCirculationStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">All Circulations</option>
                    <option value="active">Active Only</option>
                    <option value="overdue">Overdue Only</option>
                    <option value="returned">Returned</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title & ISBN</TableHead>
                      <TableHead>Borrower Student</TableHead>
                      <TableHead className="text-center">Issued On</TableHead>
                      <TableHead className="text-center">Return Deadline</TableHead>
                      <TableHead className="text-center">Due Status</TableHead>
                      <TableHead className="text-center">Late Fine</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCirculation.map(record => {
                      const dueInfo = getDueStatus(record.dueDate, record.status, record.fineAmount);
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="text-xs">
                            <span className="font-semibold text-foreground block">{record.bookTitle}</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{record.isbn}</span>
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className="font-medium">{record.studentName}</span>
                            <span className="block font-mono text-[11px] text-muted-foreground">{record.usn}</span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">{record.borrowDate}</TableCell>
                          <TableCell className="text-center font-mono text-xs font-semibold">{record.dueDate}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`border-0 text-xs ${dueInfo.badgeClass}`}>
                              {dueInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono font-bold text-xs text-destructive">
                            {record.fineAmount > 0 ? `₹${record.fineAmount}` : "₹0"}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Link to={`/students/${record.studentId}`}>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/5">
                                  <ExternalLink className="h-3 w-3" /> 360° Profile
                                </Button>
                              </Link>
                              {record.status !== "Returned" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    toast({
                                      title: "Due Reminder Dispatched",
                                      description: `Library notification sent to ${record.studentName} (${record.usn}) for "${record.bookTitle}".`,
                                    });
                                  }}
                                >
                                  <Bell className="h-3 w-3 mr-1" /> Remind
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredCirculation.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No circulation records found matching search filters.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Book Modal */}
        <Dialog open={isAddBookOpen} onOpenChange={setIsAddBookOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Register Book in Library Inventory
              </DialogTitle>
              <DialogDescription>
                Catalog a new textbook or reference volume into the digital campus library.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddBook} className="space-y-3 py-2 text-xs">
              <div>
                <label className="font-semibold block mb-1">Book Title *</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Operating System Concepts" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Primary Author(s) *</label>
                  <Input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="e.g. Silberschatz" required />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <select
                    value={newBranch}
                    onChange={e => setNewBranch(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Total Copies Count</label>
                  <Input type="number" min={1} value={newCopies} onChange={e => setNewCopies(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Shelf / Bay Location</label>
                  <Input value={newShelf} onChange={e => setNewShelf(e.target.value)} placeholder="e.g. Rack CS-05, Bay A" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Publisher</label>
                  <Input value={newPublisher} onChange={e => setNewPublisher(e.target.value)} />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Publication Year</label>
                  <Input type="number" value={newYear} onChange={e => setNewYear(e.target.value)} />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddBookOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary border-0">
                  Save to Catalog
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
