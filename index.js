const { create, Client } = require("@wppconnect-team/wppconnect");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

// AI GOOGLE API
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = "AIzaSyCem06DOhmjJxz9qireL64r4Nt8L3lyVk0"
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function getGeminiResponse(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ], 
    history: [], 
  });

  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}



create({
  session: "whatsapp boti",
  catchQR: (base64Qr, asciiQR) => console.log(asciiQR),
  statusFind: (statusSession, session) =>
    console.log("Status da sessão:", statusSession),
})
  .then((client) => start(client))
  .catch((error) => console.log(error));

async function start(client) {
  client.onMessage(async (message) => {


    if(message.body.startsWith('coiso'))
      {
        const prompt = message.body.replace('coiso', '').trim();
        const response = await getGeminiResponse(prompt);
        console.log(response)
        await client.sendText(message.from, response);
      }

    if (message.body === "!fig") {
      if (message.quotedMsg && message.quotedMsg.type === "image") {
        try {
          const stickerData = await client.decryptFile(message.quotedMsg);
          const base64Sticker = stickerData.toString("base64");
          await client.sendImageAsSticker(
            message.from,
            `data:image/png;base64,${base64Sticker}`
          );
          console.log("Sticker sent successfully");
        } catch (error) {
          console.error("Error processing sticker:", error);
        }
      }
    }

    if (message.caption === "!fig" && message.type === "image") {
      try {
        const stickerData = await client.decryptFile(message);
        const base64Sticker = stickerData.toString("base64");
        await client.sendImageAsSticker(
          message.from,
          `data:image/png;base64,${base64Sticker}`
        );
        console.log("Sticker sent successfully");
      } catch (error) {
        console.error("Error processing sticker:", error);
      }
    }

    if (message.body === "!fig") {
      if (message.quotedMsg && message.quotedMsg.type === "video") {
        try {
          const videoBuffer = await client.decryptFile(message.quotedMsg);
          const videoPath = path.join(__dirname, "video.mp4");
          const webpPath = path.join(__dirname, "sticker.webp");

          fs.writeFileSync(videoPath, videoBuffer);

          ffmpeg(videoPath)
            .outputOptions([
              "-vf",
              "scale=512:512:force_original_aspect_ratio=decrease,fps=10",
              "-vcodec",
              "libwebp",
              "-lossless",
              "0",
              "-q:v",
              "50",
              "-preset",
              "default",
              "-loop",
              "0",
              "-an",
              "-vsync",
              "0",
              "-s",
              "512:512",
              "-t",
              "6",
            ])
            .toFormat("webp")
            .save(webpPath)
            .on("end", async () => {
              const webpBuffer = fs.readFileSync(webpPath);
              const base64Webp = webpBuffer.toString("base64");
              await client.sendImageAsStickerGif(
                message.from,
                `data:image/webp;base64,${base64Webp}`
              );
              console.log("Sticker sent successfully");
              fs.unlinkSync(videoPath);
              fs.unlinkSync(webpPath);
            })
            .on("error", (error) => {
              console.error("Error processing video to webp:", error);
            });
        } catch (error) {}
      }
    }

    if (message.caption === "!fig" && message.type === "video") {
      try {
        const videoBuffer = await client.decryptFile(message);
        const videoPath = path.join(__dirname, "video.mp4");
        const webpPath = path.join(__dirname, "sticker.webp");

        fs.writeFileSync(videoPath, videoBuffer);

        ffmpeg(videoPath)
          .outputOptions([
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,fps=10",
            "-vcodec",
            "libwebp",
            "-lossless",
            "0",
            "-q:v",
            "50",
            "-preset",
            "default",
            "-loop",
            "0",
            "-an",
            "-vsync",
            "0",
            "-s",
            "512:512",
            "-t",
            "6",
          ])
          .toFormat("webp")
          .save(webpPath)
          .on("end", async () => {
            const webpBuffer = fs.readFileSync(webpPath);
            const base64Webp = webpBuffer.toString("base64");
            await client.sendImageAsStickerGif(
              message.from,
              `data:image/webp;base64,${base64Webp}`
            );
            console.log("Sticker sent successfully");
            fs.unlinkSync(videoPath);
            fs.unlinkSync(webpPath);
          })
          .on("error", (error) => {
            console.error("Error processing video to webp:", error);
          });
      } catch (error) {
        console.error("Error downloading or converting video:", error);
      }
    }
  });
}

