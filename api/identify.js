import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // ✅ Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // ✅ Fix: Ensure body is parsed properly
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { imageBase64 } = body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ✅ Step 1: Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;
    console.log("✅ Uploaded:", imageUrl);

    // ✅ Step 2: Send to Grok Vision
    const grokRes = await fetch("https://api.x.ai/v1/chat/completions", {
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
                text: `Identify this flower and respond ONLY in this format:

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

    const data = await grokRes.json();

    if (!data.choices) {
      console.log("❌ Grok Error Response:", data);
      return res.status(500).json({ error: "Grok API failed" });
    }

    // ✅ Step 3: Return Result
    return res.status(200).json({
      uploadedImage: imageUrl,
      result: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("❌ Identify API Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
