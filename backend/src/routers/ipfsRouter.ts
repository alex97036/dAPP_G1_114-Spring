import { Router, Request, Response } from "express";
import * as ipfsController from "../controllers/ipfsController.js";

const app = Router();

app.post("/submit", async (req: Request, res: Response) => {
  const { content, tags = [] } = req.body;
  const id = Date.now();
  try {
    await ipfsController.saveToDocs(id, content);
    console.log(`Report saved with ID: ${id}`);

    const cid = await ipfsController.uploadFile(id);

    await ipfsController.toSol();

    await ipfsController.saveToDB(cid.toString(), `${id}.txt`);
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
    res.json({ success: true, reports: cidList, total: cidList.length });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports" });
  }
});
// report/:cid 跟 content/:cid 有什麼差

app.get("/report/:cid", async (req: Request, res: Response) => {
  const { cid } = req.params;
  try {
    const contentData = await ipfsController.getReport(cid);
    if (!contentData) {
      res.status(404).json({ success: false, error: "Report not found" });
    }
    res.status(200).json({ success: true, report: contentData });
  } catch (error) {
    console.error("Error fetching report content:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch reportcontent" });
  }
});

app.get('content/:cid', async (req: Request, res: Response) => {
  const { cid } = req.params;
  try {
    const contentData = await ipfsController.getReport(cid);
    if (!contentData) {
      res.status(404).json({ success: false, error: "Report not found" });
    }
    res.status(200).json({ success: true, report: contentData });
  } catch (error) {
    console.error("Error fetching report content:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch reportcontent" });
  }
});

app.get("/stats", async (req: Request, res: Response) => {
  try {
    const total = await ipfsController.stats();
    res.json({
      success: true,
      stats: {
        total, 
      },
    });
  } catch (error) {
    console.error("❌ Failed to fetch stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
});




export default app;
