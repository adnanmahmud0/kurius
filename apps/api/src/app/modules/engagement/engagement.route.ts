import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { EngagementController } from "./engagement.controller";
import { EngagementValidation } from "./engagement.validation";

const router = express.Router({ mergeParams: true });

router.post(
  "/:id/view",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(EngagementValidation.recordViewZodSchema),
  EngagementController.recordView
);

router
  .route("/:id/like")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(EngagementValidation.toggleLikeZodSchema),
    EngagementController.likeVideo
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(EngagementValidation.toggleLikeZodSchema),
    EngagementController.unlikeVideo
  );

export const EngagementRoutes = router;
