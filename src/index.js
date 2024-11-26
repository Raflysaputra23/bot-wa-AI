/* eslint-disable no-unused-vars */
const { DisconnectReason, makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const ParsingMessage = require('./services/ParsingMessage');
const DownloadMedia = require('./services/DownloadMedia');
const { Help } = require('./services/TemplateChat');
const ChatAi = require('./services/ChatAi');
const RafAI = require('./services/RafAi');
const sharp = require('sharp');
const Jawaban = require('./services/Jawaban');
const TebakGambar = require('./services/TebakGambar');
const GeminiAI = require('./services/GeminiAi');

async function connectToWhatsApp () {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        passive: false
    })
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    
    const { default: PQueue } = await import('p-queue');
    const messageQueue = new PQueue({ concurrency: 3 });

    sock.ev.on('messages.upsert', async m => {
        messageQueue.add(async () => {
            try {
                
                // console.log(JSON.stringify(m, undefined, 2))
                const msg = m.messages[0].message?.conversation;
                const senderID = m.messages[0].key.remoteJid;
                
                if(msg?.toLowerCase().startsWith('!help')) {
                    await sock.sendMessage(senderID, { text: Help });
                } else if(m.messages[0].message?.imageMessage?.caption.toLowerCase().startsWith('!sticker') && m.messages[0].message?.imageMessage) {
                    const mediaData = await DownloadMedia(m.messages[0], sock);
                    const buffer = await sharp(mediaData).resize(512,512).toFormat('webp').toBuffer();
                    await sock.sendMessage(senderID, { sticker: buffer, caption: 'Sticker by Rafly' });
                } else if(m.messages[0].message?.videoMessage?.caption.toLowerCase().startsWith('!gif') && m.messages[0].message?.videoMessage) {
                    const buffer = await DownloadMedia(m.messages[0], sock);
                    await sock.sendMessage(senderID, { gifPlayback: true, video: buffer });
                } else if(msg?.toLowerCase().startsWith('!chatai') || m.messages[0].message?.imageMessage?.caption.toLowerCase().startsWith('!chatai')) {
                        // const id = senderID.replace('@s.whatsapp.net', '').trim();
                        await sock.sendMessage(senderID, { text: '*Sedang mengetik...*' });
                        if(m.messages[0].message.imageMessage) {
                            const text = ParsingMessage(m.messages[0].message.imageMessage.caption, '!chatai');
                            const mediaData = await DownloadMedia(m.messages[0], sock);
                            const mimeType = m.messages[0].message.imageMessage.mimetype;
                            const answer = await GeminiAI(text, { buffer: mediaData, mimeType }); 
                            await sock.sendMessage(senderID, { text: answer });
                        } else {
                            const text = ParsingMessage(msg, '!chatai');
                            const answer = await GeminiAI(text); 
                            await sock.sendMessage(senderID, { text: answer });
                        }
                        // console.log(msg)
                        // await sock.sendMessage(senderID, { text:"*Maaf RafAI sedang tidak bisa menjawab*"});
                        // const response = await RafAI(msg, id);
                        // const answer = response.choices[0].message.content;
                        // console.log(id);
                        // const answer = response;
                        // await sock.sendMessage(senderID, { text: answer });
                    
                } else if(m.messages[0].message?.extendedTextMessage?.text.toLowerCase().startsWith('!kick')) {  
                    const groupId = m.messages[0].key.remoteJid;
                    const userId = m.messages[0].message.extendedTextMessage.contextInfo.mentionedJid;
                    if(userId.includes('6285758960228@s.whatsapp.net')) return await sock.sendMessage(senderID, { text: '*Eits anda tidak bisa kick saya!s*' }); 
                    await sock.groupParticipantsUpdate( groupId, userId, "remove" );
                    await sock.sendMessage(senderID, { text: 'User telah di kick' });          
                } else if(msg?.toLowerCase().startsWith('!linkgrup')) {
                    const groupId = m.messages[0].key.remoteJid;
                    const code = await sock.groupInviteCode(groupId);
                    await sock.sendMessage(senderID, { text: `link group: https://chat.whatsapp.com/${code}` });
                } else if(msg?.toLowerCase().startsWith('!adduser')) {
                    const groupId = m.messages[0].key.remoteJid;
                    const userId = [`${msg.replace('!addUser ', '').trim()}@s.whatsapp.net`];
                    await sock.groupParticipantsUpdate( groupId, userId, "add" );
                    await sock.sendMessage(senderID, { text: 'User telah ditambahkan' });    
                } else if(msg?.toLowerCase().startsWith('!tebakgambar')) {
                    if(((await Jawaban(false, 'get')).jawaban) != false) {
                        await sock.sendMessage(senderID, { text: '*Jawab dulu pertanyaan sebelumnya*' });
                    } else {
                        const { img, jawaban } = await TebakGambar();
                        const buffer = await sharp(img).resize(800,800).toFormat('webp').toBuffer();
                        try {
                            await Jawaban(jawaban, 'add');
                            await sock.sendMessage(senderID, { sticker: buffer, caption: 'Tebak gambar' });
                        } catch(error) {
                            await sock.sendMessage(senderID, { text: "*Maaf gambar tidak bisa dirender*"});
                            await Jawaban(false, 'delete');
                        }
                    }
                } else if(msg?.toLowerCase().startsWith('!tebak')) {
                    if(((await Jawaban(false, 'get')).jawaban) == false) {
                        await sock.sendMessage(senderID, { text: '*Pertanyaan belum ditentukan*' });
                    } else {
                        if(ParsingMessage(msg, 'tebak').toLowerCase() === ((await Jawaban(false, 'get')).jawaban)) {
                            await sock.sendMessage(senderID, { text: '*Tebakan Anda Benar*' });
                            await Jawaban(false, 'delete');
                        } else {
                            await sock.sendMessage(senderID, { text: `*Tebakan anda salah*` });
                        }
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })

    })

    await messageQueue.onIdle();

    sock.ev.on('creds.update', saveCreds);    
}

// run in main file
connectToWhatsApp()