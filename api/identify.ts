import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: any, res: any) {
  try {
    const { imageBase64 } = req.body;

    // ✅ Step 1: Upload Base64 Image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "flowers",
    });

    const imageUrl = uploadResult.secure_url;

    console.log("✅ Uploaded to Cloudinary:", imageUrl);

    // ✅ Step 2: Send Cloudinary URL to Grok Vision
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
                image_url: {
                  url: imageUrl, // ✅ Cloudinary Public URL
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    // ✅ Step 3: Return Result + Image URL
    res.status(200).json({
      result: data.choices[0].message.content,
      uploadedImage: imageUrl,
    });
  } catch (err: any) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
}
