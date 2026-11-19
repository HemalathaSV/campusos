/**
 * Campus OS - Hostel Allocation & Facility Maintenance Helpdesk Data Store
 */

export interface HostelRoom {
  roomNumber: string;
  block: "Block A (Boys)" | "Block B (Girls)";
  floor: number;
  capacity: number;
  occupied: number;
  amenities: string[];
  monthlyRent: number;
  occupants: { studentId: string; name: string; usn: string }[];
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  block: string;
  category: "Electrical" | "Plumbing" | "Wi-Fi & Network" | "Carpentry / Furniture" | "Housekeeping";
  description: string;
  priority: "Low" | "Medium" | "High" | "Emergency";
  submittedBy: string;
  studentUsn: string;
  createdDate: string;
  status: "Open" | "In Progress" | "Resolved";
  resolutionNotes?: string;
}

export const initialRooms: HostelRoom[] = [
  {
    roomNumber: "A-101",
    block: "Block A (Boys)",
    floor: 1,
    capacity: 2,
    occupied: 2,
    amenities: ["Attached Bath", "Balcony", "Wi-Fi AP", "Study Desks"],
    monthlyRent: 7500,
    occupants: [
      { studentId: "student-1", name: "Aarav Sharma", usn: "1MS21CS001" },
      { studentId: "student-3", name: "Rahul Verma", usn: "1MS21EC082" },
    ],
  },
  {
    roomNumber: "A-102",
    block: "Block A (Boys)",
    floor: 1,
    capacity: 2,
    occupied: 1,
    amenities: ["Attached Bath", "Wi-Fi AP", "Study Desks"],
    monthlyRent: 7000,
    occupants: [
      { studentId: "student-5", name: "Vikram Malhotra", usn: "1MS21ME034" },
    ],
  },
  {
    roomNumber: "A-201",
    block: "Block A (Boys)",
    floor: 2,
    capacity: 3,
    occupied: 0,
    amenities: ["Balcony", "Wi-Fi AP", "Air Conditioning"],
    monthlyRent: 8500,
    occupants: [],
  },
  {
    roomNumber: "A-202",
    block: "Block A (Boys)",
    floor: 2,
    capacity: 2,
    occupied: 1,
    amenities: ["Attached Bath", "Wi-Fi AP"],
    monthlyRent: 6500,
    occupants: [
      { studentId: "student-7", name: "Kunal Singhania", usn: "1MS21CS112" },
    ],
  },
  {
    roomNumber: "B-101",
    block: "Block B (Girls)",
    floor: 1,
    capacity: 2,
    occupied: 2,
    amenities: ["Attached Bath", "Balcony", "Wi-Fi AP", "Study Desks"],
    monthlyRent: 7500,
    occupants: [
      { studentId: "student-2", name: "Sneha Patel", usn: "1MS21CS045" },
      { studentId: "student-4", name: "Ananya Iyer", usn: "1MS21EC019" },
    ],
  },
  {
    roomNumber: "B-102",
    block: "Block B (Girls)",
    floor: 1,
    capacity: 2,
    occupied: 1,
    amenities: ["Attached Bath", "Wi-Fi AP"],
    monthlyRent: 7000,
    occupants: [
      { studentId: "student-6", name: "Pooja Hegde", usn: "1MS21CE021" },
    ],
  },
  {
    roomNumber: "B-201",
    block: "Block B (Girls)",
    floor: 2,
    capacity: 3,
    occupied: 0,
    amenities: ["Air Conditioning", "Balcony", "Attached Bath"],
    monthlyRent: 9000,
    occupants: [],
  },
  {
    roomNumber: "B-202",
    block: "Block B (Girls)",
    floor: 2,
    capacity: 2,
    occupied: 0,
    amenities: ["Attached Bath", "Wi-Fi AP"],
    monthlyRent: 6500,
    occupants: [],
  },
];

export const initialTickets: MaintenanceTicket[] = [
  {
    id: "ticket-1",
    roomNumber: "A-101",
    block: "Block A (Boys)",
    category: "Electrical",
    description: "Ceiling fan regulator sparking and speed switch stuck on low.",
    priority: "High",
    submittedBy: "Aarav Sharma",
    studentUsn: "1MS21CS001",
    createdDate: "2026-11-20",
    status: "In Progress",
    resolutionNotes: "Electrician assigned; replacement part requisitioned.",
  },
  {
    id: "ticket-2",
    roomNumber: "B-101",
    block: "Block B (Girls)",
    category: "Wi-Fi & Network",
    description: "Access point 2.4GHz SSID intermittent connectivity in evenings.",
    priority: "Medium",
    submittedBy: "Sneha Patel",
    studentUsn: "1MS21CS045",
    createdDate: "2026-11-18",
    status: "Resolved",
    resolutionNotes: "Firmware re-flashed and gateway channel switched to 6.",
  },
  {
    id: "ticket-3",
    roomNumber: "A-102",
    block: "Block A (Boys)",
    category: "Plumbing",
    description: "Slow drainage in bathroom washbasin pipe.",
    priority: "Medium",
    submittedBy: "Vikram Malhotra",
    studentUsn: "1MS21ME034",
    createdDate: "2026-11-21",
    status: "Open",
  },
];

const STORAGE_KEY_ROOMS = "campusos_hostel_rooms";
const STORAGE_KEY_TICKETS = "campusos_hostel_tickets";

export function getHostelRooms(): HostelRoom[] {
  const stored = localStorage.getItem(STORAGE_KEY_ROOMS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(initialRooms));
    return initialRooms;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialRooms;
  }
}

export function allocateRoom(
  roomNumber: string,
  student: { studentId: string; name: string; usn: string }
): { success: boolean; message: string } {
  const rooms = getHostelRooms();
  const room = rooms.find(r => r.roomNumber === roomNumber);
  if (!room) return { success: false, message: "Room not found." };

  if (room.occupied >= room.capacity) {
    return { success: false, message: "Room is already at full capacity." };
  }

  // Check if student already in any room
  rooms.forEach(r => {
    r.occupants = r.occupants.filter(o => o.studentId !== student.studentId);
    r.occupied = r.occupants.length;
  });

  room.occupants.push(student);
  room.occupied = room.occupants.length;

  localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
  return { success: true, message: `Room ${roomNumber} assigned to ${student.name} successfully.` };
}

export function getMaintenanceTickets(): MaintenanceTicket[] {
  const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(initialTickets));
    return initialTickets;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialTickets;
  }
}

export function submitMaintenanceTicket(data: Omit<MaintenanceTicket, "id" | "createdDate" | "status">): MaintenanceTicket {
  const tickets = getMaintenanceTickets();
  const newTicket: MaintenanceTicket = {
    ...data,
    id: `ticket-${Date.now()}`,
    createdDate: new Date().toISOString().split("T")[0],
    status: "Open",
  };
  tickets.unshift(newTicket);
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  return newTicket;
}

export function updateTicketStatus(
  ticketId: string,
  newStatus: MaintenanceTicket["status"],
  notes?: string
): void {
  const tickets = getMaintenanceTickets();
  const updated = tickets.map(t => {
    if (t.id === ticketId) {
      return {
        ...t,
        status: newStatus,
        resolutionNotes: notes || t.resolutionNotes || `Marked as ${newStatus}`,
      };
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
}
