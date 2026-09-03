import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { EmailController } from "./email.controller";
import { EmailValidation } from "./email.validation";

const router = express.Router();

router
  .route("/")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), EmailController.getEmailSetting)
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(EmailValidation.updateEmailSettingZodSchema),
    EmailController.updateEmailSetting
  );

router.post(
  "/test",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EmailValidation.testEmailSettingZodSchema),
  EmailController.testEmailConnection
);

export const EmailRoutes = router;
