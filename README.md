<h1 align="center">Süper WhatsApp 🚀</h1>
<p align="center">
  <em>"WhatsApp tam olarak böyle olmalı kardeşim!" dediğimiz o efsane sürüm.</em>
</p>

---

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
1. **Süreli Mesaj Sınırları:** "Süreli Mesaj" özelliği, WhatsApp'ın "Herkesten Sil" komutunu otomatik olarak tetikler. Karşı tarafın interneti yoksa, ekran görüntüsü alırsa veya eski bir sürüm kullanıyorsa mesajın silinmesi teknik olarak **garanti edilemez.** (Signal veya Telegram Gizli Sohbet gibi çalışmaz).
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
