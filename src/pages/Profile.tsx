import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Building, KeyRound, MapPin } from "lucide-react";

export default function Profile() {
  const { user, role, collegeName } = useAuth();
  
  // user might be an any type right now casted to Firebase User in context
  const mockUser: any = user || {};

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto w-full space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm">View your personal identity and assigned network data.</p>
        
        <Card className="border-border/50 shadow-sm mt-6">
          <CardHeader className="flex flex-row items-center gap-6 pb-8 border-b border-border/10 border-dashed">
            <div className="h-24 w-24 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-4xl shadow-md border-4 border-white dark:border-background shrink-0">
              {mockUser.initials || "U"}
            </div>
            <div>
              <CardTitle className="font-display text-3xl mb-1">{mockUser.fullName || mockUser.name || "Loading..."}</CardTitle>
              <CardDescription className="capitalize text-lg font-medium text-primary/80">{role} Account</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-border/30 pb-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-medium">{mockUser.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border-b border-border/30 pb-4">
                  <div className="h-10 w-10 bg-info/10 rounded-full flex items-center justify-center text-info shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Assigned Department / Branch</p>
                    <p className="font-medium">{mockUser.branch || mockUser.department || "Central Administration"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-border/30 pb-4">
                  <div className="h-10 w-10 bg-warning/10 rounded-full flex items-center justify-center text-warning shrink-0">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">College Network</p>
                    <p className="font-medium">{mockUser.college_name || collegeName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-b border-border/30 pb-4">
                  <div className="h-10 w-10 bg-success/10 rounded-full flex items-center justify-center text-success shrink-0">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Account Security Structure</p>
                    <p className="font-medium text-success text-sm hover:underline cursor-pointer">Managed by Active Directory</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
