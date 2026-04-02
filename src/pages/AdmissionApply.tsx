import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select as CustomSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { branches } from "@/data/seedData";
import { GraduationCap, ArrowLeft, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdmissionApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [formData, setFormData] = useState({ 
    name: "", email: "", branchPreference: "", entranceExam: "", rank: "" 
  });
  const [loading, setLoading] = useState(false);
  const [allocatedBranch, setAllocatedBranch] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");

  const requiredDocuments = [
    "10th Marks Card",
    "12th Marks Card",
    "Rank Card",
    "Transfer Certificate",
    "Aadhaar Card",
    "4 Photo",
    "Migration Certificate",
    "Allotment Letter",
    "Caste Certificate",
    "Income Certificate",
    "Study Certificate"
  ];

  const determineBranch = (exam: string, rankNum: number) => {
    if (!exam || !rankNum || rankNum <= 0) return null;
    if (exam === "CET") {
      if (rankNum <= 1000) return "Computer Science";
      if (rankNum <= 3000) return "Electronics";
      if (rankNum <= 6000) return "Mechanical";
      return "Civil";
    } else if (exam === "COMEDK") {
      if (rankNum <= 500) return "Computer Science";
      if (rankNum <= 1500) return "Electronics";
      if (rankNum <= 3000) return "Mechanical";
      return "Civil";
    }
    return null;
  };

  const getFee = (branch: string | null) => {
    switch(branch) {
      case "Computer Science": return "₹1,50,000 / year";
      case "Electronics": return "₹1,20,000 / year";
      case "Mechanical": return "₹90,000 / year";
      case "Civil": return "₹70,000 / year";
      default: return "";
    }
  };

  const rankNum = parseInt(formData.rank) || 0;
  const predictedBranch = determineBranch(formData.entranceExam, rankNum);
  const feeInfo = getFee(predictedBranch);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.entranceExam) {
      toast({ title: "Exam Required", description: "Please select an entrance exam (CET/COMEDK).", variant: "destructive" });
      return;
    }
    if (!formData.rank) {
      toast({ title: "Rank Missing", description: "Please enter your valid entrance exam rank.", variant: "destructive" });
      return;
    }
    const rankNum = parseInt(formData.rank);
    if (isNaN(rankNum) || rankNum <= 0) {
      toast({ title: "Invalid Input", description: "Please enter a valid numeric rank.", variant: "destructive" });
      return;
    }
    if (!formData.name || !formData.email) {
      toast({ title: "Incomplete Form", description: "Please fill in your name and email.", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    
    setTimeout(() => {
      const allocated = determineBranch(formData.entranceExam, rankNum) || "Undeclared";
      const today = new Date().toISOString().split("T")[0];
      setAllocatedBranch(allocated);
      setAdmissionDate(today);

      const existingDb = localStorage.getItem("mock_applications_v2");
      const apps = existingDb ? JSON.parse(existingDb) : [];
      
      const newApp = {
        id: `app-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: "+91 9999999999", // Mock fallback for unused field
        branch: allocated, 
        allocatedBranch: allocated,
        branchPreference: formData.branchPreference || allocated,
        entranceExam: formData.entranceExam,
        rank: rankNum,
        amount: parseInt(getFee(allocated).replace(/\D/g, '') || "0"),
        status: "pending",
        payment: "no_payment",
        date: today,
        user_id: `u-${Date.now()}`,
        collegeName: localStorage.getItem("activeCollegeName") || "MIT College",
        college_id: localStorage.getItem("activeCollegeId") || "mit-college-id"
      };
      
      apps.unshift(newApp);
      localStorage.setItem("mock_applications_v2", JSON.stringify(apps));
      
      setLoading(false);
      setStep("success");
      
      // Specifying the exact wording the user requested
      toast({ 
        description: "Application submitted successfully. Please visit the college for document verification,payment.", 
        className: "border-green-600 bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-50 border-2 font-medium shadow-lg" 
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {step === "form" && (
          <Card className="shadow-xl animate-fade-in border-border/50">
            <CardHeader className="text-center">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="font-display text-2xl">Admission Application</CardTitle>
              <CardDescription>Fill out your details and academic records to apply.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b py-4 my-2">
                  <div className="space-y-2">
                    <Label>Entrance Exam</Label>
                    <select 
                      value={formData.entranceExam} 
                      onChange={e => setFormData({ ...formData, entranceExam: e.target.value, rank: "" })}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select Exam</option>
                      <option value="CET">CET</option>
                      <option value="COMEDK">COMEDK</option>
                    </select>
                  </div>
                  <div className="space-y-2 relative">
                    <Label>Exam Rank</Label>
                    <Input 
                      type="number" 
                      min="1"
                      placeholder="Enter Rank" 
                      value={formData.rank} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || /^\d+$/.test(val)) {
                          setFormData({...formData, rank: val});
                        }
                      }} 
                    />
                  </div>
                </div>

                {/* Display branch layout details dynamically after entering entrance metrics */}
                <div className={`${predictedBranch ? 'block animate-in fade-in slide-in-from-top-1' : 'hidden'} bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2`}>
                   <p className="text-sm font-medium text-foreground">
                      Allocated Branch: <span className="font-bold text-primary">{predictedBranch}</span>
                   </p>
                   <p className="text-sm font-medium text-foreground">
                      Applicable Fee: <span className="font-bold text-primary">{feeInfo}</span>
                   </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Label>Branch Preference (Optional)</Label>
                  <select 
                    value={formData.branchPreference} 
                    onChange={e => setFormData({ ...formData, branchPreference: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select preferred branch</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                  <p className="text-xs text-muted-foreground italic">Note: Final branch allocation is based on Entrance Rank parameters.</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Label>Required Documents Checklist</Label>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 bg-muted/30 p-4 rounded-lg border">
                    {requiredDocuments.map((doc) => (
                      <li key={doc} className="leading-relaxed">{doc}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Please ensure all the above documents are carried during your offline verification process.
                  </p>
                </div>

                <Button type="submit" className="w-full gradient-primary border-0 mt-6" disabled={loading || !formData.rank || !formData.entranceExam}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card className="shadow-xl animate-fade-in text-center border-border/50">
            <CardContent className="py-12 space-y-4">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <GraduationCap className="h-10 w-10 text-success" />
              </div>
              <h2 className="font-display text-2xl font-bold">Registration Successful! 🎉</h2>
              <p className="text-muted-foreground">Welcome! Your application to <span className="font-medium text-foreground">{allocatedBranch}</span> is strictly submitted and pending Admin approval.</p>
              <div className="border rounded-lg p-4 text-sm text-left space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{formData.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium text-primary">{formData.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Admission Date</span><span>{admissionDate}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Allocated Branch</span><span className="font-bold text-foreground">{allocatedBranch}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Applicable Fee</span><span className="font-bold text-foreground">{getFee(allocatedBranch)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-bold text-info">Ready For Approval</span></div>
              </div>
              <Button asChild className="gradient-primary border-0 w-full mt-4"><Link to="/login">Go to Login</Link></Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
