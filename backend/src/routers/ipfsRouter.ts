import { Router, Request, Response } from "express";
import * as ipfsController from "../controllers/ipfsController.js";

const app = Router();

app.post("/upload", async (req: Request, res: Response) => {
  const { info } = req.body;
  const id = Date.now(); // 使用當前時間戳作為唯一 ID
  try {
    await ipfsController.saveToDocs(id, info);
    await ipfsController.uploadFile(id);
    res.json({ success: true, message: "File uploaded successfully", id });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: "File upload failed" });
  }
});

export default app;
