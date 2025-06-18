import dotenv from "dotenv";
dotenv.config();

console.log("DEBUG ⛔ NETWORK_URL =", process.env.NETWORK_URL);

import express from "express";
import cors from "cors";
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import ipfsRouter from "./routers/ipfsRouter.js";
import { initDB } from "./utils/db.js";
import morgan from "morgan";

async function main() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const ABI = JSON.parse(fs.readFileSync("./ReportRegistryABI.json", "utf8"));
  const {
    IPFS_API_URL,
    NETWORK_URL,
    PRIVATE_KEY,
    CONTRACT_ADDRESS,
    PORT = 3000,
  } = process.env;

  if (!NETWORK_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    console.error("缺少必要的環境變數");
    process.exit(1);
  }


  // v6 的写法：直接用 JsonRpcProvider、Wallet、Contract
  // const provider = new JsonRpcProvider(NETWORK_URL);
  // const wallet   = new Wallet(PRIVATE_KEY, provider);
  // const contract = new Contract(CONTRACT_ADDRESS, ABI, wallet);

  initDB().catch((err) => {
    console.error("❌ 初始化資料庫失敗:", err);
    process.exit(1);
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use("/", ipfsRouter);

  app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Report");
  });

  app.get("/health", (req, res) => {
    res.status(200).send("health");
  });

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.log(e);
});
