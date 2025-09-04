import dotenv from "dotenv";
import http from "http";
import express from "./config/express";

dotenv.config();

const { APP_PORT, APP_HOST } = process.env;

const app = http.createServer(express);

const server = app.listen(APP_PORT, (): void =>
  console.log(`Server Running at http://${APP_HOST}:${APP_PORT}`)
);

export default server;
