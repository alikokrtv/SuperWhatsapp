const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const translate = require('google-translate-api-x');
const schedule = require('node-schedule');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { maxHttpBufferSize: 1e8 }); 

app.use(express.static('public'));
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
let cachedChats = [];
let autoReplyConfig = {
    enabled: false,
    message: "🤖 *[Süper WhatsApp Oto-Yanıt]*\nŞu anda bilgisayar başında değilim, daha sonra dönüş yapacağım.",
    mode: 'all',
    targetList: []
};

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        io.emit('qr', url);
        io.emit('log', 'Lütfen QR Kodunu okutun.');
    });
});

async function refreshChats() {
    try {
        const chats = await client.getChats();
        cachedChats = [];
        for (let chat of chats) {
            let lm = null;
            if (chat.lastMessage) {
                lm = {
                    body: chat.lastMessage.body || '',
                    hasMedia: chat.lastMessage.hasMedia,
                    fromMe: chat.lastMessage.fromMe
                };
            }
            cachedChats.push({
                id: chat.id._serialized,
                name: chat.name || chat.id.user,
                timestamp: chat.timestamp,
                unreadCount: chat.unreadCount,
                isArchived: chat.archived, // Fix applied
                lastMessage: lm
            });
        }
        io.emit('chats', cachedChats);
    } catch (err) {
        console.error("Sohbetler çekilemedi: ", err);
    }
}

client.on('ready', async () => {
    isReady = true;
    io.emit('ready', 'Bağlantı başarılı!');
    io.emit('log', 'Süper WhatsApp hazır. Sohbetler yükleniyor...');
    await refreshChats();
});

client.on('loading_screen', (percent, message) => {
    io.emit('log', `WhatsApp Yükleniyor: %${percent} - ${message}`);
});

client.on('authenticated', () => io.emit('authenticated', 'Doğrulandı.'));
client.on('auth_failure', msg => io.emit('log', 'Doğrulama hatası: ' + msg));
client.on('disconnected', (reason) => {
    io.emit('log', 'Bağlantı koptu: ' + reason);
    isReady = false;
});

async function formatMessage(msg) {
    const contact = await msg.getContact();
    let mediaData = null;
    
    if (msg.hasMedia) {
        try {
            const media = await msg.downloadMedia();
            if (media) {
                mediaData = {
                    mimetype: media.mimetype,
                    data: `data:${media.mimetype};base64,${media.data}`,
                    filename: media.filename
                };
            }
        } catch (e) {
            console.error("Medya indirilemedi", e);
        }
    }

    return {
        id: msg.id._serialized,
        chatId: msg.fromMe ? msg.to : msg.from,
        from: msg.fromMe ? 'Sen' : (contact.name || contact.number),
        body: msg.body,
        media: mediaData,
        timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString(),
        isMe: msg.fromMe
    };
}

client.on('message', async msg => {
    const formatted = await formatMessage(msg);
    io.emit('message', formatted);
    refreshChats();

    // OTO-YANIT
    if (autoReplyConfig.enabled && !msg.fromMe) {
        const chat = await msg.getChat();
        if(!chat.isGroup) {
            let shouldReply = false;
            
            if (autoReplyConfig.mode === 'all') {
                shouldReply = true;
            } else if (autoReplyConfig.mode === 'unknown') {
                const contact = await msg.getContact();
                if (!contact.isMyContact) {
                    shouldReply = true;
                }
            } else if (autoReplyConfig.mode === 'whitelist') {
                if (autoReplyConfig.targetList.includes(msg.from)) {
                    shouldReply = true;
                }
            } else if (autoReplyConfig.mode === 'blacklist') {
                if (!autoReplyConfig.targetList.includes(msg.from)) {
                    shouldReply = true;
                }
            }
            
            if (shouldReply) {
                const replyText = autoReplyConfig.message || "🤖 *[Süper WhatsApp Oto-Yanıt]*\nŞu anda bilgisayar başında değilim, daha sonra dönüş yapacağım.";
                client.sendMessage(msg.from, replyText);
            }
        }
    }
});

client.on('typing', (chat) => {
    const chatId = chat.id ? chat.id._serialized : chat;
    io.emit('typing', chatId);
});

client.on('message_revoke_everyone', async (after, before) => {
    if (before) {
        const chatId = before.fromMe ? before.to : before.from;
        io.emit('message_deleted', { id: before.id._serialized, chatId: chatId });
    }
});

console.log('WhatsApp istemcisi başlatılıyor...');
client.initialize().catch(err => console.error('İstemci başlatılırken hata:', err));

io.on('connection', (socket) => {
    if (isReady) {
        socket.emit('ready', 'Zaten bağlı.');
        if(cachedChats.length > 0) socket.emit('chats', cachedChats);
    }
    socket.emit('autoReplyStatus', autoReplyConfig);

    socket.on('setAutoReply', (config) => {
        autoReplyConfig = config;
        io.emit('autoReplyStatus', autoReplyConfig);
    });

    socket.on('getMessages', async (chatId) => {
        try {
            const chat = await client.getChatById(chatId);
            const messages = await chat.fetchMessages({ limit: 50 });
            const formattedMessages = await Promise.all(messages.map(m => formatMessage(m)));
            socket.emit('chatHistory', { chatId, messages: formattedMessages });
        } catch (err) {
            socket.emit('log', 'Mesajlar çekilirken hata: ' + err.message);
        }
    });

    // GELEN MESAJI ÇEVİR
    socket.on('translateText', async (data) => {
        try {
            const res = await translate(data.text, { to: 'tr' });
            socket.emit('translatedText', { msgId: data.msgId, text: res.text });
        } catch(e) {
            socket.emit('log', 'Çeviri hatası: ' + e.message);
        }
    });

    // GİDİCİ MESAJI ÇEVİR (Önizleme İçin)
    socket.on('translateInput', async (data) => {
        try {
            const res = await translate(data.text, { to: data.lang });
            socket.emit('translatedInput', res.text);
        } catch(e) {
            socket.emit('log', 'Çeviri hatası: ' + e.message);
        }
    });

    socket.on('sendMessage', async (data) => {
        const { chatId, message, media, translateTo, selfDestruct, scheduledTime } = data;
        try {
            let finalMessage = message;
            
            // Çeviri İsteği Varsa
            if (translateTo && translateTo !== 'none' && message) {
                try {
                    const res = await translate(message, { to: translateTo });
                    finalMessage = res.text;
                } catch(e) {
                    console.error("Çeviri hatası:", e);
                }
            }

            // Eğer Zaman Ayarlıysa
            if (scheduledTime) {
                const date = new Date(scheduledTime);
                schedule.scheduleJob(date, async function() {
                    try {
                        let msgObj;
                        if (media) {
                            const base64Data = media.data.split(',')[1]; 
                            const mediaContent = new MessageMedia(media.mimetype, base64Data, media.filename);
                            msgObj = await client.sendMessage(chatId, finalMessage, { media: mediaContent });
                        } else {
                            msgObj = await client.sendMessage(chatId, finalMessage);
                        }
                        
                        if (selfDestruct) {
                            setTimeout(() => {
                                msgObj.delete(true).catch(e=>console.log(e));
                            }, 10000);
                        }
                        
                        const formatted = await formatMessage(msgObj);
                        io.emit('message', formatted);
                        
                        io.emit('log', '⏰ Zamanlanmış mesaj gönderildi!');
                        refreshChats();
                    } catch(err) {
                        console.error('Zamanlanmış gönderim hatası:', err);
                    }
                });
                socket.emit('log', '⏰ Mesaj zamanlandı: ' + date.toLocaleString());
                return; // Normal gönderimi durdur
            }

            // Normal Gönderim
            let msgObj;
            if (media) {
                const base64Data = media.data.split(',')[1]; 
                const mediaContent = new MessageMedia(media.mimetype, base64Data, media.filename);
                msgObj = await client.sendMessage(chatId, finalMessage, { media: mediaContent });
            } else {
                msgObj = await client.sendMessage(chatId, finalMessage);
            }
            
            // Kendini İmha Etme (Self-Destruct)
            if (selfDestruct) {
                setTimeout(() => {
                    msgObj.delete(true).catch(e=>console.log(e));
                }, 10000);
            }

            const formatted = await formatMessage(msgObj);
            io.emit('message', formatted);
            refreshChats();
        } catch (err) {
            socket.emit('log', 'Gönderim hatası: ' + err.message);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Süper WhatsApp V3 port ${PORT} üzerinde çalışıyor!`));
