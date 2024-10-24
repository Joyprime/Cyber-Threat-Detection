"use client";

import { useState } from "react";
import { Mail, AlertTriangle, CheckCircle, Trash2, Link, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmailCriteria } from "@/components/email-criteria";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function EmailAnalyzer() {
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<null | { safe: boolean; confidence: number; reasons: string[]; matches: string[] }>(null);
  const [loading, setLoading] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  const analyzeEmail = () => {
    const indicators = {
      urgency: {
        pattern: /\b(urgent|immediate|asap|act now|limited time|expires?|deadline)\b/i,
        weight: 0.25,
        message: "Contains urgency indicators"
      },
      badGrammar: {
        pattern: /([A-Z]{5,}|!{2,}|\d+\s*%\s*off|\$\s*\d+\s*prize)/i,
        weight: 0.2,
        message: "Contains suspicious formatting or promotional content"
      },
      sensitiveInfo: {
        pattern: /\b(password|verify|account|ssn|social security|credit card|bank|login)\b/i,
        weight: 0.3,
        message: "Requests sensitive information"
      },
      genericGreeting: {
        pattern: /\b(dear\s+(sir|madam|user|customer|valued\s+customer|account\s+holder))\b/i,
        weight: 0.15,
        message: "Uses generic greeting"
      },
      suspiciousLinks: {
        pattern: /(click\s+here|verify\s+now|login\s+to|sign\s+in\s+at|update\s+your)/i,
        weight: 0.25,
        message: "Contains suspicious call-to-action phrases"
      },
      threatLanguage: {
        pattern: /\b(suspend|disable|verify|cancel|terminate|locked|restricted)\b.*\b(account|access)\b/i,
        weight: 0.3,
        message: "Contains threatening language about account status"
      }
    };

    let totalWeight = 0;
    let weightedMatches = 0;
    const reasons = [];
    const matches = [];

    for (const [key, indicator] of Object.entries(indicators)) {
      if (indicator.pattern.test(email)) {
        weightedMatches += indicator.weight;
        reasons.push(indicator.message);
        const match = email.match(indicator.pattern)?.[0];
        if (match) {
          matches.push(`"${match}" - ${indicator.message}`);
        }
      }
      totalWeight += indicator.weight;
    }

    const confidence = (weightedMatches / totalWeight) * 100;
    
    // Additional checks for legitimate patterns
    const legitimatePatterns = {
      properFormatting: /^[A-Z][^!?]{10,}\./m,
      personalizedGreeting: /\b(hi|hello|dear)\s+[A-Z][a-z]+\b/i,
      businessSignature: /regards,?\s+[A-Z][a-z]+|sincerely,?\s+[A-Z][a-z]+/i
    };

    let legitimateScore = 0;
    for (const pattern of Object.values(legitimatePatterns)) {
      if (pattern.test(email)) {
        legitimateScore += 0.2;
      }
    }

    // Adjust confidence based on legitimate patterns
    const adjustedConfidence = Math.max(0, Math.min(100, confidence - (legitimateScore * 25)));

    setResult({
      safe: adjustedConfidence < 40,
      confidence: adjustedConfidence,
      reasons: reasons.length ? reasons : ["No suspicious patterns detected"],
      matches: matches
    });
  };

  const fetchFromUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const text = await response.text();
      setEmail(text);
    } catch (error) {
      console.error("Failed to fetch email content:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setEmail("");
    setUrl("");
    setResult(null);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Collapsible open={showCriteria} onOpenChange={setShowCriteria}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Phishing Detection Criteria
            </h3>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {showCriteria ? "Hide" : "Show"} criteria
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <EmailCriteria />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          <Input
            placeholder="Enter email URL..."
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
          <label className="text-sm font-medium">Email Content</label>
          <Textarea
            placeholder="Paste email content here..."
            className="h-[200px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={analyzeEmail}
            className="flex-1"
            disabled={!email.trim()}
          >
            <Mail className="mr-2 h-4 w-4" />
            Analyze Email
          </Button>
          
          <Button
            onClick={clearAll}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {result && (
          <div className="mt-4 space-y-4">
            <div className={`flex items-center gap-2 text-lg font-semibold ${
              result.safe ? "text-green-400" : "text-red-400"
            }`}>
              {result.safe ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              {result.safe ? "Likely Safe" : "Potential Threat"}
              <span className="text-sm text-muted-foreground ml-2">
                ({Math.round(result.confidence)}% threat confidence)
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Analysis Results:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{reason}</li>
                ))}
              </ul>
            </div>
            {result.matches.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Detected Patterns:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.matches.map((match, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{match}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}