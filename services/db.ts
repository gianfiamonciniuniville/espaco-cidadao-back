import sql from "mssql";

const config: sql.config = {
  user: "sa",
  password: "espaco!cidadao",
  server: "localhost",
  database: "master",
  options: {
    encrypt: false, 
    trustServerCertificate: true
  }
};

let pool: sql.ConnectionPool;

export async function getDbPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("✅ Connected to SQL Server");
  }
  return pool;
}
