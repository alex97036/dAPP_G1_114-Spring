import { create } from "@web3-storage/w3up-client";
import { filesFromPaths } from "files-from-path";
import { pool } from "../utils/db.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportPath = path.resolve(__dirname, "../../reports");

if (!fs.existsSync(reportPath)) {
  fs.mkdirSync(reportPath, { recursive: true });
}

dotenv.config();

const EMAIL = process.env.EMAIL;
const W3SPACE_DID = process.env.W3SPACE_DID;

if (!EMAIL || !W3SPACE_DID) {
  throw new Error(".env 缺少 EMAIL 或 W3SPACE_DID");
}

export async function saveToDocs(id: number, info: string) {
  try {
    const filePath = path.join(reportPath, `${id}.txt`);
    fs.writeFileSync(filePath, info, "utf8");
    console.log(`Report saved to ${filePath}`);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

export async function uploadFile(id: number): Promise<any> {
  const client = await create();
  await client.login(EMAIL as `${string}@${string}`);
  await client.setCurrentSpace(W3SPACE_DID as `did:${string}:${string}`);
  const filePath = path.join(reportPath, `${id}.txt`);
  const files = await filesFromPaths([filePath]);

  const cid = await client.uploadDirectory(files);
  console.log(`IPFS URL: https://${cid}.ipfs.w3s.link`);
  return cid;
}

export async function toSol() {
  console.log("todo");
}

export async function saveToDB(cid: string, filename: string) {
  try {
    await pool.query(
      "INSERT INTO report_list (cid, file_name) VALUES ($1, $2)",
      [cid, filename]
    );
    console.log("✅ CID saved to database:", cid, filename);
  } catch (error) {
    console.error("❌ Error saving CID to database:", error);
  }
}

export async function getAllCIDs(): Promise<string[]> {
  try {
    const result = await pool.query("SELECT * FROM report_list");
    console.log(result.rows);
    return result.rows.map((row: any) => {
      return {
        cid: row.cid,
        file_name: row.file_name,
        content: fs.readFileSync(path.join(reportPath, row.file_name), "utf8"),
      };
    });
  } catch (error) {
    console.error("Error fetching CIDs from database:", error);
    throw error;
  }
}
async function getFileName(cid: string): Promise<string> {
  const result = await pool.query("SELECT * FROM report_list WHERE cid = $1", [
    cid,
  ]);

  if (result.rows.length === 0) {
    throw new Error(`No file found for CID: ${cid}`);
  }

  return result.rows[0].file_name;
}

export async function getReport(
  cid: string
): Promise<{ cid: string; content: string }> {
  try {
    const filename = await getFileName(cid);
    const filePath = path.join(reportPath, filename);

    const content = fs.readFileSync(filePath, "utf8");

    return {
      cid,
      content,
    };
  } catch (error) {
    console.error("❗ Error fetching report content:", error);
    throw error;
  }
}

export async function stats() {
  const totalQuery = await pool.query("SELECT COUNT(*) FROM report_list");
  const total = parseInt(totalQuery.rows[0].count, 10);

  const todayStart = dayjs().startOf("day").toISOString(); // 今日 00:00:00
  const todayQuery = await pool.query(
    "SELECT COUNT(*) FROM report_list WHERE created_at >= $1",
    [todayStart]
  );
  const today = parseInt(todayQuery.rows[0].count, 10);
  return {
    total,
    today,
    lastUpdated: new Date().toISOString()
  };
}
