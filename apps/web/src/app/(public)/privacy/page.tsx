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

const DEFAULT_PRIVACY_CONTENT = `# Privacy Policy for Kurius

Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

Welcome to **Kurius** ("we", "our", or "us"). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner.

---

## 1. Information We Collect

We collect information to provide better services to all our users. The types of information we collect include:

- **Account Information:** When you register, we collect your name, email address, avatar photo, and authentication credentials.
- **Content & Media:** Videos, thumbnails, descriptions, titles, and comments you upload or post on Kurius.
- **Device & Usage Data:** Information about how you interact with our mobile app and website, including views, likes, watch history, and device specifications.
- **Log & Diagnostic Data:** IP address, browser type, operating system, and error reports for service reliability.

---

## 2. How We Use Your Information

We use the information we collect for the following purposes:

1. **Provide and Maintain the Service:** To deliver video streaming, creator tools, account management, and customer support.
2. **Personalization:** To recommend relevant educational and motivational video content tailored to your interests.
3. **Safety and Security:** To detect, investigate, and prevent fraudulent transactions, spam, and abuse.
4. **Communications:** To send you service updates, security alerts, and administrative messages.

---

## 3. Sharing & Disclosure of Information

We do not sell your personal data. We only share information in the following circumstances:

| Recipient | Purpose | Data Shared |
| :--- | :--- | :--- |
| **Cloud Infrastructure** | Secure video hosting & storage | Encrypted media and backups |
| **Authentication Providers** | OAuth sign-in (Google) | Email & profile identifier |
| **Legal Authorities** | Compliance with lawful subpoenas or laws | Minimum required records |

---

## 4. Your Rights and Choices

You have full control over your personal data:

- **Access and Update:** You can edit your profile details and avatar anytime via the Kurius Mobile App.
- **Delete Account:** You may request permanent deletion of your account and all uploaded content.
- **Data Export:** You can request a copy of your stored personal information.

---

## 5. Contact Us

If you have questions or suggestions regarding this Privacy Policy, please contact our Data Protection Officer:

- **Email:** support@kuriusapp.cloud
- **Website:** [https://kuriusapp.cloud](https://kuriusapp.cloud)
`;

export default function PrivacyPage() {
  const { data: policy, isLoading } = useLegalPolicy("privacy");

  const displayTitle = policy?.title || "Privacy Policy";
  const displayContent = policy?.content || DEFAULT_PRIVACY_CONTENT;

  return (
    <div className="w-full max-w-4xl space-y-6 py-6 sm:py-10">
      <Card className="border-border/80 border shadow-lg">
        <CardHeader className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/10 text-primary rounded-xl p-3 shadow-inner">
              <Shield className="h-7 w-7" />
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

            <Link href="/terms">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" />
                Terms of Service
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
