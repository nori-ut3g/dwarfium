import { NextApiRequest, NextApiResponse } from "next";
import { discoverDevices } from "@/lib/discover_devices";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("API discover is running");
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const devices = await discoverDevices();
    return res.status(200).json({ devices });
  } catch (error) {
    console.error("Discovery failed:", error);
    return res
      .status(500)
      .json({ error: (error as Error).message || "Discovery failed" });
  }
}
