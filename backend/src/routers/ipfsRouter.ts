import { Router, Request, Response } from "express";

const app = Router();

app.post("/upload", async (req: Request, res: Response) => {
  res.status(200).send("report successfully");
});

export default app;
