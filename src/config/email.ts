import nodemailer, { SendMailOptions } from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_API_KEY } = process.env;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST as string,
  port: MAIL_PORT as string,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_API_KEY,
  },
} as SendMailOptions);

export default transporter;
