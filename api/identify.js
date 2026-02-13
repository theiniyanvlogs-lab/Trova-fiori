import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { imageBase64 } = req.body;

    console.log("✅ Step 1: Uploading image to Cloudinary...");

    // ✅ Upload image
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;

    console.log("✅ Uploaded Successfully:", imageUrl);

    console.log("✅ Step 2: Sending image to Grok Vision...");

    // ✅ Call Grok Vision API
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-2-vision",   // ✅ FIXED MODEL
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify this flower. Return flower name and tamil name.",
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
      }),
    });

    // ✅ If Grok fails, print full error
    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Grok API Full Error:", errText);

      return res.status(500).json({
        error: "Grok API Failed",
        details: errText,
      });
    }

    const data = await response.json();

    console.log("✅ Grok Response Success");

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content,
      uploadedImage: imageUrl,
    });
  } catch (err) {
    console.error("❌ Identify API Crash:", err);

    return res.status(500).json({
      error: "Identify API Error",
      message: err.message,
    });
  }
}
