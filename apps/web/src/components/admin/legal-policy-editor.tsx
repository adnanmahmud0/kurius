"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  Bold,
  Code,
  Columns2,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Maximize2,
  Minus,
  Quote,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Strikethrough,
  Table as TableIcon
} from "lucide-react";
import { toast } from "sonner";

import { useLegalPolicy, useUpdateLegalPolicy } from "@/hooks/use-legal";

import { MarkdownViewer } from "@/components/shared/markdown-viewer";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip";

interface LegalPolicyEditorProps {
  type: "privacy" | "terms";
}

const DEFAULT_PRIVACY_TEMPLATE = `# Privacy Policy for Kurius

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

const DEFAULT_TERMS_TEMPLATE = `# Terms of Service for Kurius

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

export function LegalPolicyEditor({ type }: LegalPolicyEditorProps) {
  const { data: policy, isLoading } = useLegalPolicy(type);
  const updateMutation = useUpdateLegalPolicy(type);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (policy) {
      setTitle(policy.title || (type === "privacy" ? "Privacy Policy" : "Terms of Service"));
      setContent(
        policy.content || (type === "privacy" ? DEFAULT_PRIVACY_TEMPLATE : DEFAULT_TERMS_TEMPLATE)
      );
    }
  }, [policy, type]);

  // Insert markdown format helpers around text selection
  const insertFormatting = (prefix: string, suffix = "", defaultText = "text") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultText;

    const newText =
      currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Item 1 | Value A | Detail X |\n| Item 2 | Value B | Detail Y |\n\n`;
    insertFormatting(tableTemplate, "", "");
  };

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://kuriusapp.cloud");
    if (url) {
      insertFormatting("[", `](${url})`, "Link Title");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      toast.error("Policy content cannot be empty.");
      return;
    }

    await updateMutation.mutateAsync({
      title: title.trim() || (type === "privacy" ? "Privacy Policy" : "Terms of Service"),
      content: content.trim()
    });
  };

  const isPrivacy = type === "privacy";
  const publicUrl = isPrivacy ? "/privacy" : "/terms";

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  if (isLoading) {
    return (
      <Card className="border-border/80 mx-auto max-w-6xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header Card */}
        <Card className="border-border/80 border shadow-xs">
          <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`rounded-xl p-3 shadow-inner ${
                  isPrivacy ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {isPrivacy ? <Shield className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold">
                    Edit {isPrivacy ? "Privacy Policy" : "Terms of Service"}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs font-semibold uppercase">
                    Public Legal Page
                  </Badge>
                </div>
                <CardDescription className="text-muted-foreground mt-1 text-xs">
                  Changes made here are instantly reflected on the live public URL:{" "}
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-medium underline"
                  >
                    {publicUrl}
                  </a>
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Live Page
                </Button>
              </a>

              <Button
                onClick={() => handleSave()}
                disabled={updateMutation.isPending || !content.trim()}
                className="gap-2 font-semibold shadow-xs"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save & Publish
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Editor Main Card */}
        <Card className="border-border/80 overflow-hidden border shadow-sm">
          {/* Document Title Input */}
          <div className="border-border/60 bg-muted/20 border-b p-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="policy-title"
                  className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
                >
                  Document Header Title
                </Label>
                <Input
                  id="policy-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isPrivacy ? "Privacy Policy" : "Terms of Service"}
                  className="bg-background text-base font-semibold"
                />
              </div>

              {/* View Mode Switcher */}
              <div className="border-border/80 bg-background flex items-center gap-1 self-end rounded-lg border p-1 sm:self-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "split" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("split")}
                      className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                    >
                      <Columns2 className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Split View</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Side-by-side Editor & Live Preview</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "editor" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("editor")}
                      className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                    >
                      <FileCode2 className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Editor Only</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Full Width Markdown Editor</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "preview" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("preview")}
                      className="h-8 gap-1.5 px-2.5 text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden md:inline">Live Preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Full Width Rendered Output</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Interactive Formatting Toolbar */}
          <div className="border-border/60 bg-muted/40 flex flex-wrap items-center gap-1 border-b p-2 sm:px-4">
            <div className="border-border/70 flex items-center gap-0.5 border-r pr-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("# ", "", "Main Heading")}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 1 (#)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("## ", "", "Section Heading")}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 2 (##)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("### ", "", "Subheading")}
                  >
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 3 (###)</TooltipContent>
              </Tooltip>
            </div>

            <div className="border-border/70 flex items-center gap-0.5 border-r pr-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("**", "**", "bold text")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (**text**)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("*", "*", "italic text")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (*text*)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("~~", "~~", "strikethrough text")}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Strikethrough (~~text~~)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("`", "`", "inline code")}
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Inline Code (`code`)</TooltipContent>
              </Tooltip>
            </div>

            <div className="border-border/70 flex items-center gap-0.5 border-r pr-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("- ", "", "Bullet item")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List (- item)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("1. ", "", "Numbered item")}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List (1. item)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("> ", "", "Important quote or callout")}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote Block (&gt; text)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => insertFormatting("\n---\n\n", "", "")}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Horizontal Divider (---)</TooltipContent>
              </Tooltip>
            </div>

            <div className="border-border/70 flex items-center gap-0.5 border-r pr-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={insertLink}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Hyperlink</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={insertTable}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Data Table</TooltipContent>
              </Tooltip>
            </div>

            {/* Quick Templates */}
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[11px]"
                onClick={() => {
                  if (confirm("Replace current text with the standard template?")) {
                    setContent(isPrivacy ? DEFAULT_PRIVACY_TEMPLATE : DEFAULT_TERMS_TEMPLATE);
                  }
                }}
              >
                <Sparkles className="text-primary h-3 w-3" />
                Reset Template
              </Button>
            </div>
          </div>

          {/* Editor Workspace */}
          <div className="relative">
            {viewMode === "split" && (
              <div className="divide-border grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
                {/* Left: Raw Markdown Editor */}
                <div className="flex flex-col">
                  <div className="bg-muted/10 border-border/40 text-muted-foreground flex items-center justify-between border-b px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                    <span>Markdown Source</span>
                    <span>{wordCount} words</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write policy content using Markdown formatting..."
                    rows={22}
                    className="bg-background text-foreground min-h-[500px] w-full resize-none border-0 p-5 font-mono text-sm leading-relaxed outline-none focus-visible:ring-0"
                    required
                  />
                </div>

                {/* Right: Real-time Live Rendered Preview */}
                <div className="bg-muted/5 flex max-h-[600px] flex-col overflow-y-auto">
                  <div className="bg-muted/10 border-border/40 text-muted-foreground sticky top-0 flex items-center justify-between border-b px-4 py-1.5 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md">
                    <span>Live Output Preview</span>
                    <Badge variant="secondary" className="py-0 text-[10px]">
                      Realtime
                    </Badge>
                  </div>
                  <div className="p-6">
                    <MarkdownViewer content={content} />
                  </div>
                </div>
              </div>
            )}

            {viewMode === "editor" && (
              <div className="flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write policy content using Markdown formatting..."
                  rows={24}
                  className="bg-background text-foreground min-h-[550px] w-full resize-none border-0 p-6 font-mono text-sm leading-relaxed outline-none focus-visible:ring-0"
                  required
                />
              </div>
            )}

            {viewMode === "preview" && (
              <div className="mx-auto min-h-[550px] max-w-4xl p-8">
                <MarkdownViewer content={content} />
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="border-border/60 bg-muted/20 text-muted-foreground flex flex-wrap items-center justify-between gap-4 border-t px-6 py-3 text-xs">
            <div className="flex items-center gap-4">
              <span>
                <strong>{wordCount}</strong> words
              </span>
              <span>
                <strong>{charCount}</strong> characters
              </span>
              {policy?.updatedAt && (
                <span className="hidden sm:inline">
                  Last saved:{" "}
                  <strong className="text-foreground">
                    {new Date(policy.updatedAt).toLocaleString()}
                  </strong>
                </span>
              )}
            </div>

            <Button
              type="button"
              onClick={() => handleSave()}
              disabled={updateMutation.isPending || !content.trim()}
              size="sm"
              className="gap-2 font-semibold shadow-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save & Publish Live
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}
