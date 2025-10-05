# Güvenin Evrimi - Türkçe Versiyon

Bu proje, Nicky Case'in "The Evolution of Trust" oyununun Türkçe çevirisi ve geliştirilmiş versiyonudur.

## Özellikler

- **Türkçe Çeviri**: Tüm metinler Türkçe'ye çevrilmiştir
- **4 Halka Aynı Anda Analiz**: Sandbox Mode'da 4 farklı halka aynı anda 20 tur boyunca çalışır
- **Detaylı Tablo**: Her halka için hangi stratejinin kaç kişi hayatta kaldığı gösterilir
- **Renkli Gösterim**: Yeşil = hayatta kalan, Kırmızı = yok olan
- **Geliştirilmiş UI**: Büyük ve kullanışlı istatistik paneli

## Nasıl Çalıştırılır

1. Projeyi klonlayın:
```bash
git clone https://github.com/abdullahalperbas/trust-turkish.git
cd trust-turkish
```

2. Yerel sunucu başlatın:
```bash
python3 -m http.server 8000
```

3. Tarayıcıda `http://localhost:8000` adresini açın

## İstatistik Özelliği

Sandbox Mode'da "İSTATİSTİK" butonuna tıklayarak:
- 4 farklı halka aynı anda başlar
- Her halka 20 tur boyunca çalışır
- Her turun sonucu tabloda gösterilir
- Hangi stratejinin kaç kişi hayatta kaldığı görülür
- Yeşil: hayatta kalan, Kırmızı: yok olan

## Çeviri Notları

- Tüm oyuncu isimleri Türkçe'ye çevrilmiştir
- Butonlar ve arayüz Türkçe'dir
- Oyun mekaniği aynı kalmıştır

## Orijinal Proje

Bu proje [Nicky Case'in orijinal "The Evolution of Trust"](http://ncase.me/trust/) projesinin Türkçe çevirisidir.

## Lisans

Orijinal proje gibi MIT lisansı altındadır.