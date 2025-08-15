import express from "express";
import bodyParser from "body-parser";

export const initServer: () => any = async () => {
  const app=express();
  app.use(bodyParser.json())
  return app;
}