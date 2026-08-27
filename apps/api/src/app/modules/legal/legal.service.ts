import prisma from "../../../shared/prisma";

const DEFAULT_PRIVACY = `# Privacy Policy

## 1. Introduction
Welcome to Kurius Video Platform. We respect your privacy and are committed to protecting the personal data you share with us.

## 2. Information We Collect
- **Account Information:** Name, email address, and avatar.
- **Video Engagement Data:** Video views (deduplicated by 24-hour windows), likes, and comments.
- **Technical Telemetry:** Device identifiers and browser type.

## 3. How We Use Information
We process collected data to provide and optimize video streaming delivery, prevent duplicate spam, and provide creator analytics.

## 4. Contact Us
If you have questions, please contact our team at privacy@kurius.com.`;

const DEFAULT_TERMS = `# Terms of Service

## 1. Acceptance of Terms
By accessing or using Kurius Video Platform, you agree to be bound by these Terms of Service.

## 2. User Accounts & Verification
You must provide accurate information. All accounts must be verified via our email OTP system.

## 3. Content Guidelines
All uploaded video content and comments must comply with applicable laws and must not contain unlawful or infringing materials.

## 4. Intellectual Property
Creators retain copyright in their original media uploads, while granting Kurius a streaming distribution license.`;

const getLegalPolicy = async (type: string) => {
  const policy = await prisma.legalPolicy.findUnique({
    where: { type }
  });

  if (policy) {
    return policy;
  }

  // Create default fallback if not existing
  const defaultTitle = type === "terms" ? "Terms of Service" : "Privacy Policy";
  const defaultContent = type === "terms" ? DEFAULT_TERMS : DEFAULT_PRIVACY;

  return await prisma.legalPolicy.create({
    data: {
      type,
      title: defaultTitle,
      content: defaultContent
    }
  });
};

const updateLegalPolicy = async (type: string, payload: { title?: string; content: string }) => {
  const defaultTitle = type === "terms" ? "Terms of Service" : "Privacy Policy";

  const updated = await prisma.legalPolicy.upsert({
    where: { type },
    update: {
      title: payload.title || defaultTitle,
      content: payload.content
    },
    create: {
      type,
      title: payload.title || defaultTitle,
      content: payload.content
    }
  });

  return updated;
};

export const LegalService = {
  getLegalPolicy,
  updateLegalPolicy
};
