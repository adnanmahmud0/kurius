import express from "express";

import { AuthRoutes } from "../../app/modules/auth/auth.route";
import { CategoryRoutes } from "../../app/modules/category/category.route";
import { CommentRoutes } from "../../app/modules/comment/comment.route";
import { EmailRoutes } from "../../app/modules/email/email.route";
import { EngagementRoutes } from "../../app/modules/engagement/engagement.route";
import { LegalRoutes } from "../../app/modules/legal/legal.route";
import { MotivationalMessageRoutes } from "../../app/modules/motivational-message/motivational-message.route";
import { OAuthRoutes } from "../../app/modules/passport/oauth.route";
import { StorageRoutes } from "../../app/modules/storage/storage.route";
import { UserRoutes } from "../../app/modules/user/user.route";
import { VideoRoutes } from "../../app/modules/video/video.route";

const router = express.Router();

const apiRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/user",
    route: UserRoutes
  },
  {
    path: "/categories",
    route: CategoryRoutes
  },
  {
    path: "/videos",
    route: VideoRoutes
  },
  {
    path: "/videos",
    route: EngagementRoutes
  },
  {
    path: "/videos",
    route: CommentRoutes
  },
  {
    path: "/",
    route: CommentRoutes
  },
  {
    path: "/admin/storage",
    route: StorageRoutes
  },
  {
    path: "/admin/email",
    route: EmailRoutes
  },
  {
    path: "/legal",
    route: LegalRoutes
  },
  {
    path: "/motivational-messages",
    route: MotivationalMessageRoutes
  },
  {
    path: "/oauth",
    route: OAuthRoutes
  }
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export const V1Routes = router;
export default router;
