/**
 * Examination & Curriculum Data Store for Campus OS
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
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  totalCredits: number;
  earnedCredits: number;
  status: "PASSED" | "FAILED";
  courses: StudentCourseGrade[];
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

export function generateStudentAcademicRecord(studentId: string, branchId: string = "cs", year: number = 2) {
  const branchList = branchCourses.filter(c => c.branchId === branchId);
  const currentSemester = Math.min(year * 2, 8);
  
  // Deterministic seed based on studentId
  let seed = 0;
  for (let i = 0; i < studentId.length; i++) {
    seed = (seed + studentId.charCodeAt(i) * (i + 1)) % 1000;
  }

  const semesters: SemesterResult[] = [];

  for (let sem = 1; sem <= currentSemester; sem++) {
    let coursesForSem = branchList.filter(c => c.semester === sem);
    if (coursesForSem.length === 0) {
      // Fallback standard curriculum courses
      coursesForSem = [
        { code: `SUB${sem}01`, title: `Advanced Engineering Mathematics ${sem}`, credits: 4, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}02`, title: `Applied Core Engineering Principles ${sem}`, credits: 4, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}03`, title: `Domain Elective Specialization ${sem}`, credits: 3, type: "Theory", branchId, semester: sem },
        { code: `SUB${sem}04`, title: `Applied Department Laboratory ${sem}`, credits: 2, type: "Lab", branchId, semester: sem },
      ];
    }

    let totalPoints = 0;
    let semCredits = 0;

    const courseGrades: StudentCourseGrade[] = coursesForSem.map((course, idx) => {
      // Deterministic grade distribution (mostly 65 - 95 with realistic variance)
      const internal = 28 + ((seed + idx * 7 + sem * 11) % 12); // 28 to 39 / 40
      const external = 40 + ((seed * 3 + idx * 13 + sem * 5) % 19); // 40 to 58 / 60
      const total = internal + external;
      const { gradePoint, gradeLetter, status } = calculateGrade(total);

      totalPoints += gradePoint * course.credits;
      semCredits += course.credits;

      return {
        courseCode: course.code,
        courseTitle: course.title,
        credits: course.credits,
        internalMarks: internal,
        externalMarks: external,
        totalMarks: total,
        gradePoint,
        gradeLetter,
        status,
      };
    });

    const sgpa = semCredits === 0 ? 0 : Number((totalPoints / semCredits).toFixed(2));

    semesters.push({
      semester: sem,
      sgpa,
      totalCredits: semCredits,
      earnedCredits: semCredits,
      status: "PASSED",
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
    totalCreditsEarned: totalAllCredits,
    semesters,
  };
}
