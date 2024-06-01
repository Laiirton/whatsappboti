const { create, Client } = require('@wppconnect-team/wppconnect');

create({
    session: 'whatsapp boti', // Nome da sua sessão
    catchQR: (base64Qr, asciiQR) => {
        console.log(asciiQR); // Exibe o QR code no terminal
    },
    statusFind: (statusSession, session) => {
        console.log('Status da sessão:', statusSession); // Exibe o status da sessão
    }
})
.then((client) => start(client))
.catch((error) => console.log(error));

function start(client) {
    client.onMessage((message) => {
        if (message.body === 'Oi') {
            client.sendText(message.from, 'Olá! Como posso ajudar?');
        }
    });
}
