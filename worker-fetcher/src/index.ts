import {
  createTerminus,
  HealthCheckError,
  TerminusOptions
} from "@godaddy/terminus";
import { GracefulShutdownManager } from "@moebius/http-graceful-shutdown";
import express from "express";
import http from "http";
import * as bootstrap from "./bootstrap";

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

console.log("STARTING WORKER FETCHER SERVICE...");
console.log("Worker Fetcher env:");
Object.keys(process.env).forEach((env) => {
  if (env.includes("TELUNJUK")) {
    console.log(`${env}:`, process.env[env]);
  }
});

const healthChecks = async () => {
  return await bootstrap.check().catch((e) => {
    throw new HealthCheckError("Healtcheck error", e);
  });
};

(async () => {
  await bootstrap
    .connect()
    .then(() => healthChecks())
    .then(() => console.log("ALL COMPONENTS ARE CONNECTED"))
    .catch((e) => console.error(e));
})().then(() => {
  const shutdownManager = new GracefulShutdownManager(server);

  const terminusOpts: TerminusOptions = {
    healthChecks: {
      "/health": healthChecks
    },
    signals: ["SIGINT", "SIGTERM"],
    onSignal: async () => {
      await bootstrap.stop();
    },
    onShutdown: async () => {
      return Promise.resolve(
        shutdownManager.terminate(() => {
          console.log("Server terminated");

          process.exit(0);
        })
      );
    }
  };

  createTerminus(server, terminusOpts);
  server.listen(process.env.TELUNJUK_SERVER_PORT || 80, () => {
    console.log("READY TO SERVE...");
  });
});
