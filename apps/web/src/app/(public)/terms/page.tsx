"use client";

import React from "react";
import Link from "next/link";

import { FileText, Printer, Shield } from "lucide-react";

import { useLegalPolicy } from "@/hooks/use-legal";

import { MarkdownViewer } from "@/components/shared/markdown-viewer";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

const DEFAULT_TERMS_CONTENT = `# Terms of Service for Kurius

Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

Please read these **Terms of Service** ("Terms") carefully before using the Kurius mobile application and website operated by Kurius Platform.

---

## 1. Acceptance of Terms

By accessing or using Kurius, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.

---

## 2. User Accounts & Responsibilities

When you create an account with us, you must provide information that is accurate, complete, and current at all times.

- You are responsible for safeguarding your password or authentication token.
- You must not share your account credentials or allow unauthorized access.
- You must notify us immediately upon becoming aware of any breach of security.

---

## 3. Content Guidelines & Prohibited Conduct

As a creator or viewer on Kurius, you agree **NOT** to upload, publish, or transmit content that:

1. Violates intellectual property, copyright, or trademark rights.
2. Contains hate speech, harassment, defamation, or explicit violence.
3. Distributes malware, spam, phishing links, or unauthorized promotions.
4. Impersonates another person or entity.

> **Note:** Kurius reserves the right to remove any video, comment, or account that violates these community standards without prior notice.

---

## 4. Intellectual Property

The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Kurius Platform and its licensors.

---

## 5. Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.

---

## 6. Contact Information

For inquiries regarding these Terms of Service, reach out to:

- **Email:** legal@kuriusapp.cloud
- **Website:** [https://kuriusapp.cloud](https://kuriusapp.cloud)
`;

export default function TermsPage() {
  const { data: policy, isLoading } = useLegalPolicy("terms");

  const displayTitle = policy?.title || "Terms of Service";
  const displayContent = policy?.content || DEFAULT_TERMS_CONTENT;

  return (
    <div className="w-full max-w-4xl space-y-6 py-6 sm:py-10">
      <Card className="border-border/80 border shadow-lg">
        <CardHeader className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-500 shadow-inner">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {displayTitle}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  Official
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Last updated:{" "}
                <span className="text-foreground font-medium">
                  {policy?.updatedAt
                    ? new Date(policy.updatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })
                    : new Date().toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="gap-1.5 text-xs font-semibold"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>

            <Link href="/privacy">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <Shield className="h-3.5 w-3.5" />
                Privacy Policy
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-10">
          {isLoading ? (
            <div className="space-y-6 py-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : (
            <MarkdownViewer content={displayContent} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
