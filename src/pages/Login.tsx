import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShieldCheck, Users, GraduationCap, Building2, ClipboardList } from "lucide-react";

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeCollegeName, setActiveCollegeName] = useState(localStorage.getItem('activeCollegeName') || "MIT College");
  
  const location = useLocation();
  const prefilledEmail = location.state?.registeredEmail || "mit@college.edu";
  const prefilledPassword = location.state?.registeredPassword || "password";

  // Step 1: College credentials
  const [collegeEmail, setCollegeEmail] = useState(prefilledEmail);
  const [collegePassword, setCollegePassword] = useState(prefilledPassword);

  // Step 2: Role credentials
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("admin");

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleCollegeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existingColleges = JSON.parse(localStorage.getItem('registeredColleges') || '[]');
    
    // Explicit bypass for the pre-trained MIT dataset
    if (collegeEmail === "mit@college.edu" && (collegePassword === "password" || collegePassword === "mit@123")) {
      setActiveCollegeName("MIT College");
      localStorage.setItem("activeCollegeName", "MIT College");
      localStorage.setItem("activeCollegeId", "mit-college-id");
      toast({ title: "College Authenticated", description: "Successfully connected to MIT network." });
      setStep(2);
      return;
    }

    const foundCollege = existingColleges.find((c: any) => c.email === collegeEmail && c.password === collegePassword);
    
    if (foundCollege) {
      setActiveCollegeName(foundCollege.collegeName);
      localStorage.setItem("activeCollegeName", foundCollege.collegeName);
      localStorage.setItem("activeCollegeId", foundCollege.collegeId);
      toast({ title: "College Authenticated", description: `Successfully connected to ${foundCollege.collegeName}.` });
      setStep(2);
    } else {
      toast({ title: "Authentication Failed", description: "Invalid college credentials.", variant: "destructive" });
    }
  };

  const handleRoleChange = (role: string) => {
    if (role === "admission") {
      navigate("/admissions/apply");
      return;
    }
    setActiveRole(role);
    
    // Set intuitive defaults based on the user's prompt
    if (role === "admin") {
      setEmail("admin@gmail.com");
      setPassword("admin123");
    }
    else if (role === "faculty") {
      setEmail("ranjith.kc@gmail.com");
      setPassword("faculty123");
    }
    else if (role === "student") {
      setEmail("aarav1@gmail.com");
      setPassword("student123");
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password, activeRole as any);
      toast({ title: "Welcome back!", description: "Redirecting to dashboard..." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate("/dashboard");
    toast({ title: "Demo Mode", description: "Logged in as Admin (demo)" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">CO</div>
            <span className="font-display font-bold text-2xl">Campus OS</span>
          </Link>
        </div>

        {step === 1 ? (
          <Card className="shadow-xl border-border/50 max-w-md mx-auto">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-2xl">College Login</CardTitle>
              <CardDescription>Authenticate your institution to proceed</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCollegeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collegeEmail">College Email</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="collegeEmail" type="email" autoComplete="off" placeholder="college@domain.edu" className="pl-9" value={collegeEmail} onChange={e => setCollegeEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collegePassword">Password</Label>
                  <div className="relative">
                    <Input id="collegePassword" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={collegePassword} onChange={e => setCollegePassword(e.target.value)} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary border-0 mt-6">
                  Verify College Network
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-2">
              <Badge className="w-max mx-auto mb-2 bg-primary/10 text-primary hover:bg-primary/20">{activeCollegeName}</Badge>
              <CardTitle className="font-display text-2xl">User Login</CardTitle>
              <CardDescription>Sign in with your role credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="admin" value={activeRole} className="w-full mb-6" onValueChange={handleRoleChange}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="admin" className="text-xs px-1"><ShieldCheck className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Admin</span></TabsTrigger>
                  <TabsTrigger value="faculty" className="text-xs px-1"><Users className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Faculty</span></TabsTrigger>
                  <TabsTrigger value="student" className="text-xs px-1"><GraduationCap className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Student</span></TabsTrigger>
                  <TabsTrigger value="admission" className="text-xs px-1"><ClipboardList className="h-3 w-3 sm:mr-1 sm:h-4 sm:w-4 text-primary" /> <span className="hidden sm:inline text-primary min-w-[max-content]">Admissions</span></TabsTrigger>
                </TabsList>
              </Tabs>

              <form onSubmit={handleRoleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{activeRole === "admin" ? "Admin Email" : activeRole === "faculty" ? "Faculty Email" : "Student Email"}</Label>
                  <Input id="email" type="email" placeholder="name@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-0 h-full" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                </div>
                <Button type="submit" className="w-full gradient-primary border-0" disabled={loading}>
                  {loading ? "Signing in..." : `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="outline" className="w-2/3" onClick={handleDemoLogin}>
                  Enter Demo Mode
                </Button>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
