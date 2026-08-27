import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { uploadVideoFiles } from "../../middlewares/uploadVideo";
import { VideoController } from "./video.controller";

const router = express.Router();

// Public / User Endpoints (User, Admin, Super Admin)
router.get(
  "/",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VideoController.getAllVideos
);

router.get(
  "/category/:categoryId",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VideoController.getVideosByCategory
);

router.get(
  "/:id",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VideoController.getVideoById
);

// Admin Endpoints (Admin, Super Admin)
router.get(
  "/admin/all",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VideoController.getAdminVideos
);

router.post(
  "/admin",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  uploadVideoFiles,
  VideoController.createVideo
);

router
  .route("/admin/:id")
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    uploadVideoFiles,
    VideoController.updateVideo
  )
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), VideoController.deleteVideo);

export const VideoRoutes = router;
