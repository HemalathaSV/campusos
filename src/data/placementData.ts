/**
 * Campus OS - Campus Placement & Corporate Drive Portal Data Store
 */

export interface PlacementDrive {
  id: string;
  company: string;
  logoUrl?: string;
  role: string;
  packageLpa: number;
  type: "Full Time" | "Internship" | "Intern + PPO";
  location: string;
  minCgpa: number;
  maxBacklogs: number; // 0 = strictly 0 backlogs allowed
  allowedBranches: string[]; // ["cs", "ece", "me", "ce"] or ["all"]
  deadline: string;
  driveDate: string;
  rounds: string[];
  status: "Active" | "Upcoming" | "Completed";
  description: string;
  totalOpenings: number;
}

export interface StudentApplication {
  id: string;
  driveId: string;
  company: string;
  role: string;
  packageLpa: number;
  studentId: string;
  studentName: string;
  usn: string;
  branch: string;
  cgpa: number;
  activeBacklogs: number;
  appliedDate: string;
  status: "Applied" | "Shortlisted" | "Technical Round" | "HR Round" | "Offer Selected" | "Not Shortlisted";
}

export const initialPlacementDrives: PlacementDrive[] = [
  {
    id: "drive-1",
    company: "Google Cloud",
    role: "Cloud Infrastructure Engineer",
    packageLpa: 28.5,
    type: "Full Time",
    location: "Bengaluru, Karnataka",
    minCgpa: 8.0,
    maxBacklogs: 0,
    allowedBranches: ["cs", "ece"],
    deadline: "2026-12-15",
    driveDate: "2026-12-20",
    rounds: ["Online Assessment", "Data Structures & Systems", "Googliness & Leadership"],
    status: "Active",
    description: "Designing resilient distributed systems and scalable multi-region microservice deployments.",
    totalOpenings: 12,
  },
  {
    id: "drive-2",
    company: "Amazon Web Services",
    role: "Software Development Engineer - I",
    packageLpa: 22.0,
    type: "Intern + PPO",
    location: "Hyderabad, Telangana",
    minCgpa: 7.5,
    maxBacklogs: 0,
    allowedBranches: ["cs", "ece"],
    deadline: "2026-12-10",
    driveDate: "2026-12-18",
    rounds: ["HackerRank Coding Test", "Technical Problem Solving", "Bar Raiser Interview"],
    status: "Active",
    description: "Build low-latency messaging backends and edge computing services on AWS infrastructure.",
    totalOpenings: 25,
  },
  {
    id: "drive-3",
    company: "Bosch Global Software",
    role: "Embedded Systems & IoT Engineer",
    packageLpa: 11.5,
    type: "Full Time",
    location: "Bengaluru / Coimbatore",
    minCgpa: 6.8,
    maxBacklogs: 1,
    allowedBranches: ["ece", "me", "cs"],
    deadline: "2026-12-22",
    driveDate: "2026-12-28",
    rounds: ["Aptitude & Technical MCQ", "Hardware/Firmware Architecture", "Managerial Interview"],
    status: "Active",
    description: "Automotive ECU sensor integration, CAN bus protocol simulation, and AUTOSAR drivers.",
    totalOpenings: 30,
  },
  {
    id: "drive-4",
    company: "Tata Consultancy Services (TCS Digital)",
    role: "Digital Systems Architect",
    packageLpa: 9.2,
    type: "Full Time",
    location: "Pan-India",
    minCgpa: 6.5,
    maxBacklogs: 1,
    allowedBranches: ["all"],
    deadline: "2027-01-05",
    driveDate: "2027-01-12",
    rounds: ["TCS NQT Assessment", "Coding Round (Advanced)", "Technical + HR Discussion"],
    status: "Upcoming",
    description: "Enterprise application modernization, API gateways, and cloud migration frameworks.",
    totalOpenings: 80,
  },
  {
    id: "drive-5",
    company: "Larsen & Toubro (L&T)",
    role: "Structural Planning Engineer",
    packageLpa: 8.5,
    type: "Full Time",
    location: "Chennai / Mumbai",
    minCgpa: 6.5,
    maxBacklogs: 0,
    allowedBranches: ["ce", "me"],
    deadline: "2027-01-15",
    driveDate: "2027-01-24",
    rounds: ["Core Engineering Assessment", "Site Safety & Technical Case Study", "HR Interview"],
    status: "Upcoming",
    description: "Infrastructure structural modeling, BIM 360 project coordination, and smart foundation analysis.",
    totalOpenings: 15,
  },
  {
    id: "drive-6",
    company: "Microsoft Research",
    role: "AI / ML Research Intern",
    packageLpa: 18.0,
    type: "Internship",
    location: "Bengaluru (Hybrid)",
    minCgpa: 8.5,
    maxBacklogs: 0,
    allowedBranches: ["cs"],
    deadline: "2026-12-05",
    driveDate: "2026-12-14",
    rounds: ["Research Paper Presentation", "Machine Learning Coding", "Principal Scientist Round"],
    status: "Active",
    description: "Foundation model optimization, parameter-efficient fine-tuning, and multimodal inference.",
    totalOpenings: 5,
  },
];

const STORAGE_KEY_DRIVES = "campusos_placement_drives";
const STORAGE_KEY_APPLICATIONS = "campusos_placement_applications";

export function getPlacementDrives(): PlacementDrive[] {
  const stored = localStorage.getItem(STORAGE_KEY_DRIVES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_DRIVES, JSON.stringify(initialPlacementDrives));
    return initialPlacementDrives;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialPlacementDrives;
  }
}

export function savePlacementDrive(drive: Omit<PlacementDrive, "id">): PlacementDrive {
  const list = getPlacementDrives();
  const newDrive: PlacementDrive = {
    ...drive,
    id: `drive-${Date.now()}`,
  };
  list.unshift(newDrive);
  localStorage.setItem(STORAGE_KEY_DRIVES, JSON.stringify(list));
  return newDrive;
}

export function getStudentApplications(studentId?: string): StudentApplication[] {
  const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  let list: StudentApplication[] = [];
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch {}
  }
  if (!studentId) return list;
  return list.filter(a => a.studentId === studentId);
}

export function applyForPlacementDrive(
  drive: PlacementDrive,
  student: {
    id: string;
    name: string;
    usn: string;
    branchId: string;
    cgpa: number;
    activeBacklogs: number;
  }
): { success: boolean; message: string; application?: StudentApplication } {
  // Validate eligibility
  if (student.cgpa < drive.minCgpa) {
    return {
      success: false,
      message: `Ineligible: Minimum CGPA requirement is ${drive.minCgpa} (Your CGPA: ${student.cgpa}).`,
    };
  }

  if (student.activeBacklogs > drive.maxBacklogs) {
    return {
      success: false,
      message: `Ineligible: Maximum ${drive.maxBacklogs} backlog(s) allowed (You currently have ${student.activeBacklogs}).`,
    };
  }

  const isBranchAllowed =
    drive.allowedBranches.includes("all") || drive.allowedBranches.includes(student.branchId.toLowerCase());
  if (!isBranchAllowed) {
    return {
      success: false,
      message: `Ineligible: Drive is only open for branches: ${drive.allowedBranches.join(", ").toUpperCase()}.`,
    };
  }

  const existing = getStudentApplications();
  const alreadyApplied = existing.some(a => a.driveId === drive.id && a.studentId === student.id);
  if (alreadyApplied) {
    return {
      success: false,
      message: "You have already submitted an application for this drive.",
    };
  }

  const newApp: StudentApplication = {
    id: `app-${Date.now()}`,
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    packageLpa: drive.packageLpa,
    studentId: student.id,
    studentName: student.name,
    usn: student.usn,
    branch: student.branchId.toUpperCase(),
    cgpa: student.cgpa,
    activeBacklogs: student.activeBacklogs,
    appliedDate: new Date().toISOString().split("T")[0],
    status: "Applied",
  };

  existing.unshift(newApp);
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(existing));

  return {
    success: true,
    message: `Application to ${drive.company} for ${drive.role} submitted successfully!`,
    application: newApp,
  };
}

export function updateApplicationStatus(
  applicationId: string,
  newStatus: StudentApplication["status"]
): void {
  const existing = getStudentApplications();
  const updated = existing.map(a => (a.id === applicationId ? { ...a, status: newStatus } : a));
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(updated));
}
