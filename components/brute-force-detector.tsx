"use client";

import { useState } from "react";
import { Shield, AlertTriangle, Trash2, Link, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { BruteForceCriteria } from "@/components/brute-force-criteria";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LogAnalysis {
  attempts: number;
  uniqueIPs: string[];
  timeWindow: number;
  threatLevel: "Low" | "Medium" | "High";
  details: string[];
  patterns: {
    description: string;
    severity: "low" | "medium" | "high";
  }[];
}

export default function BruteForceDetector() {
  const [logs, setLogs] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  const analyzeLogs = () => {
    const logLines = logs.split("\n").filter(line => line.trim());
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
    const timePattern = /\b\d{2}:\d{2}:\d{2}\b/;
    const userPattern = /user[:\s]+(\S+)/i;
    
    const ips = new Set<string>();
    const times: Date[] = [];
    const details: string[] = [];
    const users = new Set<string>();
    const ipAttempts = new Map<string, number>();
    const patterns: LogAnalysis["patterns"] = [];

    logLines.forEach(line => {
      const ip = line.match(ipPattern)?.[0];
      const time = line.match(timePattern)?.[0];
      const user = line.match(userPattern)?.[1];
      
      if (ip) {
        ips.add(ip);
        ipAttempts.set(ip, (ipAttempts.get(ip) || 0) + 1);
      }
      if (time) times.push(new Date(`1970-01-01T${time}`));
      if (user) users.add(user);
      
      if (line.includes("Failed login")) {
        details.push(`Failed login attempt from ${ip || "unknown IP"}${user ? ` for user ${user}` : ''}`);
      }
    });

    // Calculate time window in seconds
    const timeWindow = times.length >= 2 
      ? (Math.max(...times.map(t => t.getTime())) - Math.min(...times.map(t => t.getTime()))) / 1000
      : 0;

    // Analyze patterns
    if (timeWindow > 0) {
      const attemptsPerSecond = logLines.length / timeWindow;
      if (attemptsPerSecond > 1) {
        patterns.push({
          description: `High frequency: ${attemptsPerSecond.toFixed(2)} attempts/second`,
          severity: "high"
        });
      }
    }

    if (users.size === 1 && logLines.length > 10) {
      patterns.push({
        description: "Single user targeting detected",
        severity: "high"
      });
    }

    const maxAttemptsPerIP = Math.max(...Array.from(ipAttempts.values()));
    if (maxAttemptsPerIP > 10) {
      patterns.push({
        description: `Concentrated attacks: ${maxAttemptsPerIP} attempts from single IP`,
        severity: "high"
      });
    }

    if (times.length >= 2) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i].getTime() - times[i-1].getTime());
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const isConsistent = intervals.every(i => Math.abs(i - avgInterval) < 100);
      
      if (isConsistent && intervals.length > 5) {
        patterns.push({
          description: "Consistent timing suggests automated attack",
          severity: "high"
        });
      }
    }

    // Determine threat level
    let threatLevel: "Low" | "Medium" | "High" = "Low";
    const highSeverityPatterns = patterns.filter(p => p.severity === "high").length;
    
    if (highSeverityPatterns > 0 || logLines.length > 50 || ips.size > 10) {
      threatLevel = "High";
    } else if (logLines.length > 20 || ips.size > 5) {
      threatLevel = "Medium";
    }

    setAnalysis({
      attempts: logLines.length,
      uniqueIPs: Array.from(ips),
      timeWindow,
      threatLevel,
      details: details.slice(0, 5),
      patterns
    });
  };

  const fetchFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const text = await response.text();
      setLogs(text);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setLogs("");
    setUrl("");
    setAnalysis(null);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "High": return "text-red-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Collapsible open={showCriteria} onOpenChange={setShowCriteria}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Brute Force Detection Criteria
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {showCriteria ? "Hide" : "Show"} criteria
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <BruteForceCriteria />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          <Input
            placeholder="Enter logs URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={fetchFromUrl}
            className="shrink-0"
            disabled={!url.trim() || loading}
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Authentication Logs</label>
          <Textarea
            placeholder="Paste authentication logs here..."
            className="h-[200px]"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={analyzeLogs}
            className="flex-1"
            disabled={!logs.trim()}
          >
            <Shield className="mr-2 h-4 w-4" />
            Analyze Logs
          </Button>

          <Button
            onClick={clearAll}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className={getThreatColor(analysis.threatLevel)} />
                <span className={`font-semibold ${getThreatColor(analysis.threatLevel)}`}>
                  {analysis.threatLevel} Threat Level
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {analysis.attempts} attempts detected
              </span>
            </div>

            <Progress 
              value={
                analysis.threatLevel === "High" ? 100 :
                analysis.threatLevel === "Medium" ? 50 : 25
              }
              className="h-2"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Unique IPs</label>
                <p className="font-mono text-sm">{analysis.uniqueIPs.length}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Time Window</label>
                <p className="font-mono text-sm">{analysis.timeWindow.toFixed(1)}s</p>
              </div>
            </div>

            {analysis.patterns.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Detected Patterns:</h3>
                <ul className="space-y-1">
                  {analysis.patterns.map((pattern, index) => (
                    <li 
                      key={index}
                      className={`text-sm ${
                        pattern.severity === "high" 
                          ? "text-red-400" 
                          : pattern.severity === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {pattern.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Recent Events:</h3>
              <ul className="space-y-1">
                {analysis.details.map((detail, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}