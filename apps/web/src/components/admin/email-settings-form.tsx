"use client";

import React, { useEffect, useState } from "react";

import {
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  Send,
  Server,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

import {
  useEmailSettings,
  useTestEmailSettings,
  useUpdateEmailSettings
} from "@/hooks/use-email-settings";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";

export function EmailSettingsForm() {
  const { data: setting, isLoading } = useEmailSettings();
  const updateMutation = useUpdateEmailSettings();
  const testMutation = useTestEmailSettings();

  const [provider, setProvider] = useState<"smtp" | "resend">("smtp");
  const [host, setHost] = useState("smtp.resend.com");
  const [port, setPort] = useState("587");
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("resend");
  const [pass, setPass] = useState("");
  const [fromEmail, setFromEmail] = useState("no-reply@kurius.cloud");
  const [fromName, setFromName] = useState("Kurius");

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState("");

  useEffect(() => {
    if (setting) {
      setProvider((setting.provider as "smtp" | "resend") || "smtp");
      setHost(setting.host || "smtp.resend.com");
      setPort(String(setting.port || 587));
      setSecure(Boolean(setting.secure));
      setUser(setting.user || "resend");
      setFromEmail(setting.fromEmail || "no-reply@kurius.cloud");
      setFromName(setting.fromName || "Kurius");
    }
  }, [setting]);

  const applyResendPreset = () => {
    setProvider("resend");
    setHost("smtp.resend.com");
    setPort("587");
    setSecure(false);
    setUser("resend");
    if (!fromEmail || fromEmail.includes("gmail.com")) {
      setFromEmail("no-reply@kurius.cloud");
    }
    toast.info("Resend SMTP preset applied. Please enter your Resend API key as the password.");
  };

  const applyCustomPreset = () => {
    setProvider("smtp");
    toast.info("Custom SMTP selected. You can enter any SMTP provider details.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!host.trim()) {
      toast.error("SMTP Host is required.");
      return;
    }
    if (!fromEmail.trim()) {
      toast.error("Sender Email Address is required.");
      return;
    }

    await updateMutation.mutateAsync({
      provider,
      host: host.trim(),
      port: Number(port) || 587,
      secure,
      user: user.trim() || null,
      pass: pass.trim() ? pass.trim() : undefined,
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim() || "Kurius"
    });

    setPass(""); // Clear password field after save
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientEmail.trim()) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }

    await testMutation.mutateAsync({
      toEmail: testRecipientEmail.trim(),
      provider,
      host: host.trim(),
      port: Number(port) || 587,
      secure,
      user: user.trim() || undefined,
      pass: pass.trim() || undefined,
      fromEmail: fromEmail.trim(),
      fromName: fromName.trim()
    });

    setIsTestModalOpen(false);
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 mx-auto max-w-3xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-6 h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/80 mx-auto max-w-3xl border">
        <CardHeader className="border-border/60 border-b pb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Email & SMTP Settings</CardTitle>
              <CardDescription className="text-muted-foreground mt-0.5 text-xs">
                Configure domain email sending with Resend, SendGrid, or custom SMTP
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-semibold">
              <Server className="h-3.5 w-3.5" />
              Active Provider: <strong className="text-primary ml-1 uppercase">{provider}</strong>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Quick Provider Presets */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase">
                Email Delivery Provider
              </Label>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Resend Option */}
                <div
                  onClick={applyResendPreset}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    provider === "resend" || host.includes("resend.com")
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border hover:border-border/80 bg-muted/10"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary rounded-lg p-2">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-bold">Resend</p>
                        <p className="text-muted-foreground text-xs">Recommended Modern Delivery</p>
                      </div>
                    </div>
                    {(provider === "resend" || host.includes("resend.com")) && (
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Uses Resend SMTP (<code>smtp.resend.com:587</code>). Pass your Resend API key as
                    the password.
                  </p>
                </div>

                {/* Custom SMTP Option */}
                <div
                  onClick={applyCustomPreset}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    provider === "smtp" && !host.includes("resend.com")
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border hover:border-border/80 bg-muted/10"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-bold">Custom SMTP</p>
                        <p className="text-muted-foreground text-xs">Any Standard Mail Server</p>
                      </div>
                    </div>
                    {provider === "smtp" && !host.includes("resend.com") && (
                      <CheckCircle2 className="text-primary h-5 w-5" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Connect any external SMTP gateway like SendGrid, Mailgun, Amazon SES, or custom
                    server.
                  </p>
                </div>
              </div>
            </div>

            {/* Sender Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fromName" className="text-xs font-semibold">
                  Sender Display Name *
                </Label>
                <Input
                  id="fromName"
                  placeholder="e.g. Kurius"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-[11px]">
                  Name shown to recipients (e.g. in inbox preview)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fromEmail" className="text-xs font-semibold">
                  Sender Email Address *
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="no-reply@kurius.cloud"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-[11px]">
                  Must be a verified domain address in Resend / your provider
                </p>
              </div>
            </div>

            {/* Server Connection Parameters */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="host" className="text-xs font-semibold">
                  SMTP Host *
                </Label>
                <Input
                  id="host"
                  placeholder="smtp.resend.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="port" className="text-xs font-semibold">
                  Port *
                </Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="587"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Credentials */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="user" className="text-xs font-semibold">
                  SMTP Username / Auth ID
                </Label>
                <Input
                  id="user"
                  placeholder="resend"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
                <p className="text-muted-foreground text-[11px]">
                  For Resend, username is usually <code>resend</code>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-xs font-semibold">
                  Password / API Key
                </Label>
                <Input
                  id="pass"
                  type="password"
                  placeholder={
                    setting?.hasPassword
                      ? "•••••••• (Password configured, enter new to change)"
                      : "Enter API key or password"
                  }
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
                <p className="text-muted-foreground text-[11px]">
                  {setting?.hasPassword
                    ? "Password is securely stored in database"
                    : "Enter your Resend API key (re_...)"}
                </p>
              </div>
            </div>

            {/* SSL/TLS Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="secure"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="secure" className="cursor-pointer text-xs font-medium">
                Enable SSL/TLS (Check this if using Port 465; leave unchecked for STARTTLS Port 587)
              </Label>
            </div>

            {/* Actions Bar */}
            <div className="border-border flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(true)}
                className="gap-2 text-xs"
              >
                <Send className="h-3.5 w-3.5" />
                Send Test Email
              </Button>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="gap-2 font-semibold"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Save Email Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Email Modal */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="text-primary h-5 w-5" />
              Send Test Verification Email
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch an immediate test email to verify that your domain email configuration and
              SMTP connection are working properly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendTestEmail} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="testEmail" className="text-xs font-semibold">
                Recipient Email Address *
              </Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="your-name@example.com"
                value={testRecipientEmail}
                onChange={(e) => setTestRecipientEmail(e.target.value)}
                required
                autoFocus
              />
              <p className="text-muted-foreground text-[11px]">
                A sample branded email from{" "}
                <strong>
                  {fromName || "Kurius"} &lt;{fromEmail}&gt;
                </strong>{" "}
                will be sent to this address.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTestModalOpen(false)}
                disabled={testMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={testMutation.isPending || !testRecipientEmail.trim()}
                className="gap-2 font-semibold"
              >
                {testMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Test
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
