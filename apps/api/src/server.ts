import { Server as HttpServer } from "http";
import process from "process";

import colors from "colors";
import { Server } from "socket.io";

import app from "./app";
import config from "./config";
import { seedSuperAdmin } from "./DB/seedAdmin";
import { socketHelper } from "./helpers/socketHelper";
import { errorLogger, logger } from "./shared/logger";
import prisma from "./shared/prisma";

//uncaught exception
process.on("uncaughtException", (error) => {
  errorLogger.error("UnhandleException Detected", error);
  process.exit(1);
});

let server: HttpServer;
async function main() {
  try {
    await prisma.$connect();
    logger.info(colors.green("🚀 Database connected successfully"));

    //Seed Super Admin and initial motivational quotes
    await seedSuperAdmin();
    const { MotivationalMessageService } =
      await import("./app/modules/motivational-message/motivational-message.service");
    await MotivationalMessageService.seedInitialMessagesIfEmpty();

    const port = Number(config.port) || 5000;
    const ipAddress = (config.ip_address as string) || "0.0.0.0";

    server = app.listen(port, ipAddress, () => {
      logger.info(colors.yellow(`♻️  Application listening on port:${port}`));
    });

    //socket
    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*"
      }
    });
    socketHelper.socket(io);
    //@ts-expect-error global io assignment
    global.io = io;
  } catch (error) {
    errorLogger.error(colors.red("🤢 Failed to initialize Server / Database"), error);
  }

  //handle unhandleRejection
  process.on("unhandledRejection", (error) => {
    if (server) {
      server.close(() => {
        errorLogger.error("UnhandleRejection Detected", error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

//SIGTERM
process.on("SIGTERM", () => {
  logger.info("SIGTERM IS RECEIVE");
  if (server) {
    server.close();
  }
});
