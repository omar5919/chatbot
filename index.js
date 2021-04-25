const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const { Client } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');

const SESION_FILE_PATH = './session.json';
let cliente;
let sessionData;


const withSesion = () => {
    console.log('con sesion');
    const spinner = ora(`Cargando ${chalk.yellow('Validando sesion...')}`);
    sessionData = require(SESION_FILE_PATH);
    spinner.start();
    cliente = new Client({ session: sessionData })
    cliente.on('ready', () => {
        console.log('Cliente ready');
        spinner.stop();
    })
    cliente.on('auth_failure', () => {
        console.log('finalizo la sesion');
        spinner.stop();
    })
    cliente.initialize();
}

const withOutSesion = () => {
    console.log('sin session');
    cliente = new Client();
    cliente.on('qr', (qr) => {
        console.log('qr ready', qr);
        qrcode.generate(qr, { small: true })
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

(fs.existsSync(SESION_FILE_PATH)) ? withSesion() : withOutSesion();