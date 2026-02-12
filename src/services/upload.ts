// src/services/upload.ts

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

/* ✅ Upload Base64 Image to Cloudinary */
export async function uploadToCloudinary(base64: string): Promise<string> {
  const formData = new FormData();

  formData.append("file", base64);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("❌ Image Upload Failed");
  }

  console.log("✅ Uploaded Image URL:", data.secure_url);

  return data.secure_url;
}
