import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

import authRoutes from "./controllers/auth";

import { trim } from "./middleware";
import createDBConnection from "./database/createConnection";
import { attachPublicRoutes } from "./routes";

const establishDBConnection = async (): Promise<void> => {
  try {
    await createDBConnection();
    console.log("Database connected!");
  } catch (err) {
    console.log(err);
  }
};

const initializeExpress = (): void => {
  const app = express();
  app.use(express.json());
  app.use(morgan("dev"));

  // Middleware
  app.use(trim);
  app.use(cookieParser());

  // Routes
  // app.use("/api/auth", authRoutes);
  attachPublicRoutes(app);

  app.listen(5000);
};

const initializeApp = async () => {
  await establishDBConnection();
  initializeExpress();
};

initializeApp();
