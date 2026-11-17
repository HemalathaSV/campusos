// 200 students across 4 branches with realistic Indian names and USNs

const firstNames = [
  "Aarav","Aditi","Akash","Ananya","Arjun","Bhavya","Chetan","Deepa","Divya","Eshan",
  "Farhan","Gauri","Harsh","Isha","Jatin","Kavya","Lakshmi","Manish","Neha","Om",
  "Priya","Rahul","Sakshi","Tanvi","Uday","Varun","Yash","Zara","Amit","Sneha",
  "Rohit","Pooja","Vikas","Meera","Sanjay","Riya","Karan","Nisha","Ajay","Swati",
  "Nikhil","Anjali","Suresh","Pallavi","Ravi","Shreya","Anil","Komal","Vijay","Sonia",
];
const lastNames = [
  "Sharma","Patel","Kumar","Singh","Reddy","Verma","Gupta","Joshi","Nair","Iyer",
  "Rao","Mishra","Chauhan","Das","Mehta","Shah","Malhotra","Bhat","Kulkarni","Desai",
  "Patil","Menon","Pandey","Srivastava","Agarwal","Jain","Saxena","Tiwari","Kapoor","Chopra",
];
const branches = [
  { id: "cs", name: "Computer Science", code: "CS" },
  { id: "me", name: "Mechanical", code: "ME" },
  { id: "ece", name: "Electronics", code: "EC" },
  { id: "ce", name: "Civil", code: "CE" },
];

export const facultyList = [
  { name: "Prof. Ranjith K C", email: "ranjith.kc@gmail.com", phone: "9845123670", department: "Computer Science", college_name: "MIT College" },
  { name: "Dr. Madhu S N", email: "madhu.sn@gmail.com", phone: "9876543210", department: "Computer Science", college_name: "MIT College" },
  { name: "Prof. Anitha M", email: "anitha.m@gmail.com", phone: "9123456789", department: "Information Technology", college_name: "MIT College" },
  { name: "Dr. Vivek Rao", email: "vivek.rao@gmail.com", phone: "9988776655", department: "Electronics", college_name: "MIT College" },
  { name: "Prof. Suresh B", email: "suresh.b@gmail.com", phone: "9765432109", department: "Mechanical", college_name: "MIT College" },
  { name: "Dr. Kavya R", email: "kavya.r@gmail.com", phone: "9345678123", department: "Civil", college_name: "MIT College" },
  { name: "Prof. Prakash H", email: "prakash.h@gmail.com", phone: "9012345678", department: "Mechanical", college_name: "MIT College" },
  { name: "Dr. Nithin Kumar", email: "nithin.kumar@gmail.com", phone: "8899776655", department: "Computer Science", college_name: "MIT College" },
  { name: "Prof. Deepa S", email: "deepa.s@gmail.com", phone: "9123987654", department: "Electronics", college_name: "MIT College" },
  { name: "Dr. Harish G", email: "harish.g@gmail.com", phone: "9876123450", department: "Civil", college_name: "MIT College" },
  { name: "Prof. Shwetha N", email: "shwetha.n@gmail.com", phone: "9090909090", department: "Computer Science", college_name: "MIT College" },
  { name: "Dr. Kiran P", email: "kiran.p@gmail.com", phone: "9988001122", department: "Mechanical", college_name: "MIT College" },
  { name: "Prof. Meena R", email: "meena.r@gmail.com", phone: "9345612789", department: "Electronics", college_name: "MIT College" },
  { name: "Dr. Rohit S", email: "rohit.s@gmail.com", phone: "9786453210", department: "Computer Science", college_name: "MIT College" },
  { name: "Prof. Arjun V", email: "arjun.v@gmail.com", phone: "9654321870", department: "Civil", college_name: "MIT College" },
  { name: "Dr. Sneha K", email: "sneha.k@gmail.com", phone: "9123450987", department: "Information Technology", college_name: "MIT College" },
  { name: "Prof. Manjunath H", email: "manjunath.h@gmail.com", phone: "9845012345", department: "Electronics", college_name: "MIT College" },
  { name: "Dr. Pooja M", email: "pooja.m@gmail.com", phone: "9876501234", department: "Computer Science", college_name: "MIT College" },
  { name: "Prof. Naveen R", email: "naveen.r@gmail.com", phone: "9034567891", department: "Mechanical", college_name: "MIT College" },
  { name: "Dr. Tejaswini S", email: "tejaswini.s@gmail.com", phone: "9765123409", department: "Civil", college_name: "MIT College" }
];

const years = [1, 2, 3, 4];
const feeStatuses: Array<"full" | "half" | "pending"> = ["full", "half", "pending"];
const feeAmounts: Record<string, number> = { full: 120000, half: 60000, pending: 0 };

export interface Student {
  id: string;
  usn: string;
  name: string;
  email: string;
  phone: string;
  branch: typeof branches[number];
  year: number;
  feeStatus: "full" | "half" | "pending";
  totalFee: number;
  paidAmount: number;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  admissionDate: string;
  college_name?: string;
  college_id?: string;
  collegeName?: string;
  collegeId?: string;
  password?: string;
  admission_date?: string;
}

export function generateStudents(customCollegeName = "MIT College", customCollegeId = "mit-college-id"): Student[] {
  const students: Student[] = [];
  for (let i = 0; i < 200; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const branch = branches[i % 4];
    const year = years[i % 4];
    const feeStatus = feeStatuses[i % 3];
    const totalFee = 120000;
    const paidAmount = feeStatus === "full" ? 120000 : feeStatus === "half" ? 60000 : 0;
    const totalClasses = 100;
    const attendedClasses = 50 + (i % 51); // 50 to 100
    const num = String(i + 1).padStart(3, "0");
    const usn = `1SI22${branch.code}${num}`;

    students.push({
      id: `student-${i + 1}`,
      usn,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}${i + 1}@gmail.com`,
      phone: `+91 ${String(7000000000 + (i * 1234567) % 3000000000)}`,
      branch,
      year,
      feeStatus,
      totalFee,
      paidAmount,
      totalClasses,
      attendedClasses,
      get attendancePercentage() {
        return this.totalClasses === 0 ? 0 : Math.round((this.attendedClasses / this.totalClasses) * 100);
      },
      admissionDate: `2022-0${(i % 6) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
      college_name: customCollegeName,
      college_id: customCollegeId
    });
  }
  return students;
}

export const students = generateStudents();
export { branches };

export const initializeStudentData = (defaultCollegeId = "mit-college-id") => {
  const existingData = localStorage.getItem('mock_generated_students');
  const dSetVersion = localStorage.getItem('mock_dataset_v2');
  if (!existingData || JSON.parse(existingData).length === 0 || !dSetVersion) {
    // Inject the clean predefined linear dataset
    const freshData = generateStudents("MIT College", defaultCollegeId);
    localStorage.setItem('mock_generated_students', JSON.stringify(freshData));
    localStorage.setItem('mock_dataset_v2', 'true');
  }
};

export const getAllStudents = (collegeId: string): Student[] => {
  // Ensure strict dataset unification across all modules (Admin, Profile, Login)
  const unifiedSource: any[] = JSON.parse(localStorage.getItem('mock_generated_students') || '[]');
  
  return unifiedSource.filter((s: any) => s.college_id === collegeId || s.collegeId === collegeId).map(s => ({
    id: s.id || `stu-${Math.random()}`,
    usn: s.usn || `USN-${Math.floor(Math.random() * 10000)}`,
    name: s.name,
    email: s.email,
    password: s.password || "student123", // Normalize password for the cached instances
    phone: s.phone || "Not Provided",
    branch: typeof s.branch === 'object' ? s.branch : (branches.find(b => b.name === s.branch) || { id: "cs", name: s.branch || "Computer Science", code: "CS" }),
    year: s.year || 1,
    feeStatus: s.feeStatus || "full",
    totalFee: s.totalFee || 120000,
    paidAmount: s.paidAmount || (s.feeStatus === "full" ? 120000 : s.feeStatus === "half" ? 60000 : 0),
    totalClasses: s.totalClasses || 100,
    attendedClasses: s.attendedClasses ?? (s.attendancePercentage ? Math.round((s.attendancePercentage / 100) * (s.totalClasses || 100)) : 100),
    attendancePercentage: s.totalClasses && s.totalClasses > 0
      ? Math.round(((s.attendedClasses ?? s.attendancePercentage ?? 100) / s.totalClasses) * 100)
      : (s.attendancePercentage || 100),
    admissionDate: s.admissionDate || s.admission_date || new Date().toISOString().split("T")[0],
    college_name: s.college_name || s.collegeName,
    college_id: s.college_id || s.collegeId
  })) as Student[];
};

export const getAllFaculty = (collegeId: string) => {
  const generated: any[] = JSON.parse(localStorage.getItem('mock_generated_faculty') || '[]');
  const formattedGen = generated.filter((f: any) => f.college_id === collegeId).map(f => ({
    name: f.name, email: f.email, phone: f.phone || "Not Provided", department: f.department, college_name: f.college_name || f.collegeName, college_id: f.college_id || f.collegeId
  }));

  if (collegeId === "mit-college-id") {
    const mitFaculty = facultyList.map(f => ({ ...f, college_id: "mit-college-id" }));
    return [...mitFaculty, ...formattedGen];
  }
  return formattedGen;
};

const loadLedger = () => {
  try {
    const stored = localStorage.getItem("dailyLedger");
    return stored ? JSON.parse(stored) : {};
  } catch(e) {
    return {};
  }
};
export const dailyLedger: Record<string, Record<string, boolean>> = loadLedger();

export function getDailyStatistics(date: string, branchId: string, yearStr: string, collegeId: string) {
  const collegeStudents = getAllStudents(collegeId);
  const relevantStudents = collegeStudents.filter(s => 
    (branchId === "all" || s.branch.id === branchId) && 
    (yearStr === "all" || s.year === parseInt(yearStr))
  );
  
  const record = dailyLedger[date];
  if (!record) {
    return { present: 0, absent: 0, total: relevantStudents.length, isRecorded: false };
  }
  
  let present = 0;
  let absent = 0;
  
  relevantStudents.forEach(s => {
    if (record[s.id] !== undefined) {
      if (record[s.id]) present++;
      else absent++;
    }
  });
  
  return { present, absent, total: relevantStudents.length, isRecorded: true };
}

export function recordDailyAttendance(date: string, attendanceRecord: Record<string, boolean>, collegeId: string) {
  if (!dailyLedger[date]) {
    dailyLedger[date] = {};
  }
  const oldRecord = dailyLedger[date];
  const targetStudents = getAllStudents(collegeId);

  targetStudents.forEach(student => {
    if (attendanceRecord[student.id] !== undefined) {
      const wasRecorded = oldRecord[student.id] !== undefined;
      const wasPresent = oldRecord[student.id];
      const isPresent = attendanceRecord[student.id];

      if (!wasRecorded) {
        student.totalClasses += 1;
        if (isPresent) student.attendedClasses += 1;
      } else {
        if (!wasPresent && isPresent) student.attendedClasses += 1;
        if (wasPresent && !isPresent) student.attendedClasses -= 1;
      }

      dailyLedger[date][student.id] = isPresent;
    }
  });

  try {
    localStorage.setItem("dailyLedger", JSON.stringify(dailyLedger));

    // Persist updated attendance stats back into master student storage
    const allStoredStudents: any[] = JSON.parse(localStorage.getItem('mock_generated_students') || '[]');
    const targetMap = new Map(targetStudents.map(s => [s.id, s]));

    const updatedStored = allStoredStudents.map(stored => {
      const updated = targetMap.get(stored.id);
      if (updated) {
        const pct = updated.totalClasses === 0 ? 0 : Math.round((updated.attendedClasses / updated.totalClasses) * 100);
        return {
          ...stored,
          totalClasses: updated.totalClasses,
          attendedClasses: updated.attendedClasses,
          attendancePercentage: pct,
        };
      }
      return stored;
    });

    localStorage.setItem('mock_generated_students', JSON.stringify(updatedStored));
  } catch (e) {
    console.warn("Could not save daily ledger to local storage", e);
  }
}

// Dashboard stats
export function getDashboardStats(collegeId: string) {
  const targetStudents = getAllStudents(collegeId);
  const total = targetStudents.length;
  const feesCollected = targetStudents.reduce((s, st) => s + st.paidAmount, 0);
  const totalFees = targetStudents.reduce((s, st) => s + st.totalFee, 0);
  const pendingFees = totalFees - feesCollected;
  const avgAttendance = total === 0 ? 0 : Math.round(targetStudents.reduce((s, st) => s + st.attendancePercentage, 0) / total);
  const lowAttendance = targetStudents.filter(s => s.attendancePercentage < 75).length;
  const feeDefaulters = targetStudents.filter(s => s.feeStatus === "pending").length;

  const branchDistribution = branches.map(b => ({
    name: b.name,
    count: targetStudents.filter(s => s.branch.id === b.id).length,
  })).filter(b => b.count > 0);

  const monthlyFees = [
    { month: "Jan", amount: total > 0 ? 1800000 : 0 }, { month: "Feb", amount: total > 0 ? 2200000 : 0 },
    { month: "Mar", amount: total > 0 ? 1500000 : 0 }, { month: "Apr", amount: total > 0 ? 2800000 : 0 },
    { month: "May", amount: total > 0 ? 1200000 : 0 }, { month: "Jun", amount: total > 0 ? 3200000 : 0 },
    { month: "Jul", amount: total > 0 ? 2500000 : 0 }, { month: "Aug", amount: total > 0 ? 1900000 : 0 },
    { month: "Sep", amount: total > 0 ? 2100000 : 0 }, { month: "Oct", amount: total > 0 ? 2700000 : 0 },
    { month: "Nov", amount: total > 0 ? 2400000 : 0 }, { month: "Dec", amount: total > 0 ? 3000000 : 0 },
  ];

  return { total, feesCollected, totalFees, pendingFees, avgAttendance, lowAttendance, feeDefaulters, branchDistribution, monthlyFees };
}
