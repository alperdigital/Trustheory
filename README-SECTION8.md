Bölüm 8 – Grup Eşleşmesi Simülasyonu (mod8)

Bu bölüm, mevcut bölümlerden tamamen izole çalışan bir mini-modüldür. Tüm kimlikler, fonksiyonlar ve stiller mod8_ veya .mod8- ile ön eklenmiştir.

Entegrasyon Noktaları
- index.html içine tek bir kök eklendi: <section id="mod8-root" class="mod8-root" hidden></section>
- Alt kısımdaki menüye buton: <button id="mod8-nav-link">8. Bölüm – Grup Eşleşmesi</button>
- Bağımsız scriptler (yalnızca mod8):
  - js/modules/section8/state.js
  - js/modules/section8/strategies.js
  - js/modules/section8/payoffs.js
  - js/modules/section8/simulation.js
  - js/modules/section8/ui.js
  - js/modules/section8/bootstrap.js
- Stil: css/section8.css (yalnızca .mod8-root … altında kurallar)

Kullanım
- Menüde “8. Bölüm – Grup Eşleşmesi” butonuna tıklayın (veya Ctrl/Cmd+8).
- Bölüm açıldığında slideshow gizlenir, #mod8-root görünür.
- Kontroller:
  - Başlat: Otomatik tur döngüsünü başlatır.
  - Adım: Tek tam tur ilerletir.
  - Durdur: Otomatik döngüyü durdurur.
  - Sıfırla: Başlangıç dağılımına ve seed’e döner.
  - Hız: Otomatik tur hızını ayarlar (ms).
  - Dağılım: Strateji → grup adedi seçicileri. Toplam 10 olmalıdır; değilse uyarı ve Başlat devre dışı.

Varsayılan Dağılım (10 grup x 3 kişi)
- 2× COOPERATOR (Hep işbirliği)
- 2× RANDOM (Rastgele)
- 1× TIT_FOR_TAT (Aynıyla karşılık)
- 1× GRUDGER (İhaneti affetmez)
- 1× DEFECTOR (Hep ihanet)
- 1× PAVLOV (Win-stay, lose-shift)
- 1× PROB_COOP(0.7) (Olasılıksal işbirliği)

Tur Akışı
1) Oyun: Her grup önce çoğunluk oyu ile tur kararını (C/D) belirler; tüm üyeler bu kararı oynar. Her kişi tüm diğer kişilere karşı PD oynar; grup puanı üyelerin toplamıdır.
2) Eleme: En düşük puanlı grup belirlenir (beraberlikte indeksle deterministik).
3) Çoğaltma: En yüksek puanlı grubun 3 üyesi klonlanır (hafıza sıfırlı) ve elenen grubun yerine geçer. Grup/üye sayısı değişmez.

Ödemeler (varsayılan): T=5, R=3, P=1, S=0 (js/modules/section8/payoffs.js).

Mimari
- state.js: Başlangıç payoffs & dağılım, state init (mod8_initState), grup/üye fabrikaları.
- strategies.js: Grup kararı için stratejiler (mod8_strategies). PROB_COOP sabit 0.7 ile olasılıksal.
- simulation.js: Saf fonksiyon mod8_runOneFullRound(state) 3 adımı orkestre eder; mod8_selfTest() küçük öz test.
- ui.js: Panel ve grup kartlarını render eder, dağılım kontrollerini oluşturur, doğrulama/uyarıyı gösterir.
- bootstrap.js: mod8_mount()/mod8_unmount() ve event bağlama/temizleme; autoplay zamanlayıcısı.
- css/section8.css: Sadece .mod8-root … altında 2×5 grid, küçük ekranda 2 sütun.

Kabul Kriterleri Durumu
- Bölüm 8 ayrı sahne olarak açılır, kapatılınca tamamen temizlenir (timer + event’ler kaldırılır, DOM temizlenir).
- 10×3 görünür; akışta en yüksek/en düşük etiketi ve tur sayacı gösterilir.
- Başlat/Adım/Durdur/Sıfırla çalışır; hız ayarlanabilir; dağılım toplamı ≠10 iken Başlat devre dışı ve uyarı görünür.
- Eleme/çoğaltma doğru işler; grup/üye sayısı sabit.
- Tüm kimlikler/fonksiyonlar mod8_ ile prefiksli; CSS izolasyonu sağlanır; diğer bölümlerde regresyon yoktur.

Notlar
- PIXI sahnesi opsiyoneldir; şu an yalnızca DOM tabanlı görselleştirme kullanılmaktadır.
- Tie-break deterministik olarak grup indeksine göre yapılır; gerekirse seed’li RNG ile genişletilebilir.

Section 8 – Grup Eşleşmesi Simülasyonu (İzole)

- Kapsayıcı DOM: <section id="mod8-root" class="mod8-root" hidden>
- Başlat: mod8_mount(), Kapat: mod8_unmount()
- Tur: Grup oylaması -> herkes-herkes oyun -> en kötü grup elenir, en iyi grup klonlanır.
- Dosyalar: css/section8.css, js/modules/section8/* (bootstrap, state, strategies, payoffs, simulation, ui)
- Tüm fonksiyonlar mod8_ prefixlidir; global sızıntı yoktur.
