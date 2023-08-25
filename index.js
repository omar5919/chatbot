const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const {Client, MessageMedia, LegacySessionAuth, LocalAuth} = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const SESION_FILE_PATH = './session.json';
let cliente;
let sessionData;
app.use(express.urlencoded({extended: true}))
const sendWithApi = (req, res) => {
    const {message, to} = req.body;
    sendMessage(`51${to}@c.us`, message);
    res.send({status: 'enviado desde api'})
}
app.post('/enviarwsp', sendWithApi);
const withSesion = () => {
    console.log('Existe una sesion...');
    const spinner = ora(`Cargando ${chalk.yellow('Validando sesion...')}`);
    sessionData = require(SESION_FILE_PATH);
    spinner.start();
    cliente = new Client({session: sessionData})
    cliente.on('ready', () => {
        console.log('Cliente ready');
        listenMessage();
        console.log('Cliente escuchando');
        spinner.stop();
    })
    cliente.on('auth_failure', () => {
        console.log('finalizo la sesion');
        spinner.stop();
    })
    cliente.initialize();
}
const withOutSesion = () => {

}
//funcion para escuchar los mensajes
const listenMessage = () => {

}
const sendMessage = (to, message) => {
    cliente.sendMessage(to, message);
}
cliente = new Client({puppeteer: {headless: false}, clientId: 'example'});
cliente.on('qr', (qr) => {
    console.log('qr ready', qr);
    qrcode.generate(qr, {small: true})
})
cliente.on('authenticated', () => {
    console.log('autenticado')
})
cliente.on('ready', () => {
    console.log('listo');
})
cliente.on('message', (msg) => {
    const {from, to, body} = msg;
    switch (body) {
        case 'st':
            sendMedia(from, 'bienvenido.jpg');
            break;
        case 'quioro informacion':
            sendMedia(from, 'bienvenido.jpg');
            break;
        case 'mensaje':
            sendMessage(from, 'el ticket esta atendido (respuesta automatica...)');
            break;
        case 'a':
            sendMessage(from, 'realice el pago con el codigo 2050');
            break;
        default:
            break;
    }
})
cliente.initialize();
const sendMedia = (to, file) => {
    const mediaFile = MessageMedia.fromFilePath(`./media/${file}`);
    cliente.sendMessage(to, mediaFile);
}
// (fs.existsSync(SESION_FILE_PATH)) ? withSesion() : withOutSesion();
app.listen(9000, () => {
    console.log('...api funcionando');
})