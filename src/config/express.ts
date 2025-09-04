import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import routes from "../routes";

import "../config/database";

const app = express();

app.use(cors());
app.use(helmet());
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "secret",
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

routes(app);

export default app;
