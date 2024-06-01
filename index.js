const { create, Client } = require("@wppconnect-team/wppconnect");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
ffmpeg.setFfmpegPath(ffmpegPath);

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
    if (message) {
      console.log(message);
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
