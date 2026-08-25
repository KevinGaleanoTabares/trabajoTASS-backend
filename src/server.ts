import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { cliui } from "@poppinss/cliui";

import { env } from "./config/env.js";
import index from "./routes/index.routes.js";
import { errorHandler } from "./middlewares/error.middleware.ts.js";

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

        return true;

    } catch (error) {

        sticker
            .add("Base de datos Offline")
            .render();

        console.error("Error al conectar con MongoDB:", error);

        return false;
    }
};

// ─────────────────────────────────────────────
// Server
// ─────────────────────────────────────────────

const startServer = async () => {

    const databaseConnected = await connectDB();

    if (!databaseConnected) {
        console.error("Servidor no iniciado porque MongoDB no está disponible.");
        process.exit(1);
    }

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
        }
    );
};

startServer();