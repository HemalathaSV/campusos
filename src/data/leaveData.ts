/**
 * Campus OS - Student & Faculty Leave Application Data Store
 */

export interface LeaveRequest {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantRole: "student" | "faculty";
  applicantIdentifier: string; // USN or Faculty ID
  department: string;
  leaveType: "Medical" | "Casual" | "On-Duty (OD)" | "Academic / Conference";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  appliedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  remarks?: string;
}

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-101",
    applicantId: "student-1",
    applicantName: "Aarav Sharma",
    applicantRole: "student",
    applicantIdentifier: "1MS21CS001",
    department: "Computer Science",
    leaveType: "Medical",
    startDate: "2026-11-25",
    endDate: "2026-11-27",
    daysCount: 3,
    reason: "Viral fever and physician recommended bed rest.",
    appliedDate: "2026-11-24",
    status: "Approved",
    approvedBy: "Dr. Ramesh Kumar (HOD CS)",
    remarks: "Medical certificate verified.",
  },
  {
    id: "leave-102",
    applicantId: "student-2",
    applicantName: "Sneha Patel",
    applicantRole: "student",
    applicantIdentifier: "1MS21CS045",
    department: "Computer Science",
    leaveType: "On-Duty (OD)",
    startDate: "2026-12-02",
    endDate: "2026-12-04",
    daysCount: 3,
    reason: "Representing college at Smart India Hackathon Grand Finale in IIT Bombay.",
    appliedDate: "2026-11-20",
    status: "Pending",
  },
  {
    id: "leave-103",
    applicantId: "faculty-1",
    applicantName: "Prof. Priya Nair",
    applicantRole: "faculty",
    applicantIdentifier: "FAC-CS-012",
    department: "Computer Science",
    leaveType: "Academic / Conference",
    startDate: "2026-12-08",
    endDate: "2026-12-10",
    daysCount: 3,
    reason: "Presenting research paper on Distributed LLM Serving at IEEE ICASSP.",
    appliedDate: "2026-11-18",
    status: "Approved",
    approvedBy: "Principal Office",
    remarks: "Paper acceptance verified. Duty leave sanctioned.",
  },
  {
    id: "leave-104",
    applicantId: "student-3",
    applicantName: "Rahul Verma",
    applicantRole: "student",
    applicantIdentifier: "1MS21EC082",
    department: "Electronics & Communication",
    leaveType: "Casual",
    startDate: "2026-11-29",
    endDate: "2026-11-30",
    daysCount: 2,
    reason: "Attending sister's wedding ceremony in home town.",
    appliedDate: "2026-11-21",
    status: "Pending",
  },
];

const STORAGE_KEY_LEAVES = "campusos_leave_requests";

export function getLeaveRequests(applicantId?: string): LeaveRequest[] {
  const stored = localStorage.getItem(STORAGE_KEY_LEAVES);
  let list: LeaveRequest[] = initialLeaveRequests;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch {}
  } else {
    localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(initialLeaveRequests));
  }

  if (!applicantId) return list;
  return list.filter(l => l.applicantId === applicantId);
}

export function submitLeaveRequest(data: Omit<LeaveRequest, "id" | "appliedDate" | "status">): LeaveRequest {
  const list = getLeaveRequests();
  const newLeave: LeaveRequest = {
    ...data,
    id: `leave-${Date.now()}`,
    appliedDate: new Date().toISOString().split("T")[0],
    status: "Pending",
  };
  list.unshift(newLeave);
  localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(list));
  return newLeave;
}

export function updateLeaveStatus(
  leaveId: string,
  newStatus: "Approved" | "Rejected",
  approverName: string = "HOD / Admin",
  remarks?: string
): void {
  const list = getLeaveRequests();
  const updated = list.map(l => {
    if (l.id === leaveId) {
      return {
        ...l,
        status: newStatus,
        approvedBy: approverName,
        remarks: remarks || (newStatus === "Approved" ? "Sanctioned by department" : "Application rejected"),
      };
    }
    return l;
  });
  localStorage.setItem(STORAGE_KEY_LEAVES, JSON.stringify(updated));
}
