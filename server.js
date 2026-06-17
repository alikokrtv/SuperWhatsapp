const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const translate = require('google-translate-api-x');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const queueManager = require('./queueManager');
const logger = require('./logger');
const wa = require('./execution-layer/whatsappSelectors');

const CACHE_FILE = path.join(__dirname, 'cache.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');
let consecutiveErrors = 0; // Panic Switch için hata sayacı

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { maxHttpBufferSize: 1e8 }); 

app.use(express.static('public'));
app.use(express.json());

// Cross-platform Chrome yolu: Ortam değişkeni varsa onu kullan, yoksa platform'a göre otomatik bul
function getChromePath() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    if (process.platform === 'win32') return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    // Linux — chromium veya google-chrome
    return process.env.CHROMIUM_PATH || 'google-chrome';
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: getChromePath(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
let queueStarted = false; // Queue Manager tek seferlik başlatma koruğu
let cachedChats = [];
const DEFAULT_AUTO_REPLY = {
    enabled: false,
    message: "🤖 *[Süper WhatsApp Oto-Yanıt]*\nŞu anda bilgisayar başında değilim, daha sonra dönüş yapacağım.",
    mode: 'all',
    targetList: []
};

// autoReplyConfig'i diskten yükle (restart kaliciligi)
let autoReplyConfig = DEFAULT_AUTO_REPLY;
if (fs.existsSync(CONFIG_FILE)) {
    try {
        autoReplyConfig = { ...DEFAULT_AUTO_REPLY, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
        logger.info('Oto-yanıt ayarları diskten yüklendi.');
    } catch(e) { logger.error('Config okuma hatası:', e); }
}

function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(autoReplyConfig, null, 2));
    } catch(e) { logger.error('Config kaydedilemedi:', e); }
}

// --- Anti-Spam Koruması (Memory + Cache) ---
let recentAutoReplies = new Map();
if (fs.existsSync(CACHE_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        recentAutoReplies = new Map(Object.entries(data));
    } catch(e) { logger.error("Cache okuma hatası", e); }
}

function saveCache() {
    try {
        const obj = Object.fromEntries(recentAutoReplies);
        fs.writeFileSync(CACHE_FILE, JSON.stringify(obj));
    } catch(e) {}
}

// Global limit: 1 dakikada maks 5 oto-yanıt atılsın
let globalAutoReplyCount = 0;
setInterval(() => {
    globalAutoReplyCount = 0;
    saveCache(); // Dakikada bir cache'i kaydet
}, 60000);

function handlePanicSwitch(errDetails) {
    consecutiveErrors++;
    logger.error("Hata tespit edildi, ardışık hata sayısı: " + consecutiveErrors, errDetails);
    
    if (consecutiveErrors >= 10 && autoReplyConfig.enabled) {
        autoReplyConfig.enabled = false;
        logger.warn("PANİK ANAHTARI (PANIC SWITCH) TETİKLENDİ: Oto-yanıt otomatik kapatıldı.");
        io.emit('log', '🚨 SİSTEM PANİK MODUNDA: Çok fazla hata alındığı için güvenliğiniz adına Oto-yanıt kapatıldı!');
        io.emit('autoReplyStatus', autoReplyConfig);
    }
}

function resetPanicSwitch() {
    if (consecutiveErrors > 0) {
        consecutiveErrors = 0;
        logger.info("İşlem başarılı, panik sayacı sıfırlandı.");
    }
}


client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        io.emit('qr', url);
        io.emit('log', 'Lütfen QR Kodunu okutun.');
    });
});

async function refreshChats() {
    try {
        cachedChats = await wa.fetchAllChats(client);
        io.emit('chats', cachedChats);
    } catch (err) {
        logger.error("Sohbetler çekilemedi:", err);
    }
}

client.on('ready', async () => {
    isReady = true;
    io.emit('ready', 'Bağlantı başarılı!');
    io.emit('log', 'Süper WhatsApp hazır. Sohbetler yükleniyor...');
    await refreshChats();
    
    // Queue Manager sadece bir kez başlatılsın
    if (!queueStarted) {
        queueStarted = true;
        queueManager.startQueue(client, io);
    }
});

client.on('loading_screen', (percent, message) => {
    logger.info(`WhatsApp Yükleniyor: %${percent} - ${message}`);
    io.emit('log', `WhatsApp Yükleniyor: %${percent} - ${message}`);
});

client.on('authenticated', () => {
    logger.info("Kimlik doğrulandı.");
    io.emit('authenticated', 'Doğrulandı.');
});
client.on('auth_failure', msg => {
    logger.error('Doğrulama hatası:', msg);
    io.emit('log', 'Doğrulama hatası: ' + msg);
});
client.on('disconnected', (reason) => {
    logger.error('Bağlantı koptu:', reason);
    io.emit('log', 'Bağlantı koptu: ' + reason);
    isReady = false;
    handlePanicSwitch('WhatsApp Disconnected');
});

async function formatMessage(msg) {
    return await wa.formatMessage(msg);
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
                // Anti-Spam Koruması: Aynı kişiye 60 saniyede bir defadan fazla oto-yanıt atma
                // Ve Global limit (dakikada 5) aşılmamalı
                const now = Date.now();
                const lastReplyTime = recentAutoReplies.get(msg.from) || 0;
                
                if (now - lastReplyTime > 60000 && globalAutoReplyCount < 5) {
                    recentAutoReplies.set(msg.from, now);
                    globalAutoReplyCount++;

                    const replyText = autoReplyConfig.message || "🤖 *[Süper WhatsApp Oto-Yanıt]*\nŞu anda bilgisayar başında değilim, daha sonra dönüş yapacağım.";
                    
                    // İnsan benzeri rastgele gecikme (1.5 - 3.5 saniye arası)
                    const randomDelay = Math.floor(Math.random() * 2000) + 1500;
                    setTimeout(() => {
                        client.sendMessage(msg.from, replyText).then(() => {
                            logger.info(`Oto-yanıt gönderildi: ${msg.from}`);
                            resetPanicSwitch();
                        }).catch(e => {
                            handlePanicSwitch(e);
                        });
                    }, randomDelay);
                } else {
                    logger.warn(`Oto-yanıt atlandı. (Spam Koruması). Kimden: ${msg.from}`);
                    io.emit('log', '⚠️ Oto-Yanıt Atlandı: Spam koruması veya saatlik limit devrede.');
                }
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

logger.info('WhatsApp istemcisi başlatılıyor...');
client.initialize().catch(err => {
    logger.error('İstemci başlatılırken hata:', err);
});

io.on('connection', (socket) => {
    if (isReady) {
        socket.emit('ready', 'Zaten bağlı.');
        if(cachedChats.length > 0) socket.emit('chats', cachedChats);
    }
    
    socket.emit('autoReplyStatus', autoReplyConfig);

    socket.on('setAutoReply', (config) => {
        autoReplyConfig = config;
        saveConfig(); // Restart'a karşı diske kaydet
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

    // GİDİCİ MESAJI ÇEVİR (Önizleme İçin) - nonce ile race condition önlendi
    socket.on('translateInput', async (data) => {
        try {
            const res = await translate(data.text, { to: data.lang });
            socket.emit('translatedInput', { text: res.text, nonce: data.nonce });
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
                queueManager.addJob(chatId, finalMessage, scheduledTime, media);
                socket.emit('log', `⏰ Mesaj kuyruğa eklendi: ${new Date(scheduledTime).toLocaleString()}`);
                return; // Normal gönderimi durdur
            }

            // Normal Gönderim
            let msgObj = await wa.sendMessage(client, chatId, finalMessage, media);
            
            // Kendini İmha Etme (Self-Destruct)
            if (selfDestruct) {
                wa.scheduleDelete(msgObj, 10000);
            }

            const formatted = await wa.formatMessage(msgObj);
            io.emit('message', formatted);
            refreshChats();
            resetPanicSwitch();
        } catch (err) {
            socket.emit('log', 'Gönderim hatası: ' + err.message);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Süper WhatsApp V3 port ${PORT} üzerinde çalışıyor!`));
