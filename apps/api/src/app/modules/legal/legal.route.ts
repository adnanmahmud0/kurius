import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { LegalController } from "./legal.controller";
import { updateLegalPolicyZodSchema } from "./legal.validation";

const router = express.Router();

// Public: Fetch Privacy Policy or Terms of Service
router.get("/:type", LegalController.getLegalPolicy);

// Admin: Update Privacy Policy or Terms of Service
router.put(
  "/:type",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(updateLegalPolicyZodSchema),
  LegalController.updateLegalPolicy
);

export const LegalRoutes = router;
