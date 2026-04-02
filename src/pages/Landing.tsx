import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap, IndianRupee, CalendarCheck, FileText, Brain, Workflow,
  ArrowRight, CheckCircle, Users, BarChart3
} from "lucide-react";

const features = [
  { icon: GraduationCap, title: "Smart Admissions", desc: "End-to-end online admission with payment integration" },
  { icon: IndianRupee, title: "Fee Management", desc: "Track fees, generate receipts, Razorpay integration" },
  { icon: CalendarCheck, title: "Attendance Tracking", desc: "Digital attendance with auto percentage calculation" },
  { icon: FileText, title: "Reports & Analytics", desc: "Generate student, fee, and attendance reports" },
  { icon: Brain, title: "AI Insights", desc: "Predict dropouts, identify fee defaulters" },
  { icon: Workflow, title: "Automation", desc: "Automated alerts for low attendance and pending fees" },
];

const branchesOffered = [
  { name: "Computer Science", seats: 60, code: "CS" },
  { name: "Mechanical Engineering", seats: 60, code: "ME" },
  { name: "Electronics & Communication", seats: 40, code: "ECE" },
  { name: "Civil Engineering", seats: 40, code: "CE" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">CO</div>
            <span className="font-display font-bold text-xl">Campus OS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#branches" className="hover:text-foreground transition-colors">Branches</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
            <Button asChild className="gradient-primary border-0"><Link to="/signup">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Brain className="h-4 w-4" /> AI-Powered College Management
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Modern ERP for{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Smart Colleges
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Manage admissions, fees, attendance, and reports with AI-powered insights.
            Built for Tier-2 and Tier-3 colleges in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="gradient-primary border-0 text-base px-8">
              <Link to="/signup">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> 200+ Students</div>
            <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /> Real-time Analytics</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-success" /> 99.9% Uptime</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete ERP solution designed specifically for Indian engineering colleges
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section id="branches" className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-4">Branches Offered</h2>
            <p className="text-muted-foreground">Four core engineering branches with dedicated management</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {branchesOffered.map((b) => (
              <Card key={b.code} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                    {b.code}
                  </div>
                  <h3 className="font-display font-semibold mb-2">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">{b.seats} Seats</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold mb-6">About Campus OS</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Campus OS is an AI-powered college management system designed for Tier-2 and Tier-3
            engineering colleges in India. It streamlines admissions, fee collection, attendance
            tracking, and report generation — all in one modern, easy-to-use platform.
          </p>
          <Button size="lg" asChild className="gradient-primary border-0">
            <Link to="/signup">Start Managing Your College <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">CO</div>
            <span className="font-display font-semibold">Campus OS</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Campus OS. Built with ❤️ for Indian Colleges.</p>
        </div>
      </footer>
    </div>
  );
}
