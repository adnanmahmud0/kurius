import express, { NextFunction, Request, Response } from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

router
  .route("/profile")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    UserController.getUserProfile
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    fileUploadHandler(),
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (req.body.data && typeof req.body.data === "string") {
          req.body = UserValidation.updateUserZodSchema.parse(JSON.parse(req.body.data));
        } else if (req.body && Object.keys(req.body).length > 0) {
          req.body = UserValidation.updateUserZodSchema.parse(req.body);
        }
        return next();
      } catch (err) {
        return next(err);
      }
    },
    UserController.updateProfile
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
    UserController.deleteAccount
  );

router
  .route("/")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getAllUsers)
  .post(validateRequest(UserValidation.createUserZodSchema), UserController.createUser);

router
  .route("/:id")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getUserById)
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.deleteUserByAdmin);

router.patch(
  "/:id/status",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.toggleUserStatus
);

export const UserRoutes = router;
