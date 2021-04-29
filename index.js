const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const {Client, MessageMedia} = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

const SESION_FILE_PATH = './session.json';
let cliente;
let sessionData;

app.use(express.urlencoded({extended: true}))

const sendWithApi = (req, res) => {
    const {message, to} = req.body;
    sendMessage(`51${to}@c.us`,message);
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
    console.log('sin session. Generando QR...');
    cliente = new Client();
    cliente.on('qr', (qr) => {
        console.log('qr ready', qr);
        qrcode.generate(qr, {small: true})
    })

    cliente.on('authenticated', (s) => {
        sessionData = s;
        fs.writeFile(SESION_FILE_PATH, JSON.stringify(s), (err) => {
            if (err) console.log(err);
        })
    })

    cliente.on('ready', () => {
        console.log('cliente ready');
    })
    cliente.initialize();
}

//funcion para escuchar los mensajes
const listenMessage = () => {
    cliente.on('message', (msg) => {
        const {from, to, body} = msg;
        switch (body) {
            case 'quiero informacion':
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
}

const sendMessage = (to, message) => {
    cliente.sendMessage(to, message);
}

const sendMedia = (to, file) => {
    const mediaFile = MessageMedia.fromFilePath(`./media/${file}`);
    cliente.sendMessage(to, mediaFile);
}

(fs.existsSync(SESION_FILE_PATH)) ? withSesion() : withOutSesion();

app.listen(9000, () => {
    console.log('...api funcionando');
})