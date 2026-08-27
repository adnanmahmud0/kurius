import bcrypt from "bcrypt";

import config from "../config";
import { USER_ROLES } from "../enums/user";
import { errorLogger, logger } from "../shared/logger";
import prisma from "../shared/prisma";

export const seedSuperAdmin = async () => {
  try {
    if (!config.super_admin.email || !config.super_admin.password) {
      logger.info("ℹ️ Super Admin credentials not provided in .env, skipping seed.");
      return;
    }

    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        email: config.super_admin.email as string,
        role: USER_ROLES.SUPER_ADMIN
      }
    });

    if (!isExistSuperAdmin) {
      const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
      const hashedPassword = await bcrypt.hash(config.super_admin.password as string, saltRounds);

      await prisma.user.create({
        data: {
          name: "Administrator",
          email: config.super_admin.email as string,
          role: USER_ROLES.SUPER_ADMIN,
          password: hashedPassword,
          verified: true
        }
      });
      logger.info("✨ Super Admin account has been successfully created!");
    }

    // Seed default categories if none exist
    const categoriesCount = await prisma.category.count();
    if (categoriesCount === 0) {
      const defaultCategories = [
        { name: "Gaming", slug: "gaming" },
        { name: "Music", slug: "music" },
        { name: "Technology", slug: "technology" },
        { name: "Comedy", slug: "comedy" },
        { name: "Education", slug: "education" }
      ];

      for (const cat of defaultCategories) {
        await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            status: "active"
          }
        });
      }
      logger.info("✨ Default categories seeded successfully!");
    }

    // Seed default storage setting if none exists
    const storageSettingCount = await prisma.storageSetting.count();
    if (storageSettingCount === 0) {
      await prisma.storageSetting.create({
        data: {
          provider: "local"
        }
      });
      logger.info("✨ Default local storage setting initialized!");
    }

    // Seed default Privacy Policy if none exists
    const privacyPolicy = await prisma.legalPolicy.findUnique({
      where: { type: "privacy" }
    });
    if (!privacyPolicy) {
      await prisma.legalPolicy.create({
        data: {
          type: "privacy",
          title: "Privacy Policy",
          content: `## 1. Introduction
Welcome to Kurius Video Platform. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes our practices regarding the collection, use, and disclosure of information through our web and mobile applications.

## 2. Information We Collect
- **Account Information:** Name, email address, password hash, and profile avatar.
- **Video Engagement Data:** Video views (deduplicated by 24-hour windows), likes, and comments.
- **Technical Telemetry:** Device identifiers, browser type, and operating system for service security.

## 3. How We Use Information
We process collected data to provide, maintain, and optimize video streaming delivery, prevent duplicate engagement spam, verify account security via one-time passcodes (OTP), and provide creator analytics.

## 4. Data Storage & Security
All passwords are encrypted with bcrypt with a work factor of 10 or greater. JWT tokens are transmitted securely. Media content is stored on enterprise-grade storage providers with restricted access controls.

## 5. Contact Us
If you have questions about this privacy policy or our data practices, please contact our data protection team at privacy@kurius.com.`
        }
      });
      logger.info("✨ Default Privacy Policy initialized!");
    }

    // Seed default Terms of Service if none exists
    const termsPolicy = await prisma.legalPolicy.findUnique({
      where: { type: "terms" }
    });
    if (!termsPolicy) {
      await prisma.legalPolicy.create({
        data: {
          type: "terms",
          title: "Terms of Service",
          content: `## 1. Acceptance of Terms
By accessing or using the Kurius Video Platform website, admin dashboard, or mobile application, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.

## 2. User Accounts & Verification
You must provide accurate and complete registration information. All accounts must be verified via our email one-time passcode (OTP) system before full features can be accessed. You are responsible for safeguarding your login credentials.

## 3. Content Guidelines & Moderation
All uploaded video content and community comments must comply with applicable laws and must not contain unlawful, harassing, or infringing materials. Administrators retain the right to deactivate or delete any content or user account that violates these standards.

## 4. Intellectual Property
Creators retain copyright in their original media uploads, while granting Kurius a license to stream, transcode, and display content across connected clients.

## 5. Termination
We reserve the right to suspend or terminate accounts that repeatedly violate community rules or security boundaries.`
        }
      });
      logger.info("✨ Default Terms of Service initialized!");
    }
  } catch (error) {
    errorLogger.error("⚠️ Failed to seed initial database entities:", error);
  }
};
