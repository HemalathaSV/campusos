import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export interface ApplicationData {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  amount: number;
  status: string;
  payment: 'pay' | 'paid' | 'not_paid' | 'no_payment';
  date: string;
  entranceExam?: string;
  rank?: number;
  allocatedBranch?: string;
}

const dummyApps: ApplicationData[] = [
  { id: "app-1", user_id: "u1", name: "Kishan K", email: "kishank@gmail.com", phone: "4563698521", branch: "Mechanical", amount: 120000, status: 'pending', payment: 'paid', date: '2026-03-24' },
  { id: "app-2", user_id: "u2", name: "Ananya S", email: "ananya@example.com", phone: "9876543210", branch: "Computer Science", amount: 150000, status: 'Pay', payment: 'paid', date: '2026-03-22' },
  { id: "app-3", user_id: "u3", name: "Rahul V", email: "rahulv@gmail.com", phone: "8765432109", branch: "Civil", amount: 110000, status: 'No Payment', payment: 'no_payment', date: '2026-03-25' },
  { id: "app-4", user_id: "u4", name: "Priya M", email: "priyam@example.com", phone: "7654321098", branch: "Electrical", amount: 120000, status: 'pending', payment: 'not_paid', date: '2026-03-26' },
  { id: "app-5", user_id: "u5", name: "Vikram R", email: "vikram@example.com", phone: "6543210987", branch: "Electronics", amount: 130000, status: 'pending', payment: 'paid', date: '2026-03-27' },
  { id: "app-6", user_id: "u6", name: "Sneha P", email: "snehap@gmail.com", phone: "9871236540", branch: "Computer Science", amount: 150000, status: 'pending', payment: 'not_paid', date: '2026-03-28' },
  { id: "app-7", user_id: "u7", name: "Rohan D", email: "rohand@gmail.com", phone: "8769012345", branch: "Mechanical", amount: 120000, status: 'pending', payment: 'not_paid', date: '2026-03-28' },
  { id: "app-8", user_id: "u8", name: "Kavya J", email: "kavyaj@gmail.com", phone: "7650981234", branch: "Civil", amount: 110000, status: 'pending', payment: 'paid', date: '2026-03-29' },
  { id: "app-9", user_id: "u9", name: "Aditya N", email: "adityan@gmail.com", phone: "6541230987", branch: "Electronics", amount: 130000, status: 'pending', payment: 'no_payment', date: '2026-03-29' },
  { id: "app-10", user_id: "u10", name: "Neha S", email: "nehas@gmail.com", phone: "9812347650", branch: "Information Technology", amount: 140000, status: 'pending', payment: 'paid', date: '2026-03-30' },
];

export const subscribeToApplications = (callback: (apps: ApplicationData[]) => void) => {
  const getApps = () => {
    let apps = JSON.parse(localStorage.getItem('mock_applications_v3') || 'null');
    if (!apps) {
      apps = dummyApps.map(app => ({...app, collegeName: "MIT College", collegeId: "mit-college-id", status: "pending"}));
      localStorage.setItem('mock_applications_v3', JSON.stringify(apps));
    }
    const currentCollegeId = localStorage.getItem('activeCollegeId') || 'mit-college-id';
    return apps.filter((a: any) => a.collegeId === currentCollegeId || a.college_id === currentCollegeId || (!a.collegeId && !a.college_id && currentCollegeId === 'mit-college-id'));
  };
  
  callback(getApps());

  // Check for updates every second to simulate subscription
  const interval = setInterval(() => {
    callback(getApps());
  }, 1000);

  return () => clearInterval(interval);
};

export const updateApplicationStatus = async (
  id: string, 
  status: string
) => {
  const apps: ApplicationData[] = JSON.parse(localStorage.getItem('mock_applications_v3') || '[]');
  const appIndex = apps.findIndex(app => app.id === id);
  if (appIndex === -1) return;
  
  const app = apps[appIndex];
  
  apps[appIndex] = { ...app, status };
  localStorage.setItem('mock_applications_v3', JSON.stringify(apps));

  // If approved, create a real student record for auth bypass and permanent access
  if (status === 'Pay') {
    const mockStudents = JSON.parse(localStorage.getItem('mock_generated_students') || '[]');
    if (!mockStudents.find((s: any) => s.email === app.email)) {
      const newStudent = {
        id: `stu-${Date.now()}`,
        name: app.name,
        email: app.email,
        branch: app.allocatedBranch || app.branch,
        role: 'student',
        password: 'student123',
        college_id: localStorage.getItem('activeCollegeId') || 'mit-college-id',
        admissionDate: app.date || new Date().toISOString().split("T")[0]
      };
      
      // Keep local flow smooth as the sole unified data source now
      mockStudents.push(newStudent);
      localStorage.setItem('mock_generated_students', JSON.stringify(mockStudents));
    }
  }
};

export const createApplication = async (appData: Omit<ApplicationData, "id">) => {
  let apps: ApplicationData[] = JSON.parse(localStorage.getItem('mock_applications_v3') || '[]');
  const newApp = { ...appData, id: `app-${Date.now()}`, collegeName: localStorage.getItem('activeCollegeName') || 'MIT College', college_id: localStorage.getItem('activeCollegeId') || 'mit-college-id' } as any;
  apps = [newApp, ...apps];
  localStorage.setItem('mock_applications_v3', JSON.stringify(apps));
};
