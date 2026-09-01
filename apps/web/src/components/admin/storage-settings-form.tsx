"use client";

import React, { useEffect, useState } from "react";

import {
  CheckCircle2,
  Cloud,
  HardDrive,
  KeyRound,
  Loader2,
  Server,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import {
  useStorageSettings,
  useTestStorageConnection,
  useUpdateStorageSettings
} from "@/hooks/use-storage-settings";

import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";

export function StorageSettingsForm() {
  const { data: setting, isLoading } = useStorageSettings();
  const updateMutation = useUpdateStorageSettings();
  const testMutation = useTestStorageConnection();

  const [provider, setProvider] = useState<"local" | "cloudinary">("local");
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    if (setting) {
      setProvider(setting.provider as "local" | "cloudinary");
      setCloudName(setting.cloudName || "");
      setApiKey(setting.apiKey || "");
    }
  }, [setting]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (provider === "cloudinary" && (!cloudName.trim() || !apiKey.trim())) {
      toast.error("Cloud Name and API Key are required for Cloudinary.");
      return;
    }

    await updateMutation.mutateAsync({
      provider,
      cloudName: cloudName.trim() || null,
      apiKey: apiKey.trim() || null,
      apiSecret: apiSecret.trim() || null
    });
  };

  const handleTest = async () => {
    if (!cloudName.trim() || !apiKey.trim() || !apiSecret.trim()) {
      toast.error("Please enter Cloud Name, API Key, and API Secret to test connection.");
      return;
    }

    await testMutation.mutateAsync({
      cloudName: cloudName.trim(),
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim()
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border/80 mx-auto max-w-2xl border p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-6 h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  return (
    <Card className="border-border/80 mx-auto max-w-2xl border">
      <CardHeader className="border-border/60 border-b pb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Storage Provider Settings</CardTitle>
            <CardDescription className="text-muted-foreground mt-0.5 text-xs">
              Choose where uploaded video files and thumbnails are stored
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1 text-xs font-semibold">
            <Server className="h-3.5 w-3.5" />
            Active: <strong className="text-primary ml-1 uppercase">{provider}</strong>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Storage Option Selector */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Local Storage Option */}
            <div
              onClick={() => setProvider("local")}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                provider === "local"
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-border/80 bg-muted/10"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                  <HardDrive className="h-5 w-5" />
                </div>
                {provider === "local" && <CheckCircle2 className="text-primary h-5 w-5" />}
              </div>
              <h3 className="text-foreground text-sm font-bold">Local Disk Storage</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Default. Uploads are saved directly to the server&apos;s local filesystem
                (`uploads/`).
              </p>
              <Badge variant="secondary" className="mt-3 text-[10px] font-bold">
                DEFAULT &amp; READY
              </Badge>
            </div>

            {/* Cloudinary Option */}
            <div
              onClick={() => setProvider("cloudinary")}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                provider === "cloudinary"
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border hover:border-border/80 bg-muted/10"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="rounded-lg bg-sky-500/10 p-2 text-sky-500">
                  <Cloud className="h-5 w-5" />
                </div>
                {provider === "cloudinary" && <CheckCircle2 className="text-primary h-5 w-5" />}
              </div>
              <h3 className="text-foreground text-sm font-bold">Cloudinary CDN</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Uploads stream to Cloudinary for global CDN delivery and adaptive transcoding.
              </p>
              <Badge
                variant="outline"
                className="mt-3 border-sky-500/30 text-[10px] font-bold text-sky-500"
              >
                CLOUD READY
              </Badge>
            </div>
          </div>

          {/* Cloudinary Credentials Fields (Shown when Cloudinary is chosen) */}
          {provider === "cloudinary" && (
            <div className="space-y-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-5 transition-all">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-600">
                <KeyRound className="h-4 w-4" />
                Cloudinary API Credentials
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cloud-name" className="text-xs font-semibold">
                  Cloud Name *
                </Label>
                <Input
                  id="cloud-name"
                  placeholder="e.g. demo-cloud"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="api-key" className="text-xs font-semibold">
                    API Key *
                  </Label>
                  <Input
                    id="api-key"
                    placeholder="e.g. 123456789012345"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="api-secret" className="text-xs font-semibold">
                    API Secret {setting?.hasApiSecret && "(Configured)"}
                  </Label>
                  <Input
                    id="api-secret"
                    type="password"
                    placeholder={
                      setting?.hasApiSecret ? "••••••••••••••••" : "Enter Cloudinary API Secret"
                    }
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={testMutation.isPending || !cloudName.trim() || !apiKey.trim()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  {testMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  Test Connection
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-border flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="text-xs font-semibold"
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Storage Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
