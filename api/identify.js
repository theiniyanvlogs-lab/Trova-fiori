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

    if (!imageBase64) {
      return res.status(400).json({ error: "No image received" });
    }

    // ✅ Upload Image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;

    console.log("✅ Uploaded:", imageUrl);

    // ✅ Call Grok Vision API
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
                text: "Identify this flower clearly.",
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

    const data = await response.json();

    return res.status(200).json({
      uploadedImage: imageUrl,
      result: data?.choices?.[0]?.message?.content || "No result returned",
    });
  } catch (err) {
    console.error("❌ Identify API Error:", err);

    return res.status(500).json({
      error: err.message || "Something went wrong",
    });
  }
}
