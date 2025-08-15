import express from "express";
import bodyParser from "body-parser";
import DatabaseService from "./services/databaseservice";
import cors from "cors";
import RedisService from "./services/redisservice";
import authRouter from "./routes/auth";
import EmailService from "./services/emailservice";
export const initServer: () => any = async () => {
  const dbService = DatabaseService.getInstance();
  await dbService.connect();
  const redisService = RedisService.getInstance();
  await redisService.connect();
  const emailService = EmailService.getInstance();
  await emailService.testConnection();
  const app=express();
  app.use(cors({
    origin: "*",
    credentials: true
  }));
  app.use(bodyParser.json())
  app.use('/api/auth', authRouter);
  return app;
}