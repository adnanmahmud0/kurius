import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { CommentController } from "./comment.controller";
import { CommentValidation } from "./comment.validation";

const router = express.Router({ mergeParams: true });

// Route mounted at /videos/:id/comments
router
  .route("/:id/comments")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(CommentValidation.createCommentZodSchema),
    CommentController.createComment
  )
  .get(CommentController.getVideoComments);

// Route mounted at /comments/:id for deleting a comment
router.delete(
  "/comments/:id",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  CommentController.deleteComment
);

export const CommentRoutes = router;
