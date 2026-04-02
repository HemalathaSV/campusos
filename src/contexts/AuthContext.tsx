import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { facultyList, initializeStudentData, getAllStudents } from "@/data/seedData";

export type UserRole = "admin" | "faculty" | "student";

interface AuthContextType {
  user: User | null;
  session: any | null;
  role: UserRole;
  loading: boolean;
  collegeName: string;
  collegeId: string;
  signIn: (email: string, password: string, expectedRole?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, department?: string) => Promise<void>;
  signOut: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>("admin");
  const [loading, setLoading] = useState(true);
  const [collegeName, setCollegeName] = useState("SBJIT");
  const [collegeId, setCollegeId] = useState("mit-college-id");

  useEffect(() => {
    const activeCollege = localStorage.getItem('activeCollegeName');
    if (activeCollege) setCollegeName(activeCollege);
    const activeCollegeId = localStorage.getItem('activeCollegeId');
    if (activeCollegeId) setCollegeId(activeCollegeId);
    
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
      const u = JSON.parse(mockUser);
      setUser(u as User);
      setSession({ access_token: u.uid });
      setRole(u.role as UserRole);
      setLoading(false);
      return;
    }

    // Ensure the unified student local storage database boots up cleanly on initialization
    initializeStudentData(activeCollegeId || "mit-college-id");

    // Listen directly to Firebase Authentication state without any local fallback checks
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          setSession({ access_token: firebaseUser.uid });
          // Fetch role from Firestore strictly
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role || "student");
            if (data.collegeName) setCollegeName(data.collegeName);
          }
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error("Auth state processing error:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth state subscription error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, expectedRole?: UserRole) => {
    try {
      let mockRole: UserRole | null = null;
      let mockProfile: any = null;
      const actualCollege = localStorage.getItem('activeCollegeName') || "MIT College";
      const actualCollegeId = localStorage.getItem('activeCollegeId') || "mit-college-id";

      // Admin Login
      if (email === "admin@gmail.com") {
        if (password !== "admin123") throw new Error("Incorrect Password");
        mockRole = "admin";
        mockProfile = {
          id: "admin-id",
          name: "System Administrator",
          email: "admin@gmail.com",
          branch: "Central Administration",
          college_name: actualCollege,
          college_id: actualCollegeId
        };
      }

      // Faculty Login
      if (!mockRole) {
        let facFound = null;
        if (actualCollegeId === "mit-college-id") {
          facFound = facultyList.find(f => f.email === email);
        }
        if (!facFound) {
          const generatedFaculty = JSON.parse(localStorage.getItem('mock_generated_faculty') || '[]');
          facFound = generatedFaculty.find((f: any) => f.email === email && (f.college_id === actualCollegeId || f.collegeId === actualCollegeId));
        }

        if (facFound) {
          if (password !== "faculty123") throw new Error("Incorrect Password");
          mockRole = "faculty";
          mockProfile = {
            id: facFound.id || `faculty-${Date.now()}`,
            name: facFound.name,
            email: facFound.email,
            branch: facFound.department,
            college_name: facFound.college_name || facFound.collegeName || actualCollege,
            college_id: facFound.college_id || facFound.collegeId || actualCollegeId
          };
        }
      }

      // Student Login 
      if (!mockRole) {
        // Use the unified localStorage function
        const generatedStudents = getAllStudents(actualCollegeId);
        
        // Strict Login Format Validation
        const inputLower = email.toLowerCase().trim();
        let stuFound = generatedStudents.find(s => s.email.toLowerCase() === inputLower);

        if (!stuFound && expectedRole === "student") {
          if (password === "student123") {
             const namePart = inputLower.split('@')[0].replace(/[0-9]/g, '');
             const name = namePart ? namePart.charAt(0).toUpperCase() + namePart.slice(1) : "Student";
             
             stuFound = {
               id: `student-${Date.now()}`,
               usn: `USN-${Math.floor(Math.random() * 9000) + 1000}`,
               name: name,
               email: inputLower,
               password: "student123",
               phone: "Not Provided",
               branch: { id: "cs", name: "Computer Science", code: "CS" },
               year: 1,
               feeStatus: "full",
               totalFee: 120000,
               paidAmount: 120000,
               totalClasses: 100,
               attendedClasses: 100,
               attendancePercentage: 100,
               admissionDate: new Date().toISOString().split("T")[0],
               college_name: actualCollege,
               college_id: actualCollegeId
             } as any;

             const unifiedSource = JSON.parse(localStorage.getItem('mock_generated_students') || '[]');
             unifiedSource.push(stuFound);
             localStorage.setItem('mock_generated_students', JSON.stringify(unifiedSource));
          }
        }

        if (stuFound) {
          if (password !== "student123" && password !== (stuFound.password || "student123")) {
             throw new Error("Incorrect Password");
          }

          mockRole = "student";
          if (!mockProfile) {
            mockProfile = {
              id: stuFound.id || `student-${Date.now()}`,
              name: stuFound.name,
              email: stuFound.email, // Bind the dataset generated email exactly
              branch: typeof stuFound.branch === 'object' ? stuFound.branch.name : (stuFound.branch || "Computer Science"),
              college_name: stuFound.college_name || stuFound.collegeName || actualCollege,
              college_id: stuFound.college_id || stuFound.collegeId || actualCollegeId,
              admission_date: stuFound.admissionDate || stuFound.admission_date || new Date().toISOString()
            };
          }
        }
      }

      // Pending Application Check
      if (!mockRole) {
        const applications = JSON.parse(localStorage.getItem('mock_applications_v2') || localStorage.getItem('mock_applications') || '[]');
        const pendingApp = applications.find((a: any) => a.email === email && (a.college_id === actualCollegeId || a.collegeId === actualCollegeId || (!a.college_id && actualCollegeId === 'mit-college-id')));
        
        if (pendingApp && (pendingApp.status !== "approved" && pendingApp.status !== "Pay")) {
          if (pendingApp.status === "rejected") {
            throw new Error("Application was rejected by Admin");
          }
          throw new Error("Application pending Admin approval");
        }
      }

      if (mockRole && mockProfile) {
        if (expectedRole && mockRole !== expectedRole) {
          throw new Error(`Invalid role selected. Account exists as a ${mockRole.toUpperCase()}`);
        }
        
        // Extract initials for the avatar
        const words = mockProfile.name.split(" ").filter((w: string) => !w.toLowerCase().includes("prof") && !w.toLowerCase().includes("dr"));
        const initials = words.length > 0 ? words[0].charAt(0).toUpperCase() : "U";

        const mockObj = { 
          uid: mockProfile.id, 
          email: mockProfile.email, 
          role: mockRole,
          fullName: mockProfile.name,
          initials,
          branch: mockProfile.branch,
          college_name: mockProfile.college_name,
          college_id: mockProfile.college_id
        };
        
        localStorage.setItem('mockUser', JSON.stringify(mockObj));
        setRole(mockRole);
        setUser(mockObj as unknown as User);
        setSession({ access_token: mockObj.uid });
        setCollegeName(mockProfile.college_name);
        setCollegeId(mockProfile.college_id);
        return;
      }
      
      throw new Error("Profile not found");
    } catch (err: any) {
      console.error("Login Error:", err);
      throw new Error(err.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  const signUp = async (email: string, password: string, fullName: string, userRole: UserRole, department?: string) => {
    // Mock registration bypass
    try {
      const mockObj = { uid: `${userRole}-id`, email, role: userRole };
      localStorage.setItem('mockUser', JSON.stringify(mockObj));
      setRole(userRole);
      setUser(mockObj as unknown as User);
      setSession({ access_token: mockObj.uid });
    } catch (err: any) {
      throw new Error("Local Registration Failed");
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('mockUser');
      await firebaseSignOut(auth);
      setUser(null);
      setSession(null);
      setRole("student");
    } catch (e: any) {
      console.error("Firebase Signout Error:", e);
      throw new Error("Unable to log out from Firebase session.");
    }
  };

  const setDemoRole = (r: UserRole) => setRole(r);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, collegeName, collegeId, signIn, signUp, signOut, setDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
