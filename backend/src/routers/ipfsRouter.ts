import { Router, Request, Response } from "express";
import * as ipfsController from "../controllers/ipfsController.js";

const app = Router();

app.post("/submit", async (req: Request, res: Response) => {
  const { info } = req.body;
  const id = Date.now();
  try {
    await ipfsController.saveToDocs(id, info);
    console.log(`Report saved with ID: ${id}`);

    const cid = await ipfsController.uploadFile(id);

    await ipfsController.toSol();

    await ipfsController.saveToDB(cid.toString());
    res.json({
      success: true,
      message: "File uploaded successfully",
      id,
      cid: cid.toString(),
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: "File upload failed" });
  }
});

app.get("/reports", async (req: Request, res: Response) => {
  try {
    const cidList = await ipfsController.getAllCIDs();
    res.json({ success: true, reports: cidList });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports" });
  }
});


export default app;
