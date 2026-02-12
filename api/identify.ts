export default async function handler(req: any, res: any) {
  try {
    const { imageBase64 } = req.body;

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
`
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    res.status(200).json({
      result: data.choices[0].message.content
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
