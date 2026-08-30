import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth, { authOptional } from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MotivationalMessageController } from "./motivational-message.controller";
import { MotivationalMessageValidation } from "./motivational-message.validation";

const router = express.Router();

// Public / Mobile app endpoints
router.get("/random", authOptional(), MotivationalMessageController.getRandomMessage);
router.get("/", authOptional(), MotivationalMessageController.getAllMessages);
router.get("/:id", authOptional(), MotivationalMessageController.getMessageById);

// Admin endpoints
router.post(
  "/admin",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(MotivationalMessageValidation.createMessageZodSchema),
  MotivationalMessageController.createMessage
);

router.post(
  "/admin/bulk",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(MotivationalMessageValidation.bulkCreateMessagesZodSchema),
  MotivationalMessageController.createBulkMessages
);

router
  .route("/admin/:id")
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(MotivationalMessageValidation.updateMessageZodSchema),
    MotivationalMessageController.updateMessage
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    MotivationalMessageController.deleteMessage
  );

export const MotivationalMessageRoutes = router;
