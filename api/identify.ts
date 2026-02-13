import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

/* ✅ Cloudinary Config */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /* ✅ Only Allow POST */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    /* ✅ Validate Image */
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    /* ✅ Step 1: Upload Image to Cloudinary */
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;

    console.log("✅ Uploaded to Cloudinary:", imageUrl);

    /* ✅ Step 2: Call Grok Vision API */
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-vision-beta",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Identify this flower from the image.

Return response in this format:

Flower Name:
Tamil Name:
Scientific Name:

English Description:
Tamil Description:

Sun Requirement:
Soil Needs:
Bloom Time:

Did You Know Fact:
`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });

    /* ✅ Handle Grok API Errors */
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Grok API Error:", errText);

      return res.status(500).json({
        error: "Grok API request failed",
        details: errText,
      });
    }

    const data = await response.json();

    /* ✅ Safe Result Extraction */
    const result =
      data?.choices?.[0]?.message?.content || "No flower identified.";

    /* ✅ Step 3: Send Back Response */
    return res.status(200).json({
      uploadedImage: imageUrl,
      result,
    });
  } catch (err: any) {
    console.error("❌ Identify API Error:", err);

    return res.status(500).json({
      error: "Server failed",
      message: err.message,
    });
  }
}
