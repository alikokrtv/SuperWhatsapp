const socket = io();

const qrContainer = document.getElementById('qrContainer');
const qrcodeImg = document.getElementById('qrcode');
const qrLoader = document.getElementById('qrLoader');
const statusLog = document.getElementById('status-log');

const chatFilters = document.getElementById('chatFilters');
const filterBtns = document.querySelectorAll('.filter-btn');
const chatsList = document.getElementById('chatsList');

const activeChatName = document.getElementById('activeChatName');
const statusDot = document.getElementById('statusDot');
const messagesList = document.getElementById('messagesList');
const chatInputArea = document.getElementById('chatInputArea');

const sendBtn = document.getElementById('sendBtn');
const targetMessage = document.getElementById('targetMessage');

const autoReplyToggle = document.getElementById('autoReplyToggle');
const mediaUpload = document.getElementById('mediaUpload');
const mediaPreview = document.getElementById('mediaPreview');
const mediaFileName = document.getElementById('mediaFileName');
const clearMediaBtn = document.getElementById('clearMediaBtn');
const toastContainer = document.getElementById('toastContainer');
const attachBtn = document.getElementById('attachBtn');

// V3 Superpowers
const translateSelect = document.getElementById('translateSelect');
const selfDestructToggle = document.getElementById('selfDestructToggle');
const scheduleInput = document.getElementById('scheduleInput');

let isConnected = false;
let currentChatId = null;
let allChats = [];
let currentFilter = 'all';
let selectedMedia = null;
let typingTimeout = null;
let lastTranslationNonce = null; // Race condition koruması için modül seviyesi nonce

socket.on('log', (msg) => { statusLog.innerText = msg; });

socket.on('qr', (url) => {
    if (!isConnected) {
        qrLoader.style.display = 'none';
        qrcodeImg.src = url;
        qrcodeImg.style.display = 'block';
    }
});

socket.on('ready', (msg) => {
    isConnected = true;
    qrContainer.style.display = 'none';
    statusLog.style.display = 'none'; // Artık başarılı bağlandığında gizle
    statusDot.classList.add('online');
    chatFilters.style.display = 'flex';
    chatsList.style.display = 'block';
});

socket.on('authenticated', () => { 
    statusLog.style.display = 'block';
    statusLog.innerText = 'Doğrulandı, oturum açılıyor...'; 
});

// OTO-YANIT YÖNETİCİSİ (MODAL)
const openAutoReplyModalBtn = document.getElementById('openAutoReplyModalBtn');
const autoReplyModal = document.getElementById('autoReplyModal');
const closeAutoReplyModalBtn = document.getElementById('closeAutoReplyModalBtn');
const saveAutoReplyBtn = document.getElementById('saveAutoReplyBtn');

const modalAutoReplyToggle = document.getElementById('modalAutoReplyToggle');
const modalAutoReplyMessage = document.getElementById('modalAutoReplyMessage');
const modalAutoReplyMode = document.getElementById('modalAutoReplyMode');
const modalTargetSelection = document.getElementById('modalTargetSelection');
const targetSearchInput = document.getElementById('targetSearchInput');
const targetSearchResults = document.getElementById('targetSearchResults');
const addTargetBtn = document.getElementById('addTargetBtn');
const targetChipsContainer = document.getElementById('targetChipsContainer');

let autoReplyTargets = [];

// Modal aç/kapat
if(openAutoReplyModalBtn) {
    openAutoReplyModalBtn.addEventListener('click', () => {
        autoReplyModal.style.display = 'flex';
    });
}
if(closeAutoReplyModalBtn) {
    closeAutoReplyModalBtn.addEventListener('click', () => {
        autoReplyModal.style.display = 'none';
    });
}

// Mod değiştiğinde kişi seçim kutusunu göster/gizle
modalAutoReplyMode.addEventListener('change', () => {
    if (modalAutoReplyMode.value === 'whitelist' || modalAutoReplyMode.value === 'blacklist') {
        modalTargetSelection.style.display = 'flex';
    } else {
        modalTargetSelection.style.display = 'none';
    }
});

function renderTargetChips() {
    targetChipsContainer.innerHTML = '';
    autoReplyTargets.forEach((target, index) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        // İsmi bulmaya çalış
        let targetName = target;
        const found = allChats.find(c => c.id === target);
        if(found) targetName = found.name;

        chip.innerHTML = `<span>${targetName}</span><span class="remove-chip" data-index="${index}">&times;</span>`;
        targetChipsContainer.appendChild(chip);
    });

    document.querySelectorAll('.remove-chip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.target.getAttribute('data-index');
            autoReplyTargets.splice(idx, 1);
            renderTargetChips();
        });
    });
}

// Kişi arama
targetSearchInput.addEventListener('input', () => {
    const query = targetSearchInput.value.toLowerCase();
    targetSearchResults.innerHTML = '';
    if (!query) {
        targetSearchResults.style.display = 'none';
        return;
    }
    
    const results = allChats.filter(c => c.name.toLowerCase().includes(query));
    if (results.length > 0) {
        targetSearchResults.style.display = 'block';
        results.slice(0, 10).forEach(chat => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            div.innerText = chat.name;
            div.addEventListener('click', () => {
                if(!autoReplyTargets.includes(chat.id)) {
                    autoReplyTargets.push(chat.id);
                    renderTargetChips();
                }
                targetSearchInput.value = '';
                targetSearchResults.style.display = 'none';
            });
            targetSearchResults.appendChild(div);
        });
    } else {
        targetSearchResults.style.display = 'none';
    }
});

// Kaydet Butonu
if(saveAutoReplyBtn) {
    saveAutoReplyBtn.addEventListener('click', () => {
        socket.emit('setAutoReply', {
            enabled: modalAutoReplyToggle.checked,
            mode: modalAutoReplyMode.value,
            message: modalAutoReplyMessage.value,
            targetList: autoReplyTargets
        });
        autoReplyModal.style.display = 'none';
        showToast('Oto-Yanıt ayarları kaydedildi!');
    });
}

// Sunucudan mevcut durumu al
socket.on('autoReplyStatus', (config) => {
    modalAutoReplyToggle.checked = config.enabled;
    modalAutoReplyMode.value = config.mode || 'all';
    if(config.message) {
        modalAutoReplyMessage.value = config.message;
    }
    if(config.targetList) {
        autoReplyTargets = config.targetList;
    }
    
    if (modalAutoReplyMode.value === 'whitelist' || modalAutoReplyMode.value === 'blacklist') {
        modalTargetSelection.style.display = 'flex';
        renderTargetChips();
    } else {
        modalTargetSelection.style.display = 'none';
    }
});

// CHAT FILTERING & PREVIEWS
socket.on('chats', (chats) => {
    allChats = chats;
    renderChats();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderChats();
    });
});

function renderChats() {
    chatsList.innerHTML = '';
    
    let filtered = allChats;
    if (currentFilter === 'unread') {
        filtered = allChats.filter(c => c.unreadCount > 0);
    } else if (currentFilter === 'archived') {
        filtered = allChats.filter(c => c.isArchived);
    } else {
        filtered = allChats.filter(c => !c.isArchived);
    }

    if(filtered.length === 0) {
        chatsList.innerHTML = '<div style="color:var(--text-muted); padding:15px; text-align:center;">Sohbet bulunamadı.</div>';
        return;
    }

    filtered.forEach(chat => {
        const chatDiv = document.createElement('div');
        chatDiv.classList.add('chat-item');
        if(chat.id === currentChatId) chatDiv.classList.add('active');
        
        let previewText = '';
        if (chat.lastMessage) {
            if (chat.lastMessage.hasMedia) {
                previewText = '📷 Medya';
            } else {
                previewText = chat.lastMessage.body || '';
            }
            if (chat.lastMessage.fromMe) {
                previewText = 'Sen: ' + previewText;
            }
        }

        chatDiv.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-name">
                    ${escapeHTML(chat.name)}
                    ${chat.isArchived ? '<span title="Arşivlenmiş" style="font-size:0.8rem;">🗃️</span>' : ''}
                </div>
                <div class="chat-item-preview">${escapeHTML(previewText)}</div>
            </div>
            ${chat.unreadCount > 0 ? `<div class="chat-item-badge">${chat.unreadCount}</div>` : ''}
        `;
        
        chatDiv.addEventListener('click', () => {
            document.querySelectorAll('.chat-item').forEach(el => el.classList.remove('active'));
            chatDiv.classList.add('active');
            openChat(chat.id, chat.name);
        });
        
        chatsList.appendChild(chatDiv);
    });
}

socket.on('chatHistory', (data) => {
    if(data.chatId !== currentChatId) return;
    
    messagesList.innerHTML = '';
    if(data.messages.length === 0) {
        messagesList.innerHTML = '<div class="welcome-message"><h3>Mesaj Yok</h3><p>Burada hiç mesaj bulunamadı.</p></div>';
    } else {
        data.messages.forEach(msg => appendMessage(msg, false));
        messagesList.scrollTop = messagesList.scrollHeight;
    }
});

socket.on('message', (data) => {
    if(data.chatId === currentChatId) {
        appendMessage(data, true);
    } else if (!data.isMe) {
        showToast(`💬 <b>${escapeHTML(data.from)}</b>: ${escapeHTML(data.media ? '📷 Medya' : data.body)}`, () => {
            openChat(data.chatId, data.from);
        });
    }
});

// TRANSLATION RESPONSE
socket.on('translatedText', (data) => {
    const msgDiv = document.getElementById('msg-' + data.msgId);
    if (msgDiv) {
        let transDiv = msgDiv.querySelector('.translated-text');
        if (!transDiv) {
            transDiv = document.createElement('div');
            transDiv.className = 'translated-text';
            msgDiv.appendChild(transDiv);
        }
        transDiv.innerText = "🇹🇷 " + data.text;
        
        // Buton yazısını düzelt
        const btn = msgDiv.querySelector('.translate-btn');
        if (btn) btn.innerText = '✅ Çevrildi';
    }
});

// INPUT ÇEVİRİ ÖNİZLEMESİ
const translateInputBtn = document.getElementById('translateInputBtn');
const translationPreviewBox = document.getElementById('translationPreviewBox');
const previewText = document.getElementById('previewText');
const usePreviewBtn = document.getElementById('usePreviewBtn');

let typingTranslateTimeout = null;

function triggerTranslation() {
    const text = targetMessage.value.trim();
    const lang = translateSelect.value;
    if (!text || lang === 'none') {
        translationPreviewBox.style.display = 'none';
        if (translateInputBtn) translateInputBtn.innerText = '🔄 Önizle';
        return;
    }
    if (translateInputBtn) translateInputBtn.innerText = '⏳';
    const nonce = Date.now() + '_' + Math.random();
    lastTranslationNonce = nonce; // modül seviyesi değişken
    socket.emit('translateInput', { text, lang, nonce });
}

if (translateInputBtn) {
    translateInputBtn.addEventListener('click', triggerTranslation);
}

// OTOMATİK ÇEVİRİ (YAZARKEN)
targetMessage.addEventListener('input', () => {
    if (translateSelect.value === 'none') return;
    
    clearTimeout(typingTranslateTimeout);
    typingTranslateTimeout = setTimeout(() => {
        triggerTranslation();
    }, 600);
});

translateSelect.addEventListener('change', () => {
    triggerTranslation();
});

socket.on('translatedInput', (data) => {
    // Nonce kontrolü: sadece en son isteğe ait yanıt işlenir
    if (data.nonce !== lastTranslationNonce) return;
    if (translationPreviewBox) {
        translationPreviewBox.style.display = 'flex';
        previewText.innerText = data.text;
    }
    if (translateInputBtn) translateInputBtn.innerText = '🔄 Çevir';
});

if (usePreviewBtn) {
    usePreviewBtn.addEventListener('click', () => {
        targetMessage.value = previewText.innerText;
        translationPreviewBox.style.display = 'none';
    });
}

// HIZLI ZAMAN SEÇİMİ
const quickSchedule = document.getElementById('quickSchedule');

if (quickSchedule && scheduleInput) {
    quickSchedule.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        
        if (val === 'clear') {
            scheduleInput.value = '';
            setTimeout(() => { quickSchedule.value = ''; }, 100);
            return;
        }

        const now = new Date();
        if (val === '5m') now.setMinutes(now.getMinutes() + 5);
        if (val === '15m') now.setMinutes(now.getMinutes() + 15);
        if (val === '1h') now.setHours(now.getHours() + 1);
        if (val === 'tomorrow') {
            now.setDate(now.getDate() + 1);
            now.setHours(9, 0, 0, 0);
        }
        
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - tzoffset)).toISOString().slice(0,16);
        scheduleInput.value = localISOTime;
        
        setTimeout(() => { quickSchedule.value = ''; }, 500);
    });
}

// TYPING INDICATOR
socket.on('typing', (chatId) => {
    if (chatId === currentChatId) {
        let indicator = document.getElementById('typingIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'typingIndicator';
            indicator.className = 'typing-indicator';
            indicator.innerText = 'Yazıyor...';
            document.querySelector('.chat-title').appendChild(indicator);
        }
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            if (indicator) indicator.remove();
        }, 2000);
    }
});

// ANTI-DELETE
socket.on('message_deleted', (data) => {
    if(data.chatId === currentChatId) {
        const msgElement = document.getElementById('msg-' + data.id);
        if(msgElement) {
            const badge = document.createElement('div');
            badge.className = 'anti-delete-badge';
            badge.innerText = '🚫 Silindi';
            msgElement.appendChild(badge);
        }
    }
});

function openChat(chatId, chatName) {
    currentChatId = chatId;
    activeChatName.innerText = chatName;
    chatInputArea.style.display = 'flex';
    messagesList.innerHTML = '<div class="welcome-message"><h3>Yükleniyor...</h3><p>Geçmiş mesajlar çekiliyor.</p></div>';
    socket.emit('getMessages', chatId);
    
    document.querySelectorAll('.toast').forEach(t => t.remove());
}

// MEDIA UPLOAD
attachBtn.addEventListener('click', () => mediaUpload.click());

mediaUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 50 * 1024 * 1024) { 
            alert('Dosya boyutu 50MB den küçük olmalıdır.');
            mediaUpload.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            selectedMedia = {
                data: event.target.result,
                mimetype: file.type,
                filename: file.name
            };
            mediaFileName.innerText = '📎 ' + file.name;
            mediaPreview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }
});

clearMediaBtn.addEventListener('click', () => {
    selectedMedia = null;
    mediaUpload.value = '';
    mediaPreview.style.display = 'none';
});

// SEND MESSAGE (V3 SUPERPOWERS INCLUDED)
sendBtn.addEventListener('click', () => {
    const message = targetMessage.value.trim();

    if (!currentChatId || (!message && !selectedMedia)) return;

    sendBtn.disabled = true;
    
    socket.emit('sendMessage', { 
        chatId: currentChatId, 
        message: message, 
        media: selectedMedia,
        translateTo: translateSelect.value,
        selfDestruct: selfDestructToggle.checked,
        scheduledTime: scheduleInput.value || null
    });
    
    targetMessage.value = '';
    clearMediaBtn.click(); 
    
    // Sadece zaman ayarlıysa bildirim göster, yoksa anında gitsin
    if (scheduleInput.value) {
        showToast('⏰ Mesajınız zamanlandı!', null);
        scheduleInput.value = ''; // Sıfırla
    }
    
    selfDestructToggle.checked = false; // Sıfırla
    
    // Çeviri kutusunu gizle ama DİL SEÇİMİNİ SIFIRLAMA (kullanıcı aynı dilde yazmaya devam etsin)
    const translationPreviewBox = document.getElementById('translationPreviewBox');
    if (translationPreviewBox) translationPreviewBox.style.display = 'none';
    
    setTimeout(() => {
        sendBtn.disabled = false;
        targetMessage.focus();
    }, 500);
});

targetMessage.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendBtn.click();
    }
});

function appendMessage(data, autoScroll = true) {
    const welcome = document.querySelector('.welcome-message');
    if (welcome) welcome.style.display = 'none';

    // Eğer zaten ekliyse ekleme
    if(document.getElementById('msg-' + data.id)) return;

    const msgDiv = document.createElement('div');
    msgDiv.id = 'msg-' + data.id;
    msgDiv.classList.add('message');
    msgDiv.classList.add(data.isMe ? 'out' : 'in');

    let mediaHtml = '';
    if (data.media) {
        if (data.media.mimetype.startsWith('image/')) {
            mediaHtml = `<div class="media-container"><img src="${data.media.data}" alt="Görsel"></div>`;
        } else if (data.media.mimetype.startsWith('video/')) {
            mediaHtml = `<div class="media-container"><video src="${data.media.data}" controls></video></div>`;
        } else if (data.media.mimetype.startsWith('audio/')) {
            mediaHtml = `<div class="media-container" style="background:transparent;"><audio src="${data.media.data}" controls style="width:250px;"></audio></div>`;
        } else {
            // XSS fix: filename DOM'a text olarak set edilecek, innerHTML degil
            const mediaDiv = document.createElement('div');
            mediaDiv.className = 'media-container';
            mediaDiv.style.cssText = 'padding:10px; background:#1e293b;';
            const link = document.createElement('a');
            link.href = data.media.data;
            link.download = data.media.filename || 'dosya';
            link.style.cssText = 'color:var(--primary); text-decoration:none;';
            link.textContent = '📎 İndir: ' + (data.media.filename || 'Dosya');
            mediaDiv.appendChild(link);
            mediaHtml = mediaDiv.outerHTML;
        }
    }

    msgDiv.innerHTML = `
        <div class="msg-sender">${escapeHTML(data.from)}</div>
        ${mediaHtml}
        <div class="msg-body">${escapeHTML(data.body)}</div>
        <span class="msg-time">${escapeHTML(data.timestamp)}</span>
    `;

    // Karşıdan gelen mesajsa Çevir butonu ekle
    if (!data.isMe && data.body) {
        const transBtn = document.createElement('button');
        transBtn.className = 'translate-btn';
        transBtn.innerText = '🇹🇷 Çevir';
        transBtn.onclick = () => {
            transBtn.innerText = 'Çevriliyor...';
            transBtn.disabled = true;
            socket.emit('translateText', { msgId: data.id, text: data.body });
        };
        msgDiv.appendChild(transBtn);
    }

    messagesList.appendChild(msgDiv);
    if (autoScroll) messagesList.scrollTop = messagesList.scrollHeight;
}

function escapeHTML(str) {
    if(!str) return '';
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML.replace(/\n/g, '<br>');
}

function showToast(message, onClickCallback) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    
    if (onClickCallback) {
        toast.addEventListener('click', onClickCallback);
    }
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
