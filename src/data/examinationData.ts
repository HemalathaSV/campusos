/**
 * Examination & Curriculum Data Store for Campus OS
 * Supports Grade calculation, SGPA/CGPA evaluation, and Backlog / Supplementary Tracking
 */

export interface SubjectCourse {
  code: string;
  title: string;
  credits: number;
  type: "Theory" | "Lab";
  branchId: string;
  semester: number;
}

export interface StudentCourseGrade {
  courseCode: string;
  courseTitle: string;
  credits: number;
  internalMarks: number; // Max 40
  externalMarks: number; // Max 60
  totalMarks: number;    // Max 100
  gradePoint: number;    // 0 - 10
  gradeLetter: string;   // O, A+, A, B+, B, C, P, F
  status: "Pass" | "Fail";
  isBacklog: boolean;
  semester: number;
  attemptNumber?: number;
  performanceRemark?: string;
  remedialRecommendation?: string;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  status: "PASSED" | "FAILED";
  courses: StudentCourseGrade[];
}

export interface SupplementaryRegistration {
  id: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  examFee: number;
  registrationDate: string;
  status: "Registered" | "Admit Card Issued" | "Cleared";
  receiptNumber?: string;
  paymentMethod?: string;
}

export const branchCourses: SubjectCourse[] = [
  // Computer Science
  { code: "CS101", title: "Problem Solving & C Programming", credits: 4, type: "Theory", branchId: "cs", semester: 1 },
  { code: "CS102", title: "Digital Logic & Computer Organization", credits: 4, type: "Theory", branchId: "cs", semester: 1 },
  { code: "CS201", title: "Data Structures & Algorithms", credits: 4, type: "Theory", branchId: "cs", semester: 2 },
  { code: "CS202", title: "Object Oriented Design using Java", credits: 3, type: "Theory", branchId: "cs", semester: 2 },
  { code: "CS301", title: "Database Management Systems", credits: 4, type: "Theory", branchId: "cs", semester: 3 },
  { code: "CS302", title: "Operating Systems & Virtualization", credits: 4, type: "Theory", branchId: "cs", semester: 3 },
  { code: "CS303", title: "Algorithms & Data Structures Lab", credits: 2, type: "Lab", branchId: "cs", semester: 3 },
  { code: "CS401", title: "Computer Networks & Protocol Suite", credits: 4, type: "Theory", branchId: "cs", semester: 4 },
  { code: "CS402", title: "Software Engineering & Cloud DevOps", credits: 3, type: "Theory", branchId: "cs", semester: 4 },
  { code: "CS403", title: "Full-Stack Web Technologies Lab", credits: 2, type: "Lab", branchId: "cs", semester: 4 },

  // Mechanical
  { code: "ME101", title: "Engineering Mechanics & Dynamics", credits: 4, type: "Theory", branchId: "me", semester: 1 },
  { code: "ME201", title: "Thermodynamics & Heat Transfer", credits: 4, type: "Theory", branchId: "me", semester: 2 },
  { code: "ME301", title: "Fluid Mechanics & Turbo Machinery", credits: 4, type: "Theory", branchId: "me", semester: 3 },
  { code: "ME401", title: "CAD / CAM Design & Finite Elements", credits: 3, type: "Theory", branchId: "me", semester: 4 },
  { code: "ME402", title: "Automotive Systems & Materials Lab", credits: 2, type: "Lab", branchId: "me", semester: 4 },

  // Electronics (ECE)
  { code: "EC101", title: "Basic Electrical & Circuit Theory", credits: 4, type: "Theory", branchId: "ece", semester: 1 },
  { code: "EC201", title: "Analog Circuits & Operational Amplifiers", credits: 4, type: "Theory", branchId: "ece", semester: 2 },
  { code: "EC301", title: "Signals, Systems & DSP Algorithms", credits: 4, type: "Theory", branchId: "ece", semester: 3 },
  { code: "EC401", title: "Microcontrollers & Embedded IoT", credits: 4, type: "Theory", branchId: "ece", semester: 4 },
  { code: "EC402", title: "VLSI Synthesis & Simulation Lab", credits: 2, type: "Lab", branchId: "ece", semester: 4 },

  // Civil (CE)
  { code: "CE101", title: "Engineering Surveying & Geomatics", credits: 4, type: "Theory", branchId: "ce", semester: 1 },
  { code: "CE201", title: "Strength of Materials & Structural Analysis", credits: 4, type: "Theory", branchId: "ce", semester: 2 },
  { code: "CE301", title: "Concrete Technology & Construction", credits: 3, type: "Theory", branchId: "ce", semester: 3 },
  { code: "CE401", title: "Hydrology & Water Resource Engineering", credits: 4, type: "Theory", branchId: "ce", semester: 4 },
  { code: "CE402", title: "Geotechnical & Soil Testing Lab", credits: 2, type: "Lab", branchId: "ce", semester: 4 },
];

export function calculateGrade(totalMarks: number): { gradePoint: number; gradeLetter: string; status: "Pass" | "Fail" } {
  if (totalMarks >= 90) return { gradePoint: 10, gradeLetter: "O", status: "Pass" };
  if (totalMarks >= 80) return { gradePoint: 9, gradeLetter: "A+", status: "Pass" };
  if (totalMarks >= 70) return { gradePoint: 8, gradeLetter: "A", status: "Pass" };
  if (totalMarks >= 60) return { gradePoint: 7, gradeLetter: "B+", status: "Pass" };
  if (totalMarks >= 50) return { gradePoint: 6, gradeLetter: "B", status: "Pass" };
  if (totalMarks >= 40) return { gradePoint: 5, gradeLetter: "C", status: "Pass" };
  return { gradePoint: 0, gradeLetter: "F", status: "Fail" };
}

export function getPerformanceRemark(totalMarks: number, internal: number, external: number): {
  remark: string;
  recommendation: string;
} {
  if (totalMarks < 40 || internal < 16 || external < 24) {
    return {
      remark: "Arrears Incurred: Course Not Cleared",
      recommendation: "Remedial Coaching Required. Register for supplementary re-examination re-evaluation.",
    };
  }
  if (totalMarks >= 90) {
    return {
      remark: "Outstanding Mastery (Grade O)",
      recommendation: "Recommended for Department Academic Honors & Peer Mentorship.",
    };
  }
  if (totalMarks >= 80) {
    return {
      remark: "Distinction (Grade A+)",
      recommendation: "Eligible for Advanced Research Electives & Tier-1 Placement Fast-Track.",
    };
  }
  if (totalMarks >= 70) {
    return {
      remark: "Very Good (Grade A)",
      recommendation: "Strong theoretical understanding. Advised to build competitive GitHub portfolio projects.",
    };
  }
  if (totalMarks >= 60) {
    return {
      remark: "Good (Grade B+)",
      recommendation: "Consistent performance. Strengthen applied coding and lab assessments.",
    };
  }
  if (totalMarks >= 50) {
    return {
      remark: "Above Average (Grade B)",
      recommendation: "Focus on semester core subjects. Regular revision recommended.",
    };
  }
  return {
    remark: "Marginal Clearance (Grade C)",
    recommendation: "Borderline pass. Recommended to attend faculty tutorial doubt-clearing sessions.",
  };
}

export function generateStudentAcademicRecord(studentId: string, branchId: string = "cs", year: number = 2) {
  const branchList = branchCourses.filter(c => c.branchId === branchId);
  const currentSemester = Math.min(year * 2, 8);
  
  // Deterministic seed based on studentId
  let seed = 0;
  for (let i = 0; i < studentId.length; i++) {
    seed = (seed + studentId.charCodeAt(i) * (i + 1)) % 1000;
  }

  // Check for student-specific overrides in localStorage (e.g. cleared backlogs)
  const clearedBacklogs: string[] = JSON.parse(localStorage.getItem(`cleared_backlogs_${studentId}`) || "[]");

  const semesters: SemesterResult[] = [];
  const allBacklogs: StudentCourseGrade[] = [];

  for (let sem = 1; sem <= currentSemester; sem++) {
    let coursesForSem = branchList.filter(c => c.semester === sem);
    if (coursesForSem.length === 0) {
      coursesForSem = [
        { code: `SUB${sem}01`, title: `Advanced Engineering Mathematics ${sem}`, credits: 4, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}02`, title: `Applied Core Engineering Principles ${sem}`, credits: 4, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}03`, title: `Domain Elective Specialization ${sem}`, credits: 3, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}04`, title: `Applied Department Laboratory ${sem}`, credits: 2, type: "Lab", branchId, semester: sem },
      ];
    }

    let totalPoints = 0;
    let semTotalCredits = 0;
    let semEarnedCredits = 0;

    const courseGrades: StudentCourseGrade[] = coursesForSem.map((course, idx) => {
      // Deterministic grade distribution
      let internal = 28 + ((seed + idx * 7 + sem * 11) % 12);
      let external = 40 + ((seed * 3 + idx * 13 + sem * 5) % 19);

      // Controlled backlog simulation for students with seed % 5 === 0 (approx 20% of cohort)
      // Only for earlier semesters
      const isSimulatedBacklog = (seed % 4 === 0) && sem === 2 && idx === 1 && !clearedBacklogs.includes(course.code);

      if (isSimulatedBacklog) {
        internal = 12;
        external = 18;
      }

      const total = internal + external;
      const { gradePoint, gradeLetter, status } = calculateGrade(total);

      semTotalCredits += course.credits;
      if (status === "Pass") {
        totalPoints += gradePoint * course.credits;
        semEarnedCredits += course.credits;
      }

      const { remark, recommendation } = getPerformanceRemark(total, internal, external);

      const gradeObj: StudentCourseGrade = {
        courseCode: course.code,
        courseTitle: course.title,
        credits: course.credits,
        internalMarks: internal,
        externalMarks: external,
        totalMarks: total,
        gradePoint,
        gradeLetter,
        status,
        isBacklog: status === "Fail",
        semester: sem,
        performanceRemark: remark,
        remedialRecommendation: recommendation,
      };

      if (gradeObj.isBacklog) {
        allBacklogs.push(gradeObj);
      }

      return gradeObj;
    });

    const sgpa = semTotalCredits === 0 ? 0 : Number((totalPoints / semTotalCredits).toFixed(2));

    semesters.push({
      semester: sem,
      sgpa,
      totalCredits: semTotalCredits,
      earnedCredits: semEarnedCredits,
      status: semEarnedCredits === semTotalCredits ? "PASSED" : "FAILED",
      courses: courseGrades,
    });
  }

  // Calculate overall CGPA
  const totalEarnedPoints = semesters.reduce((sum, s) => sum + s.sgpa * s.totalCredits, 0);
  const totalAllCredits = semesters.reduce((sum, s) => sum + s.totalCredits, 0);
  const cgpa = totalAllCredits === 0 ? 0 : Number((totalEarnedPoints / totalAllCredits).toFixed(2));

  return {
    studentId,
    cgpa,
    totalCreditsEarned: semesters.reduce((sum, s) => sum + s.earnedCredits, 0),
    totalDegreeCredits: totalAllCredits,
    activeBacklogsCount: allBacklogs.length,
    hasBacklogs: allBacklogs.length > 0,
    backlogCourses: allBacklogs,
    semesters,
  };
}

export function registerSupplementaryExam(
  studentId: string,
  courseCode: string,
  courseTitle: string,
  paymentMethod: string = "UPI QR Code",
  status: "Registered" | "Admit Card Issued" | "Cleared" = "Admit Card Issued"
): SupplementaryRegistration {
  const key = "campusos_supplementary_registrations";
  const existing: SupplementaryRegistration[] = JSON.parse(localStorage.getItem(key) || "[]");
  
  const registration: SupplementaryRegistration = {
    id: `suppl-${Date.now()}`,
    studentId,
    courseCode,
    courseTitle,
    examFee: 500,
    registrationDate: new Date().toISOString().split("T")[0],
    status,
    receiptNumber: `REC-SUPPL-${Math.floor(100000 + Math.random() * 900000)}`,
    paymentMethod,
  };

  existing.push(registration);
  localStorage.setItem(key, JSON.stringify(existing));
  return registration;
}

export function updateSupplementaryRegistrationStatus(
  registrationId: string,
  newStatus: SupplementaryRegistration["status"]
): void {
  const key = "campusos_supplementary_registrations";
  const existing: SupplementaryRegistration[] = JSON.parse(localStorage.getItem(key) || "[]");
  const updated = existing.map(r => (r.id === registrationId ? { ...r, status: newStatus } : r));
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getSupplementaryRegistrations(studentId?: string): SupplementaryRegistration[] {
  const key = "campusos_supplementary_registrations";
  const existing: SupplementaryRegistration[] = JSON.parse(localStorage.getItem(key) || "[]");
  if (!studentId) return existing;
  return existing.filter(r => r.studentId === studentId);
}
