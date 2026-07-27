import AccordionItem from './AccordionItem';

/**
 * The original intro layout, kept outside the Three.js component so the
 * landing copy is present in the server-rendered HTML.
 */
export default function IntroModal() {
  return (
    <div className="fixed inset-0 bg-linear-to-br from-red-800 to-red-950 flex flex-col items-center z-100 overflow-y-auto">
      <section
        id="intro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-modal-title"
        aria-describedby="intro-modal-description"
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-sm:p-4 text-center transform scale-95 opacity-0 mt-0 animate-scaleIn flex flex-col grow"
      >
        <div className="shrink-0">
          <img src="/logo.png" alt="Bornova Anadolu Lisesi Logo" className="mx-auto mb-6 w-32 h-32 object-contain" />
          <h1 id="intro-modal-title" className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
            Bornova Anadolu Lisesi (BAL) Sanal Turuna Hoş Geldiniz!
          </h1>
          <p id="intro-modal-description" className="text-left text-gray-800">
            Bornova Anadolu Lisesi kampüsünü 360° fotoğraflarla keşfedin; sınıfları,
            laboratuvarları, spor alanlarını ve sosyal alanları interaktif bir sanal turla inceleyin.
          </p>
        </div>

        <div className="text-left text-gray-800 space-y-2 mb-32 grow overflow-y-auto pr-2">
          <AccordionItem title="Bu Proje Hakkında">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">BAL360: Türkiye&apos;de İlk Lise Düzeyinde Sanal Tur Kampüs Tanıtım Projesi</h2>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Proje Ekibi:</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Proje Yürütücüsü:</strong> Ali Başar Muslu (10H)</li>
                <li><strong>Proje Asistanları:</strong> Emre Bozkurt (10C), Canberk Özçağan (10C), Selen Can (10A), Doruk Munzur Tulga (10C)</li>
                <li><strong>Ekip Üyeleri:</strong> Devran Ersönmez (10H), Barlas Ardıç (10C), Efkan Şenol (10H)</li>
                <li><strong>Danışman Akademisyenler:</strong> Prof. Dr. Vahap TECİM (Dokuz Eylül Üniversitesi), Yunus Al (Bornova Anadolu Lisesi Matematik Öğretmeni)</li>
                <li><strong>Çekim Görevlisi:</strong> Selim Yengil (Dokuz Eylül Üniversitesi)</li>
              </ul>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">1. Proje Amacı ve Hedefi</h2>
              <p>BAL360 Projesi, Bornova Anadolu Lisesi (BAL) kampüsünü sanal tur teknolojisiyle tanıtmayı amaçlar. Hedefimiz, lise tercihi yapacak öğrencilerin okulun fiziksel, sosyal ve akademik ortamını 360° fotoğraf tabanlı bir sanal deneyimle uzaktan keşfetmelerini sağlamaktır.</p>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">2. Hedef Kitle</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>LGS sonrası tercih yapacak 8. sınıf öğrencileri ve velileri</li>
                <li>Rehber öğretmenler</li>
                <li>Milli Eğitim Bakanlığı&apos;na bağlı okul tanıtım birimleri</li>
                <li>Eğitim teknolojileriyle ilgilenen kamu ve özel sektör temsilcileri</li>
              </ul>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">3. Projenin Yenilikçi Yönü</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Türkiye&apos;de lise düzeyinde, tamamı öğrenci üretimi olan bir sanal kampüs tanıtımıdır.</li>
                <li>360° fotoğraf entegrasyonuyla eğitimde dijitalleşmeyi destekleyen özgün bir içerik sunar.</li>
                <li>Web tabanlı yapısıyla tüm Türkiye&apos;den öğrencilere uzaktan erişim imkânı sağlar.</li>
              </ul>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">4. Teknik Açıklama ve Yöntem</h2>
              <p>Projede 360° fotoğraf çekimleri için Insta360 kamera ekipmanları kullanılmıştır. Okulun tüm bölümleri çekilerek sanal bir rota oluşturulmuş ve hazırlanan fotoğraflar interaktif bir sanal tur deneyimine dönüştürülmüştür.</p>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">5. Projenin Katma Değeri ve Toplumsal Etkisi</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Eğitimde Erişim Eşitliği:</strong> Fiziki erişim imkânı olmayan öğrencilere okul tanıtımı sunar.</li>
                <li><strong>Teknoloji Okuryazarlığı:</strong> Öğrencilerin ileri düzey medya ve yazılım araçlarıyla proje üretmesini teşvik eder.</li>
                <li><strong>Sürdürülebilirlik:</strong> Farklı liseler için ölçeklenebilir bir model oluşturur.</li>
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem title="Okulumuz Hakkında">
            <div className="space-y-4">
              <p>Bornova Anadolu Lisesi (BAL), Bornova, İzmir&apos;de bulunan, üç dilde eğitim yapan köklü bir Anadolu lisesidir.</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Slogan:</strong> Geleceğin aydınlık sesi</li>
                <li><strong>Kuruluş:</strong> 26 Mart 1953</li>
                <li><strong>Ülke:</strong> Türkiye</li>
                <li><strong>Şehir:</strong> İzmir</li>
                <li><strong>İlçe:</strong> Bornova</li>
                <li><strong>Türü:</strong> Anadolu Lisesi</li>
                <li><strong>Eğitim Dili:</strong> Türkçe</li>
                <li><strong>Yabancı Diller:</strong> İngilizce, Almanca, Fransızca</li>
                <li><strong>Resmî Sitesi:</strong> <a href="https://izmirbal.meb.k12.tr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">izmirbal.meb.k12.tr</a></li>
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem title="Tarihçesi">
            <div className="space-y-4">
              <p>Bornova Anadolu Lisesi, 1953 yılında eğitim ve öğretime başlamış, 1976-1977 öğretim yılında Bornova Anadolu Lisesi adını almıştır.</p>
              <p>Okul, yabancı dil eğitimi ve köklü geçmişiyle İzmir&apos;in önemli eğitim kurumlarından biri olmayı sürdürmektedir.</p>
            </div>
          </AccordionItem>

          <AccordionItem title="Bu Sanal Turu Hazırlayanlar">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Yazılım:</strong> <a href="https://www.instagram.com/emre.bozqurt/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Emre Bozkurt</a></li>
              <li><strong>Yazılım Yardımcısı:</strong> <a href="https://www.instagram.com/_canberk_q/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Canberk Özçağan</a></li>
              <li><strong>Proje Görevlisi:</strong> <a href="https://www.instagram.com/basar.muslu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ali Başar Muslu</a></li>
            </ul>
          </AccordionItem>

          <AccordionItem title="İletişim">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Yazılım:</strong> <a href="mailto:contact@emreb.com.tr" className="text-blue-600 hover:underline">contact@emreb.com.tr</a></li>
              <li><strong>Yazılım Yardımcısı:</strong> <a href="mailto:canberkozcagan@gmail.com" className="text-blue-600 hover:underline">canberkozcagan@gmail.com</a></li>
              <li><strong>Proje Görevlisi:</strong> <a href="mailto:abasarmuslu@gmail.com" className="text-blue-600 hover:underline">abasarmuslu@gmail.com</a></li>
            </ul>
          </AccordionItem>
        </div>

        <button
          id="intro-modal-start"
          type="button"
          data-intro-action="start"
          className="px-8 py-3 mt-8 bg-blue-600 text-white cursor-pointer font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-500 transform hover:scale-102 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Geziye Başla
        </button>
      </section>
    </div>
  );
}
