import { renderFile } from "pug";
import path from "path";
import transporter from "../config/email";
import dotenv from "dotenv";
dotenv.config();

const { MAIL_FROM_NAME, MAIL_FROM } = process.env;
export const sendMail = async ({
  from,
  to,
  subject,
  view,
  params,
}: {
  from?: string;
  to: string;
  subject: string;
  view: any;
  params: any;
}) => {
  const viewPath = path.resolve("./src/emails/", view);

  const message = renderFile(viewPath, params);

  try {
    await transporter.sendMail({
      from: `"${MAIL_FROM_NAME}"  < ${MAIL_FROM} >`,
      to,
      subject,
      html: message,
    });
  } catch (error) {
    console.log(error);
  }
};
