import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { cliui } from "@poppinss/cliui";
import cron from "node-cron";

import { env } from "./config/env.js";
import index from "./routes/index.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/error.middleware.ts.js";
import { detectLevelOneConflicts } from "./services/conflict.service.js";
import { logError, logInfo } from "./utils/logger.js";

export const app = express();

const ui = cliui();
const sticker = ui.sticker();

// ─────────────────────────────────────────────
// Middlewares
// ─────────────────────────────────────────────

app.use(express.json());

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use("/health", healthRouter);
app.use(index);

// ─────────────────────────────────────────────
// Error handler
// ─────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────
// Database
// ─────────────────────────────────────────────

const connectDB = async () => {
    try {
        await mongoose.connect(env.mongoUri);
        sticker
            .add("Base de datos Online")
            .render();
        logInfo("database.connected");
        return true;
    } catch (error) {
        sticker
            .add("Base de datos Offline")
            .render();
        logError("database.connection.failed", error);
        return false;
    }
};

// ─────────────────────────────────────────────
// Server
// ─────────────────────────────────────────────

const startServer = async () => {

    const databaseConnected = await connectDB();

    if (!databaseConnected) {
        logError("server.start.aborted", new Error("MongoDB unavailable"));
        process.exit(1);
    }

// ─────────────────────────────────────────────
// Cron job
// ─────────────────────────────────────────────
    
    cron.schedule(
        "8 16 * * *",
        async () => {
            logInfo("cron.conflict_detection.started");

            try {
                const conflicts = await detectLevelOneConflicts();
                logInfo("cron.conflict_detection.completed", {
                    newConflicts: conflicts.length,
                });
            } catch (error) {
                logError("cron.conflict_detection.failed", error);
            }
        },
        { timezone: "America/Bogota" },
    );

    app.listen(
        env.port,
        "0.0.0.0",
        () => {
            sticker
                .add("Servidor HTTP iniciado")
                .add("")
                .add(
                    `Puerto: ${ui.colors.cyan(
                        env.port.toString()
                    )}`
                )
                .add(
                    `Entorno: ${ui.colors.red(
                        env.nodeEnv
                    )}`
                )
                .render();
            logInfo("server.http.started", {
                port: env.port,
                environment: env.nodeEnv,
            });
        }
    );
};

startServer();