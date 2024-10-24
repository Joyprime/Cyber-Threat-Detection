import { Shield, Mail, Key, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import EmailAnalyzer from "@/components/email-analyzer";
import BruteForceDetector from "@/components/brute-force-detector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Cyber Threat Detection</h1>
              <p className="text-muted-foreground">Advanced security analysis tools</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-400" />
                Email Analysis
              </CardTitle>
              <CardDescription>
                Detect phishing attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">98%</div>
              <p className="text-sm text-muted-foreground">Detection accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-red-400" />
                Brute Force Detection
              </CardTitle>
              <CardDescription>
                Login attempt analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">100+</div>
              <p className="text-sm text-muted-foreground">Threats blocked today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" />
                System Status
              </CardTitle>
              <CardDescription>
                Real-time monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Active</div>
              <p className="text-sm text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList>
            <TabsTrigger value="email" className="data-[state=active]:bg-primary">
              Email Analysis
            </TabsTrigger>
            <TabsTrigger value="bruteforce" className="data-[state=active]:bg-primary">
              Brute Force Detection
            </TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            <EmailAnalyzer />
          </TabsContent>
          <TabsContent value="bruteforce">
            <BruteForceDetector />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}