<h1 align="center">Süper WhatsApp 🚀</h1>
<p align="center">
  <em>"This is exactly how WhatsApp should work." — the legendary version we always wanted.</em>
</p>
<p align="center">
  <a href="#english">🇬🇧 English</a> &nbsp;|&nbsp; <a href="#türkçe">🇹🇷 Türkçe</a>
</p>

---

<a name="english"></a>
## 🇬🇧 English

### What is this?

SuperWhatsApp is a **locally-running automation layer** on top of WhatsApp Web. Not a SaaS. Not a cloud service. A self-hosted power-user toolbox that runs entirely on your own machine.

It's built for people who spend most of their workday in front of a computer with WhatsApp Web open — and find the default features frustrating.

### ⚡ Features

| Feature | Description |
|---------|-------------|
| 🌍 **Real-time Translation** | Write in your language, it auto-translates and sends. Incoming messages translated on click. |
| 🤖 **Smart Auto-Reply** | Whitelist / Blacklist / All contacts / Unknown contacts modes. Human-like random delay built in. |
| ⏰ **Scheduled Messages** | Schedule messages that **survive restarts** — powered by a persistent disk-based queue. |
| 💣 **Self-Destructing Messages** | Auto-deletes from both sides after 10 seconds. *(Screenshot not protected — documented)* |

### 🏗️ Architecture (Why this isn't just another WA bot)

Most WhatsApp automation projects scatter DOM selectors everywhere. When WhatsApp updates, it's full surgery.

This project uses an isolated **Execution Layer**:

```
execution-layer/whatsappSelectors.js  ← ALL WhatsApp I/O lives here
server.js                             ← Business logic. Knows nothing about DOM.
queueManager.js                       ← Persistent job queue (survives restarts)
logger.js                             ← File-based logging (logs/system.log)
```

**When WhatsApp updates:** Only `whatsappSelectors.js` needs patching. `server.js` is untouched.

### 🛡️ Resilience Features

- **Panic Switch:** 10 consecutive errors → auto-disables auto-reply → UI alert
- **Global Rate Limiter:** Max 5 auto-replies/minute (spam protection)
- **Persistent Cache:** Auto-reply history survives restarts (no double-reply after crash)
- **File Logging:** Every event timestamped to `logs/system.log`

### ⚠️ Honest Disclaimer

> This is a **managed automation tool**, not a stable product.

- Built on `whatsapp-web.js` + Puppeteer (unofficial API)
- WhatsApp DOM changes **will** break things occasionally — this is by design
- Goal: **fast recovery**, not zero breakage
- Not for SaaS. Not for scale. Perfect for personal power-user use.

### 🚀 Quick Start

**Requirements:** Node.js, Google Chrome

```bash
git clone https://github.com/alikokrtv/SuperWhatsapp.git
cd SuperWhatsapp
npm install
node server.js
# Open http://localhost:3000 and scan QR
```

**Windows users:** Just double-click `SüperWhatsApp_Baslat.bat`

### 🔒 Privacy

- ✅ Runs 100% locally — your messages stay on your machine
- ✅ Open source — audit the code yourself
- ⚠️ Translation feature sends text to Google Translate API
- ✅ No analytics, no telemetry, no cloud storage

---

<a name="türkçe"></a>
## 🇹🇷 Türkçe


## 🤔 Derdimiz Ne, Amacımız Ne?
Bugün özellikle beyaz yakalılar ve profesyoneller, mesaisinin büyük bir bölümünü bilgisayar başında, WhatsApp Web açık şekilde geçiriyor. İletişim bu kadar yoğunlaşmışken, resmi uygulamanın sunduğu standart özellikler yetersiz kalıyor. 

Bizim amacımız; **"Nasıl daha üretken, daha gizli ve daha rahat iletişim kurarız?"** sorusuna cevap vermek. Süper WhatsApp bir "SaaS" veya bulut girişimi değildir. Bilgisayarında saatlerini geçiren "Power-User" (Gelişmiş Kullanıcılar) için geliştirilmiş, yerel (local) çalışan açık kaynaklı bir **kişisel asistan** ve **araç kutusudur (toolbox).**

## ⚡ Süper Güçler (Özellikler)

* 🌍 **Anlık ve Kesintisiz Çeviri:** Yabancı müşterilerle veya iş arkadaşlarınızla konuşurken dili dert etmeyin! Siz Türkçe yazın, o saniyesinde İngilizce'ye çevirip göndersin. Gelen İngilizce mesajları da tek tıkla Türkçe'ye çevirin.
* ⏳ **Süreli Mesaj (10s):** Şifre, IBAN veya özel bir bilgi mi gönderiyorsunuz? Mesajı yollayın, sistem 10 saniye sonra her iki taraftan da silmeyi denesin. *(Bkz: Uyarılar)*
* ⏱️ **İleri Tarihli (Zamanlanmış) Mesajlar:** Mesajınızı geceden yazın, "Yarın sabah 09:00'da gönder" deyin. Siz uyurken o tam vaktinde mesajı iletsin.
* 🤖 **Gelişmiş Oto-Yanıt Asistanı:** Bilgisayar başında değil misiniz? Oto-yanıtı açın. Sadece *belirli kişilere (Beyaz Liste)* veya *patron hariç herkese (Kara Liste)* kendi belirlediğiniz özel bir mesajla otomatik dönüş yapın.

---

## 🔒 Güvenlik ve Şeffaflık (Acabalar?)

WhatsApp klonu kullanırken "Acaba mesajlarım başka yere gidiyor mu?" korkusu yaşamak çok doğaldır. İşte tam şeffaflık raporumuz:

1. **Açık Kaynak:** Bu proje %100 açık kaynaktır (Open Source). Kodların içinde ne olduğu tamamen şeffaftır.
2. **Her Şey Sizin Bilgisayarınızda:** Uygulama, arka planda tarayıcınızı (Puppeteer ve whatsapp-web.js) kullanarak WhatsApp Web'i **sizin kendi bilgisayarınızda** çalıştırır.
3. **Veri Toplamıyoruz:** Uygulama, varsayılan olarak kişisel mesajlarınızı veya numaralarınızı uzak bir sunucuya (bizim sunucularımıza) göndermez. Kendi cihazınızın sınırları içinde çalışır.
4. *(Not: Yalnızca çeviri özelliği kullanıldığında, çevrilecek metin anlık olarak Google Translate API'sine iletilip sonucu geri alınır. İleride tamamen çevrimdışı/lokal AI modelleri kullanılarak bu durumun da önüne geçilmesi planlanmaktadır.)*

---

## ⚠️ Sorumluluk Reddi ve Sınırlar (Önemli)
Bu proje, WhatsApp'ın resmi bir ürünü değildir ve standart WhatsApp Web (`whatsapp-web.js` ve `Puppeteer`) özelliklerinin üzerine inşa edilmiş bir otomasyondur.
1. **Süreli Mesaj Sınırları:** "Süreli Mesaj" özelliği, WhatsApp'ın "Herkesten Sil" komutunu otomatik olarak tetikler. Karşı tarafın interneti yoksa, ekran görüntüsü alırsa veya eski bir sürüm kullanıyorsa mesajın silinmesi teknik olarak **garanti edilemez.** (Signal veya Telegram Gizli Sohbet gibi çalışmaz). **Ek teknik not:** Silme işlemi bellekte bir zamanlayıcıyla çalışır — mesaj gönderildikten sonraki 10 saniye içinde sunucu yeniden başlarsa (Panic Switch devreye girerse veya bağlantı kesilirse) zamanlayıcı kaybolur ve mesaj silinmeyebilir.
2. **Çeviri Gizliliği:** Çeviri yaptığınızda metinleriniz dışarıya (Google API) çıkar. Kurumsal sırlar veya çok kritik veriler için çeviri modunu kullanırken dikkatli olun.
3. **Kişisel Araçtır:** Bu kod ticari bir hizmet (SaaS) olarak kullanılmak için değil, kişisel bilgisayarınızda kendi işlerinizi kolaylaştırmak için tasarlanmıştır. Aşırı spam veya otomasyon kullanımı WhatsApp tarafından "anormal davranış" olarak algılanıp hesabınızın kısıtlanmasına neden olabilir. Sorumluluk kullanıcıya aittir.
4. **WhatsApp Web Bağımlılığı (Kritik):** Bu proje, doğrudan WhatsApp Web'in mevcut davranışlarına (DOM ve WebSocket yapılarına) dayanır. WhatsApp (Meta) tarafında yapılacak bir güncelleme, ürünün özelliklerinin geçici veya kalıcı olarak bozulmasına neden olabilir.

---

## 🔮 Yol Haritası (Roadmap)

Süper WhatsApp için geliştirmeyi düşündüğümüz özellikler:

**Yakın Vadede:**
* Zamanlanmış mesaj yönetim ekranı
* Gelişmiş oto-cevap şablonları
* Toplu çeviri arayüzü

**Orta Vadede:**
* Uzun iş mesajlaşmalarını tek tıkla özetleme (Lokal AI ile)

**Araştırma Aşaması (Ar-Ge):**
* Sesli mesajların metne dökülmesi ve çevrilmesi
* Görüntülü konuşmalarda anlık (real-time) çeviri desteği

---

## 🛠️ Nasıl Kurulur ve Çalıştırılır?

Teknik konularla aranız yok mu? Hiç dert etmeyin! Kodu çalışmasını sizin için iki tıkla açılacak hale getirdik.

**Windows Kullanıcıları İçin Kurulum:**
1. Bilgisayarınızda [Node.js](https://nodejs.org) yüklü olduğundan emin olun (Yüklü değilse sitesinden indirip Next diyerek kurun).
2. Bu projeyi bilgisayarınıza indirin ve klasöre çıkartın.
3. Klasörün içindeki **`SüperWhatsApp_Baslat.bat`** dosyasına çift tıklayın!

*(Siyah bir pencere açılacak, ilk açılışta gerekli dosyaları kendisi kuracaktır. Daha sonra tarayıcınız otomatik açılır. Süper WhatsApp'ı kullandığınız süre boyunca o siyah pencereyi aşağıda simge durumunda açık tutun.)*

**Mac/Linux Kullanıcıları:**
Terminali açıp proje dizininde sırasıyla `npm install` ve `node server.js` yazmanız yeterlidir. Daha sonra tarayıcıdan `http://localhost:3000` adresine gidebilirsiniz.

---

## 🏛️ Mimari Felsefe (Bu Projenin Ruhu)

> *Bu bölüm, bu sistemi yazan, kullanan veya katkıda bulunacak olan herkes için yazılmıştır. Kod satırlarından daha önemlidir.*

### Bu Proje Ne Değildir?

Bu proje "WhatsApp'ı geliştirme" girişimi **değildir.** Bu proje bir **mesajlaşma davranışlarını otomatikleştiren yerel automation VM'dir.**

İkisi arasındaki fark her şeyi değiştirir:
- WhatsApp değişirse, **VM'nin execution layer'ı güncellenir.** Ürün ölmez.
- Sisteme yeni özellik eklemek için önce sorulacak soru şudur: *"Bu ekleme, selector izolasyonunu zayıflatır mı?"*

### Kırılma Beklenen Bir Durumdur

Bu sistem **"zero break" hedeflemez, "fast recovery" hedefler.**

WhatsApp Web tabanlı projelerde:
- Ayda 1 küçük kırılma → **normaldir**
- 3–6 ayda 1 büyük kırılma → **normaldir**
- DOM değişimi → **kaçınılmazdır**

Kırıldığında yapılacak şey:
1. `logs/system.log` dosyasını aç, son hatayı bul
2. Hata `execution-layer/whatsappSelectors.js`'de mi? → Sadece onu düzelt
3. `server.js`'e dokunma. Business logic değişmemiştir.

### Mimari Sınırlar (Bozulursa Her Şey Bozulur)

| Katman | Dosya | Sorumluluk |
|--------|-------|------------|
| Business Logic | `server.js` | Uygulama kuralları. DOM bilmez. |
| Execution Layer | `execution-layer/whatsappSelectors.js` | WhatsApp'a özgü TÜM I/O. Tek değişen yer. |
| Queue | `queueManager.js` | Zamanlanmış işler. Restart'a dayanıklı. |
| Logger | `logger.js` | Disk bazlı loglama. Debug körlüğünü önler. |

### En Büyük Risk: Kendi Genişleme İsteğin

Bu sistem zamanla genellikle iki şekilde yaşar:
1. Disiplin korunur → küçük ama sağlam araç olarak yıllarca kalır ✅
2. "Bir şey daha ekleyelim" döngüsüyle şişer → en iyi mimari bile dağılır ❌

**Feature Freeze Kuralı:** Sistem davranışında anomali varken yeni özellik eklenmez. Önce repair, sonra feature.

### Başarı Kriteri

Bu projenin başarısını ölçmek için tek soru:

> *6 ay sonra sistem hâlâ tek modülde DOM bağımlılığıyla, temiz business logic ile, kırılmaları modellenmiş şekilde duruyor mu?*

Evet ise: Başarı.

---
