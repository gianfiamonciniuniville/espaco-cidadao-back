import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const { DB_HOST, DB_NAME, DB_PASS, DB_USER, GCS_DB_NAME = "sqlgcs" } = process.env;

const connection: Sequelize = new Sequelize({
  dialect: "mssql",
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  database: DB_NAME,
  logging: false,
  define: {
    timestamps: true,
  },
  dialectOptions: {
    options: {
      requestTimeout: 30000,
    },
  },
  retry: {
    max: 10,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTDOWN/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
  },
});

export const gcsDatabase = new Sequelize({
  dialect: "mssql",
  username: DB_USER,
  password: DB_PASS,
  host: DB_HOST,
  database: GCS_DB_NAME,
  logging: false,
  dialectOptions: {
    options: {
      requestTimeout: 30000,
    },
  },
});

gcsDatabase
  .authenticate()
  .then(() => console.log(`Database sqlgcs connected!`))
  .catch((err) => {
    console.log(err);
  });

connection
  .authenticate()
  .then(() => console.log(`Database ${DB_NAME} connected!`))
  .catch((error) => console.log(error, "Error to connect to database!"));

export default connection;
