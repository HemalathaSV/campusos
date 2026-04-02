import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Database, UploadCloud, Users, GraduationCap, Building, LayoutDashboard, DatabaseZap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { generateStudents, facultyList } from "@/data/seedData";

export default function CollegeSetup() {
  const navigate = useNavigate();
  const { setDemoRole } = useAuth();
  const collegeName = localStorage.getItem("activeCollegeName") || "New Institution";
  
  const [loading, setLoading] = useState(false);
  const [studentsUploaded, setStudentsUploaded] = useState(false);
  const [facultyUploaded, setFacultyUploaded] = useState(false);
  const [accreditationUploaded, setAccreditationUploaded] = useState(false);

  const handleUpload = (type: "students" | "faculty" | "accreditation") => {
    // Simulate parsing the CSV file
    toast({ 
      title: `Processing ${type} Database`, 
      description: "Parsing rows and strictly linking all generated profiles to " + collegeName,
      className: "animate-pulse"
    });
    
    setTimeout(() => {
      if (type === "students") setStudentsUploaded(true);
      if (type === "faculty") setFacultyUploaded(true);
      if (type === "accreditation") setAccreditationUploaded(true);
      
      toast({ title: "Upload Successful!", description: `${type} securely stored and isolated.`, className: "border-success text-success" });
    }, 1500);
  };

  const handleDemoGenerate = () => {
    setLoading(true);
    toast({ title: "Initializing Demo Mode", description: `Generating 200 students and 20 faculty for ${collegeName}.`});
    
    setTimeout(() => {
      const activeCollegeId = localStorage.getItem("activeCollegeId") || `college-${Date.now()}`;
      
      const newStudents = generateStudents(collegeName, activeCollegeId);
      const existingStudents = JSON.parse(localStorage.getItem('mock_generated_students') || '[]');
      localStorage.setItem('mock_generated_students', JSON.stringify([...existingStudents, ...newStudents]));

      const newFaculty = facultyList.map(f => ({ ...f, college_name: collegeName, college_id: activeCollegeId }));
      const existingFaculty = JSON.parse(localStorage.getItem('mock_generated_faculty') || '[]');
      localStorage.setItem('mock_generated_faculty', JSON.stringify([...existingFaculty, ...newFaculty]));

      setStudentsUploaded(true);
      setFacultyUploaded(true);
      setAccreditationUploaded(true);
      setLoading(false);
      toast({ title: "Mock Database Linked", description: "Demo records correctly generated.", className: "border-success" });
    }, 1200);
  };

  const handleFinishSetup = () => {
    if (!studentsUploaded || !facultyUploaded || !accreditationUploaded) {
      toast({ title: "Incomplete Setup", description: "Please upload all databases or trigger Demo Generation.", variant: "destructive", className: "animate-shake" });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Force user directly into Admin dashboard upon completion by artificially logging them in
      const adminCred = { uid: "admin-id", email: "admin@gmail.com", role: "admin" };
      localStorage.setItem('mockUser', JSON.stringify(adminCred));
      setDemoRole("admin");
      
      toast({ title: "Setup Complete", description: "Welcome to Campus OS Admin Panel.", className: "border-success" });
      navigate("/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8 pb-16">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
        
        <div className="text-center space-y-2">
          <div className="h-16 w-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4">
            <Building className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">College Setup</h1>
          <p className="text-muted-foreground text-lg">{collegeName} • Workspace Initialization</p>
        </div>

        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50 shadow-sm">
           <span className="text-sm font-medium text-muted-foreground">Demo Setup allows 1-click mock data assignment.</span>
           <Button variant="outline" size="sm" onClick={handleDemoGenerate} disabled={loading} className="gap-2">
              <DatabaseZap className="h-4 w-4 text-warning" />
              Generate Demo Data
           </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all">
            <CardHeader>
              <Users className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Student Database Upload</CardTitle>
              <CardDescription>Format: CSV/Excel (name, email, branch, admission_date)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                 <Input type="file" accept=".csv, .xlsx" />
                 <Button onClick={() => handleUpload("students")} disabled={studentsUploaded} variant={studentsUploaded ? "secondary" : "default"} className="w-full">
                   {studentsUploaded ? <span>Students Provisioned ✔</span> : <span className="flex items-center justify-center"><UploadCloud className="h-4 w-4 mr-2"/> Parse Student File</span>}
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all">
            <CardHeader>
              <GraduationCap className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Faculty Database Upload</CardTitle>
              <CardDescription>Format: CSV/Excel (name, email, department, branch)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                 <Input type="file" accept=".csv, .xlsx" />
                 <Button onClick={() => handleUpload("faculty")} disabled={facultyUploaded} variant={facultyUploaded ? "secondary" : "default"} className="w-full">
                   {facultyUploaded ? <span>Faculty Provisioned ✔</span> : <span className="flex items-center justify-center"><UploadCloud className="h-4 w-4 mr-2"/> Parse Faculty File</span>}
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-lg border-border/50 hover:shadow-xl transition-all">
            <CardHeader>
              <Database className="h-6 w-6 text-primary mb-2" />
              <CardTitle>Accreditation & Vision Documents</CardTitle>
              <CardDescription>UGC Approval, NBA Accreditation certificates and College Vision.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>UGC Approval Document (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="space-y-2">
                  <Label>NBA Accreditation Document (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>College Vision & Mission</Label>
                  <Textarea placeholder="Enter your institution's core vision statement..." className="resize-none" rows={3}></Textarea>
                </div>
              </div>
              <Button onClick={() => handleUpload("accreditation")} disabled={accreditationUploaded} variant={accreditationUploaded ? "secondary" : "default"} className="w-full">
                   {accreditationUploaded ? <span>Accreditation Setup Complete ✔</span> : <span className="flex items-center justify-center"><UploadCloud className="h-4 w-4 mr-2"/> Save Documents & Vision</span>}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-6">
           <Button onClick={handleFinishSetup} disabled={loading} size="lg" className="gradient-primary border-0 font-medium px-12 h-14 text-lg animate-in slide-in-from-bottom-2 fade-in">
              <LayoutDashboard className="h-5 w-5 mr-2" /> Launch Campus OS Dashboard
           </Button>
        </div>

      </div>
    </div>
  );
}
