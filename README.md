<h1 align="center">Süper WhatsApp 🚀</h1>
<p align="center">
  <em>"WhatsApp tam olarak böyle olmalı kardeşim!" dediğimiz o efsane sürüm.</em>
</p>

---

## 🤔 Derdimiz Ne, Amacımız Ne?
Bugün özellikle beyaz yakalılar ve profesyoneller, mesaisinin büyük bir bölümünü bilgisayar başında, WhatsApp Web açık şekilde geçiriyor. İletişim bu kadar yoğunlaşmışken, resmi uygulamanın sunduğu standart özellikler yetersiz kalıyor. 

Bizim amacımız; **"Nasıl daha üretken, daha gizli ve daha rahat iletişim kurarız?"** sorusuna cevap vermek. Süper WhatsApp, masaüstünde saatlerini harcayan kullanıcıları mutlu etmek, onlara adeta "süper güçler" vermek için tasarlandı!

## ⚡ Süper Güçler (Özellikler)

* 🌍 **Anlık ve Kesintisiz Çeviri:** Yabancı müşterilerle veya iş arkadaşlarınızla konuşurken dili dert etmeyin! Siz Türkçe yazın, o saniyesinde İngilizce'ye çevirip göndersin. Gelen İngilizce mesajları da tek tıkla Türkçe'ye çevirin.
* 💣 **Kaybolan (Bomba) Mesajlar:** Şifre, IBAN veya özel bir bilgi mi gönderiyorsunuz? Mesajı yollayın, her iki taraftan da tam **10 saniye sonra** iz bırakmadan patlayıp silinsin.
* ⏱️ **İleri Tarihli (Zamanlanmış) Mesajlar:** Mesajınızı geceden yazın, "Yarın sabah 09:00'da gönder" deyin. Siz uyurken o tam vaktinde mesajı iletsin.
* 🤖 **Gelişmiş Oto-Yanıt Asistanı:** Bilgisayar başında değil misiniz? Oto-yanıtı açın. Sadece *belirli kişilere (Beyaz Liste)* veya *patron hariç herkese (Kara Liste)* kendi belirlediğiniz özel bir mesajla otomatik dönüş yapın.

---

## 🔒 Güvenlik ve Şeffaflık (Acabalar?)

WhatsApp klonu kullanırken "Acaba mesajlarım başka yere gidiyor mu?" korkusu yaşamak çok doğaldır. İşte tam şeffaflık raporumuz:

1. **Açık Kaynak:** Bu proje %100 açık kaynaktır (Open Source). Kodların içinde ne olduğu tamamen şeffaftır.
2. **Her Şey Sizin Bilgisayarınızda:** Uygulama, arka planda tarayıcınızı (Puppeteer ve whatsapp-web.js) kullanarak WhatsApp Web'i **sizin kendi bilgisayarınızda** çalıştırır.
3. **Veri Hırsızlığı Yok:** Mesajlarınız, kişileriniz veya verileriniz **hiçbir şekilde** üçüncü parti bir veritabanına, sunucuya veya buluta kaydedilmez. Her şey *localhost* (kendi cihazınız) üzerinde yaşanır ve ölür.
4. *(Not: Yalnızca çeviri özelliği kullanıldığında, çevrilecek metin anlık olarak ücretsiz Google Translate API'sine iletilip sonucu geri alınır, kaydedilmez.)*

---

## 🔮 Gelecek Vizyonu (Neler Ekleyeceğiz?)

Süper WhatsApp'ın yol haritası heyecan verici! Gelecekte eklemeyi planladığımız uçuk özellikler:
* 🎙️ **Sesli Mesaj Çevirisi:** Gelen yabancı dildeki ses kayıtlarını anında dinleyip metin olarak kendi dilinize çevirme.
* 📹 **Anlık Görüntülü Konuşma Çeviricisi:** Görüntülü toplantılarda alt yazı şeklinde anlık (real-time) çeviri desteği.
* 🧠 **Yapay Zeka Destekli Özetler:** Uzun iş mesajlaşmalarını tek tıkla "Burada ne konuşulmuş?" diyerek özetleme.

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
