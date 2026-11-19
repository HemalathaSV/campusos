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
  HostelRoom,
  MaintenanceTicket,
  getHostelRooms,
  allocateRoom,
  getMaintenanceTickets,
  submitMaintenanceTicket,
  updateTicketStatus,
} from "@/data/hostelData";
import { addNotification } from "@/services/notifications";
import { exportToCsv } from "@/utils/exportCsv";
import { toast } from "@/hooks/use-toast";
import {
  Building,
  Bed,
  Wrench,
  Wifi,
  Zap,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Download,
  ShieldCheck,
  User,
  Users
} from "lucide-react";

export default function Hostel() {
  const { role, user, collegeId } = useAuth();
  const allStudents = useMemo(() => getAllStudents(collegeId), [collegeId]);

  // Current student identity
  const currentStudent = useMemo(() => {
    return allStudents.find(s => s.id === (user as any)?.uid) || allStudents[0];
  }, [allStudents, user]);

  // State
  const [rooms, setRooms] = useState<HostelRoom[]>(() => getHostelRooms());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => getMaintenanceTickets());
  const [activeTab, setActiveTab] = useState("rooms");
  const [blockFilter, setBlockFilter] = useState("all");

  // Ticket Form Dialog State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketRoom, setTicketRoom] = useState("A-101");
  const [ticketBlock, setTicketBlock] = useState("Block A (Boys)");
  const [ticketCategory, setTicketCategory] = useState<MaintenanceTicket["category"]>("Electrical");
  const [ticketPriority, setTicketPriority] = useState<MaintenanceTicket["priority"]>("Medium");
  const [ticketDescription, setTicketDescription] = useState("");

  // Student assigned room
  const studentRoom = useMemo(() => {
    return rooms.find(r => r.occupants.some(o => o.studentId === currentStudent?.id));
  }, [rooms, currentStudent]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (blockFilter === "all") return rooms;
    return rooms.filter(r => r.block === blockFilter);
  }, [rooms, blockFilter]);

  const totalBeds = useMemo(() => rooms.reduce((sum, r) => sum + r.capacity, 0), [rooms]);
  const occupiedBeds = useMemo(() => rooms.reduce((sum, r) => sum + r.occupied, 0), [rooms]);
  const occupancyPercentage = Math.round((occupiedBeds / (totalBeds || 1)) * 100);

  const handleAllocate = (roomNumber: string) => {
    if (!currentStudent) return;
    const res = allocateRoom(roomNumber, {
      studentId: currentStudent.id,
      name: currentStudent.name,
      usn: currentStudent.usn,
    });

    if (!res.success) {
      toast({ variant: "destructive", title: "Allocation Failed", description: res.message });
      return;
    }

    setRooms(getHostelRooms());
    toast({
      title: "Room Allocated Successfully",
      description: `Assigned to ${roomNumber}. Hostel pass and biometric access activated.`,
    });

    addNotification({
      title: "Hostel Room Assigned",
      message: `You have been allocated ${roomNumber}. Please contact the hostel warden for key handover.`,
      type: "success",
      targetRole: "student",
    });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      toast({ variant: "destructive", title: "Description Required", description: "Please specify the issue." });
      return;
    }

    const created = submitMaintenanceTicket({
      roomNumber: ticketRoom,
      block: ticketBlock,
      category: ticketCategory,
      priority: ticketPriority,
      description: ticketDescription,
      submittedBy: currentStudent?.name || "Student Resident",
      studentUsn: currentStudent?.usn || "1MS21CS001",
    });

    setTickets(getMaintenanceTickets());
    setIsNewTicketOpen(false);
    setTicketDescription("");

    toast({
      title: "Maintenance Ticket Logged",
      description: `Ticket #${created.id.slice(-4)} routed to campus facility engineer.`,
    });

    addNotification({
      title: "Hostel Maintenance Request",
      message: `${created.category} issue logged for ${created.roomNumber} (${created.priority} Priority).`,
      type: "info",
      targetRole: "admin",
    });
  };

  const handleStatusUpdate = (ticketId: string, newStatus: MaintenanceTicket["status"]) => {
    updateTicketStatus(ticketId, newStatus);
    setTickets(getMaintenanceTickets());
    toast({
      title: "Ticket Status Updated",
      description: `Ticket marked as ${newStatus}.`,
    });
  };

  const handleExportHostelData = () => {
    exportToCsv(
      `hostel_occupancy_${new Date().toISOString().split("T")[0]}`,
      rooms,
      [
        { header: "Room", accessor: r => r.roomNumber },
        { header: "Block", accessor: r => r.block },
        { header: "Floor", accessor: r => r.floor },
        { header: "Capacity", accessor: r => r.capacity },
        { header: "Occupied", accessor: r => r.occupied },
        { header: "Available Beds", accessor: r => r.capacity - r.occupied },
        { header: "Monthly Rent (₹)", accessor: r => `₹${r.monthlyRent}` },
        { header: "Occupants", accessor: r => r.occupants.map(o => `${o.name} (${o.usn})`).join("; ") },
      ]
    );
    toast({ title: "Hostel Data Exported", description: `Exported ${rooms.length} room records to CSV.` });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" /> Hostel Allocation & Facility Helpdesk
            </h1>
            <p className="text-muted-foreground text-sm">
              Live room bed availability, resident allocation, and facility maintenance ticketing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportHostelData} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button size="sm" onClick={() => setIsNewTicketOpen(true)} className="gradient-primary border-0 gap-2 font-medium">
              <Plus className="h-4 w-4" /> File Maintenance Ticket
            </Button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold font-display mt-1">{totalBeds} <span className="text-sm font-normal text-muted-foreground">Beds</span></p>
                <p className="text-xs text-muted-foreground mt-1">Across Blocks A & B</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Bed className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold font-display text-primary mt-1">{occupancyPercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">{occupiedBeds} occupied / {totalBeds - occupiedBeds} free</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold font-display text-warning mt-1">
                  {tickets.filter(t => t.status === "Open" || t.status === "In Progress").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Maintenance requests</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Wrench className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-semibold text-muted-foreground">Resolved Issues</p>
                <p className="text-2xl font-bold font-display text-success mt-1">
                  {tickets.filter(t => t.status === "Resolved").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Resolved this semester</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Assigned Room Status Banner */}
        {role === "student" && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Resident Status: {currentStudent?.name} ({currentStudent?.usn})
                </h3>
                {studentRoom ? (
                  <p className="text-xs text-muted-foreground">
                    Assigned to <strong className="text-foreground">{studentRoom.roomNumber}</strong> ({studentRoom.block}, Floor {studentRoom.floor}) • Monthly Rent: ₹{studentRoom.monthlyRent}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    You currently have no hostel room allocated. Browse available rooms below to request allocation.
                  </p>
                )}
              </div>
              {studentRoom && (
                <Badge className="bg-success text-success-foreground border-0 py-1 px-3">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active Resident
                </Badge>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tabs: Rooms vs Helpdesk */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <TabsList>
              <TabsTrigger value="rooms" className="gap-2">
                <Bed className="h-4 w-4" /> Room Allocation Matrix ({filteredRooms.length})
              </TabsTrigger>
              <TabsTrigger value="tickets" className="gap-2">
                <Wrench className="h-4 w-4" /> Facility Helpdesk ({tickets.length})
              </TabsTrigger>
            </TabsList>

            {activeTab === "rooms" && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Filter Block:</span>
                <select
                  value={blockFilter}
                  onChange={e => setBlockFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Blocks</option>
                  <option value="Block A (Boys)">Block A (Boys)</option>
                  <option value="Block B (Girls)">Block B (Girls)</option>
                </select>
              </div>
            )}
          </div>

          {/* Rooms Grid */}
          <TabsContent value="rooms" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredRooms.map(room => {
                const isFull = room.occupied >= room.capacity;
                const isAssignedToCurrent = room.occupants.some(o => o.studentId === currentStudent?.id);

                return (
                  <Card key={room.roomNumber} className="border-border/60 hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-foreground">{room.roomNumber}</span>
                        <Badge
                          className={`border-0 text-[11px] font-semibold ${
                            isAssignedToCurrent
                              ? "bg-primary text-primary-foreground"
                              : isFull
                              ? "bg-destructive/15 text-destructive"
                              : room.occupied === 0
                              ? "bg-success/15 text-success"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          {isAssignedToCurrent ? "Your Room" : isFull ? "Full (0 Free)" : `${room.capacity - room.occupied} Bed Free`}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {room.block} • Floor {room.floor}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0 text-xs">
                      <div className="space-y-1.5 p-2 rounded-lg bg-muted/40 border border-border/50 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Rent:</span>
                          <span className="font-bold font-mono text-foreground">₹{room.monthlyRent}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Occupancy:</span>
                          <span className="font-medium">{room.occupied} / {room.capacity} Beds</span>
                        </div>
                        <div className="pt-1 border-t border-border/40">
                          <span className="text-muted-foreground block mb-1">Occupants:</span>
                          {room.occupants.length > 0 ? (
                            <ul className="space-y-0.5">
                              {room.occupants.map(o => (
                                <li key={o.studentId} className="text-foreground font-medium flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" /> {o.name}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground italic">No occupants (Vacant)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map(a => (
                          <Badge key={a} variant="outline" className="text-[10px] text-muted-foreground">
                            {a}
                          </Badge>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        {isAssignedToCurrent ? (
                          <Button size="sm" variant="outline" disabled className="w-full h-8 text-xs text-primary border-primary/40 bg-primary/5">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Currently Residing
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={isFull}
                            className={`w-full h-8 text-xs font-medium ${!isFull ? "gradient-primary border-0" : ""}`}
                            variant={!isFull ? "default" : "outline"}
                            onClick={() => handleAllocate(room.roomNumber)}
                          >
                            {isFull ? "Room Full" : "Allocate / Switch Room"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Helpdesk Tickets Tab */}
          <TabsContent value="tickets" className="mt-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="font-display text-base">
                  Facility Maintenance Helpdesk Tickets
                </CardTitle>
                <CardDescription>
                  Electrical, plumbing, carpentry, and Wi-Fi repair tickets tracked by campus maintenance staff
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Room & Block</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Priority</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead className="text-center">Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      {role === "admin" && <TableHead className="text-center">Manage</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs font-bold text-primary">
                          #{ticket.id.slice(-6)}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold">{ticket.roomNumber}</span>
                          <span className="block text-[11px] text-muted-foreground">{ticket.block}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-xs">
                          <p className="font-medium">{ticket.description}</p>
                          {ticket.resolutionNotes && (
                            <p className="text-[11px] text-muted-foreground italic mt-0.5">
                              Note: {ticket.resolutionNotes}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`border-0 text-[11px] ${
                              ticket.priority === "Emergency" || ticket.priority === "High"
                                ? "bg-destructive/20 text-destructive font-bold"
                                : ticket.priority === "Medium"
                                ? "bg-warning/20 text-warning"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span>{ticket.submittedBy}</span>
                          <span className="block font-mono text-[11px] text-muted-foreground">{ticket.studentUsn}</span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">{ticket.createdDate}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`border-0 text-xs font-semibold ${
                              ticket.status === "Resolved"
                                ? "bg-success/20 text-success"
                                : ticket.status === "In Progress"
                                ? "bg-info/20 text-info"
                                : "bg-warning/20 text-warning"
                            }`}
                          >
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        {role === "admin" && (
                          <TableCell className="text-center">
                            <select
                              value={ticket.status}
                              onChange={e => handleStatusUpdate(ticket.id, e.target.value as any)}
                              className="h-7 text-xs rounded border border-input bg-background px-2 focus:ring-1 focus:ring-primary focus:outline-none"
                            >
                              <option value="Open">Open</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Maintenance Ticket Modal */}
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" /> Report Facility Maintenance Issue
              </DialogTitle>
              <DialogDescription>
                Submit a repair request to campus electrical, plumbing, or facility staff.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTicket} className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Hostel Block</label>
                  <select
                    value={ticketBlock}
                    onChange={e => setTicketBlock(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2"
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Girls)">Block B (Girls)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Room Number *</label>
                  <Input value={ticketRoom} onChange={e => setTicketRoom(e.target.value)} placeholder="e.g. A-101" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={ticketCategory}
                    onChange={e => setTicketCategory(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Wi-Fi & Network">Wi-Fi & Network</option>
                    <option value="Carpentry / Furniture">Carpentry / Furniture</option>
                    <option value="Housekeeping">Housekeeping</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Urgency Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={e => setTicketPriority(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-background px-2"
                  >
                    <option value="Low">Low (Routine)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Urgent)</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Describe the problem in detail *</label>
                <Textarea
                  value={ticketDescription}
                  onChange={e => setTicketDescription(e.target.value)}
                  placeholder="e.g. Geyser switch tripping main fuse whenever powered on..."
                  rows={3}
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary border-0">
                  Submit Ticket
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
