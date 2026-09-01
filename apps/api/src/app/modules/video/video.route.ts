import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth, { authOptional } from "../../middlewares/auth";
import { uploadVideoFiles } from "../../middlewares/uploadVideo";
import { VideoController } from "./video.controller";

const router = express.Router();

// Public / Guest / User Endpoints (Optional Auth to track isLiked)
router.get("/", authOptional(), VideoController.getAllVideos);
router.get("/category/:categoryId", authOptional(), VideoController.getVideosByCategory);
router.get("/:id", authOptional(), VideoController.getVideoById);

// Admin Endpoints (Admin, Super Admin)
router.get(
  "/admin/all",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VideoController.getAdminVideos
);

router.post(
  "/",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  uploadVideoFiles,
  VideoController.createVideo
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
