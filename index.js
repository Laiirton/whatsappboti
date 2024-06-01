const { create, Client } = require('@wppconnect-team/wppconnect');

create({
    session: 'whatsapp boti',
    catchQR: (base64Qr, asciiQR) => console.log(asciiQR),
    statusFind: (statusSession, session) => console.log('Status da sessão:', statusSession),
})
.then((client) => start(client))
.catch((error) => console.log(error));

async function start(client) {
    client.onMessage(async (message) => {

        if (message.body === '!fig') {
            if (message.quotedMsg && message.quotedMsg.type === 'image') {
                console.log(message.quotedMsg);
                try {
                    const stickerData = await client.decryptFile(message.quotedMsg);
                    const base64Sticker = stickerData.toString('base64');
                    await client.sendImageAsSticker(message.from, `data:image/png;base64,${base64Sticker}`);
                    console.log('Sticker sent successfully');
                } catch (error) {
                    console.error('Error processing sticker:', error);
                }
            }
        }
        
        if (message.caption === '!fig' && message.type === 'image') {
            try {
                const mediaData = await client.downloadMedia(message);
                const sticker = await client.sendImageAsSticker(message.from, mediaData);
                if (sticker) {
                    console.log('Figurinha enviada com sucesso!');
                }
            } catch (error) {
                console.error('Erro ao processar a figurinha:', error);
                client.sendText(message.from, 'Desculpe, ocorreu um erro ao criar a figurinha.');
            }
        }
    });
}
