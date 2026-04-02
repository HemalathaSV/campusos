import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

export default function Signup() {
  const [collegeName, setCollegeName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    // Save to local storage mock DB
    const existingColleges = JSON.parse(localStorage.getItem('registeredColleges') || '[]');
    const collegeId = `college-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    existingColleges.push({ collegeId, collegeName, email, password, setupCompleted: false });
    localStorage.setItem('registeredColleges', JSON.stringify(existingColleges));

    localStorage.setItem('activeCollegeName', collegeName);
    localStorage.setItem('activeCollegeId', collegeId);

    // Simulate API registration delay
    setTimeout(() => {
      toast({ title: "Workspace Generated", description: `Setting up database for ${collegeName}.` });
      setLoading(false);
      navigate("/setup");
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">CO</div>
            <span className="font-display font-bold text-2xl">Campus OS</span>
          </Link>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Register College</CardTitle>
            <CardDescription>Create a new instance on Campus OS</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>College Name</Label>
                <Input placeholder="E.g., Campus College" value={collegeName} onChange={e => setCollegeName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>College Email</Label>
                <Input type="email" autoComplete="off" placeholder="college@domain.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label>College Password</Label>
                <Input type="password" autoComplete="new-password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              
              <Button type="submit" className="w-full gradient-primary border-0 mt-6" disabled={loading}>
                {loading ? "Registering..." : `Register College`}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
