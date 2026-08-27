import express from "express";

import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { StorageController } from "./storage.controller";
import { StorageValidation } from "./storage.validation";

const router = express.Router();

router
  .route("/")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), StorageController.getStorageSetting)
  .put(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(StorageValidation.updateStorageSettingZodSchema),
    StorageController.updateStorageSetting
  );

router.post(
  "/test",
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(StorageValidation.testStorageSettingZodSchema),
  StorageController.testStorageConnection
);

export const StorageRoutes = router;
