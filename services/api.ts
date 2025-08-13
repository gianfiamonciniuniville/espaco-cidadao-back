import { api } from "@nitric/sdk";
import { getDbPool } from "./db";

const mainApi = api("main");

mainApi.get("/hello", async (ctx) => {
  const pool = await getDbPool();
  const result = await pool.request().query("SELECT name FROM sys.databases");
  ctx.res.json(result.recordset);
  return result.recordset;
});
