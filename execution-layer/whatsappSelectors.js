/**
 * whatsappSelectors.js — Execution Layer (Disposable)
 * 
 * Bu dosya WhatsApp Web'e özgü TÜM bağımlılıkları içerir.
 * WhatsApp bir güncelleme yaptığında sadece bu dosya düzenlenir.
 * server.js (business logic) bu değişikliklerden habersiz kalır.
 * 
 * Durum: v1 — 2026-06 itibarıyla stabil
 */

const { MessageMedia } = require('whatsapp-web.js');

/**
 * Bir mesajı WhatsApp istemcisi üzerinden gönderir.
 * @param {object} client - whatsapp-web.js Client instance
 * @param {string} chatId - Hedef sohbet ID'si
 * @param {string} message - Gönderilecek metin
 * @param {object|null} media - Base64 medya objesi (opsiyonel)
 * @returns {Promise<object>} - Gönderilen mesaj objesi
 */
async function sendMessage(client, chatId, message, media = null) {
    if (media) {
        const base64Data = media.data.split(',')[1];
        const mediaContent = new MessageMedia(media.mimetype, base64Data, media.filename);
        return await client.sendMessage(chatId, message, { media: mediaContent });
    }
    return await client.sendMessage(chatId, message);
}

/**
 * Bir sohbetin mesaj geçmişini çeker.
 * @param {object} client
 * @param {string} chatId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function fetchChatHistory(client, chatId, limit = 50) {
    const chat = await client.getChatById(chatId);
    return await chat.fetchMessages({ limit });
}

/**
 * Tüm sohbetleri listeler ve önbelleğe uygun formata dönüştürür.
 * @param {object} client
 * @returns {Promise<Array>}
 */
async function fetchAllChats(client) {
    const chats = await client.getChats();
    return chats.map(chat => {
        let lm = null;
        if (chat.lastMessage) {
            lm = {
                body: chat.lastMessage.body || '',
                hasMedia: chat.lastMessage.hasMedia,
                fromMe: chat.lastMessage.fromMe
            };
        }
        return {
            id: chat.id._serialized,
            name: chat.name || chat.id.user,
            timestamp: chat.timestamp,
            unreadCount: chat.unreadCount,
            isArchived: chat.archived,
            lastMessage: lm
        };
    });
}

/**
 * Bir mesaj objesini UI'a göndermek için formatlar.
 * @param {object} msg - whatsapp-web.js Message
 * @returns {Promise<object>}
 */
async function formatMessage(msg) {
    let contact = null;
    try {
        contact = await msg.getContact();
    } catch (err) {
        // Known whatsapp-web.js issue with some IDs (e.g. @lid)
    }

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
            // Medya indirilemedi, null olarak devam et
        }
    }

    let fromName = msg.from;
    if (msg.fromMe) {
        fromName = 'Sen';
    } else if (contact) {
        fromName = contact.name || contact.pushname || contact.number || msg.from;
    }

    return {
        id: msg.id._serialized,
        chatId: msg.fromMe ? msg.to : msg.from,
        from: fromName,
        body: msg.body,
        media: mediaData,
        timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString(),
        isMe: msg.fromMe
    };
}

/**
 * Bir mesajı siler (Süreli Mesaj / Self-Destruct için).
 * @param {object} msgObj - whatsapp-web.js Message
 * @param {number} delayMs - Kaç ms sonra silineceği
 */
function scheduleDelete(msgObj, delayMs = 10000) {
    setTimeout(() => {
        msgObj.delete(true).catch(() => {});
    }, delayMs);
}

module.exports = {
    sendMessage,
    fetchChatHistory,
    fetchAllChats,
    formatMessage,
    scheduleDelete
};
