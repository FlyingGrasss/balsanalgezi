'use client';

import React, { useEffect, useState } from 'react';

type Language = 'tr' | 'en';

const translations = {
  tr: {
    welcomeTitle: "Bornova Anadolu Lisesi (BAL) Sanal Turuna Hoş Geldiniz!",
    aboutProjectTitle: "Bu Proje Hakkında",
    projectName: "BAL360: Türkiye'de İlk Lise Düzeyinde Sanal Tur Kampüs Tanıtım Projesi",
    projectTeamTitle: "Proje Ekibi:",
    projectLead: "Proje Yürütücüsü:",
    projectAssistants: "Proje Asistanları:",
    teamMembers: "Ekip Üyeleri:",
    consultantAcademics: "Danışman Akademisyenler:",
    cekim: "Çekim Görevlisi:",
    projectPurposeTitle: "1. Proje Amacı ve Hedefi",
    projectPurposeText: "BAL360 Projesi, Bornova Anadolu Lisesi (BAL) kampüsünü sanal tur teknolojisiyle tanıtmayı amaçlar. Hedefimiz, lise tercihi yapacak öğrencilerin okulun fiziksel, sosyal ve akademik ortamını 360° fotoğraf tabanlı bir sanal deneyimle uzaktan keşfetmelerini sağlamaktır. Bu sayede, kampüsü fiziksel olarak ziyaret edemeyen aday öğrenciler ve veliler, okul hakkında daha bilinçli karar verebileceklerdir.",
    targetAudienceTitle: "2. Hedef Kitle",
    targetAudienceList: [
      "LGS sonrası tercih yapacak 8. sınıf öğrencileri ve velileri",
      "Rehber öğretmenler",
      "Milli Eğitim Bakanlığı'na bağlı okul tanıtım birimleri",
      "Eğitim teknolojileriyle ilgilenen kamu ve özel sektör temsilcileri"
    ],
    innovationTitle: "3. Projenin Yenilikçi Yönü",
    innovationList: [
      "Türkiye'de lise düzeyinde, tamamı öğrenci üretimi olan ve herhangi bir ücretli yazılım kullanılmadan geliştirilen ilk sanal kampüs tanıtımıdır.",
      "360° fotoğraf entegrasyonuyla eğitimde dijitalleşmeyi destekleyen özgün bir içerik sunar.",
      "Web tabanlı yapısıyla tüm Türkiye'den öğrencilere uzaktan erişim imkanı sağlar."
    ],
    technicalDescriptionTitle: "4. Teknik Açıklama ve Yöntem",
    technicalDescriptionText: "Projede 360° fotoğraf çekimleri için Insta360 kamera ekipmanları kullanılmıştır. Okulun tüm bölümleri (derslikler, laboratuvarlar, spor salonu, bahçe ve sosyal alanlar) çekilerek sanal bir rota oluşturulmuştur. Hazırlanan 360° fotoğraflar, özel bir web uygulaması aracılığıyla interaktif bir sanal tur deneyimine dönüştürülmüştür. Bu uygulama, kullanıcıların bilgisayar veya telefonları üzerinden okulun farklı alanlarını 360 derece görüntüleyebilmelerini sağlar. Kullanıcılar, görüntüler içinde sürükleyerek etrafa bakabilir ve yerleştirilmiş etkileşimli noktalar (hotspotlar) aracılığıyla farklı konumlara geçiş yapabilirler. Web sitesi, kullanıcı dostu arayüzle hem Türkçe hem İngilizce olarak yayınlanacaktır.",
    valueAndImpactTitle: "5. Projenin Katma Değeri ve Toplumsal Etkisi",
    valueAndImpactList: [
      { strong: "Eğitimde Erişim Eşitliği:", text: "Fiziki erişim imkanı olmayan öğrencilere okul tanıtımı sunar." },
      { strong: "Teknoloji Okuryazarlığı:", text: "Lise öğrencilerinin ileri düzey medya ve yazılım araçlarıyla proje üretmesini teşvik eder." },
      { strong: "Rehberlik Sürecine Katkı:", text: "Rehber öğretmenler için güçlü bir okul tanıtım aracıdır." },
      { strong: "Sürdürülebilirlik:", text: "Farklı liseler için ölçeklenebilir bir model oluşturarak yaygınlaştırılabilir." }
    ],
    futureStepsTitle: "6. Projenin Gelecek Adımları",
    futureStepsList: [
      "BAL360 web sitesinin tüm cihazlarla uyumlu şekilde yayına alınması.",
      "Rehberlik seminerlerinde proje sunumları yapılması.",
      "Diğer liseler için içerik üretim atölyeleri düzenlenerek modelin yaygınlaştırılması.",
      "Gelişmiş sanal tur rotaları ve yapay zeka destekli rehber anlatım entegrasyonları.",
      "Görüntülerin Google Earth'e entegre edilmesi.",
      "Sonuç olarak, görüntülerin gelecek fazlar aracılığıyla geliştirilmesi ve profesyonelleştirilmesi hedeflenmektedir."
    ],
    aboutSchoolTitle: "Okulumuz Hakkında",
    aboutSchoolText: "Bornova Anadolu Lisesi (BAL), Bornova, İzmir'de bulunan, üç dil eğitim yapan bir anadolu lisesidir.",
    schoolInfoList: [
      { strong: "Slogan:", text: "Geleceğin aydınlık sesi" },
      { strong: "Kuruluş:", text: "26 Mart 1953" },
      { strong: "Ülke:", text: "Türkiye" },
      { strong: "Şehir:", text: "İzmir" },
      { strong: "İlçe:", text: "Bornova" },
      { strong: "Türü:", text: "Anadolu Lisesi" },
      { strong: "Müdür:", text: "Aydın Doğmuş" },
      { strong: "Eğitim Dili:", text: "Türkçe" },
      { strong: "Yabancı Diller:", text: "İngilizce, Almanca, Fransızca" },
      { strong: "Öğrenci Sayısı:", text: "1533 (2024 itibarıyla)" },
      { strong: "Öğretmen Sayısı:", text: "104 (2024 itibarıyla)" },
      { strong: "Derslik Sayısı:", text: "55 (2024 itibarıyla)" },
      { strong: "Adresi:", text: "Mevlana, Ord. Prof. Dr. Muhiddin Erel Cd., 35050 Bornova/İzmir" },
      { strong: "Resmî Sitesi:", text: "" }
    ],
    historyTitle: "Tarihçesi",
    historyParagraph1: "Okulun bugünkü tesislerinin bulunduğu alan 1950'lere kadar, Fransız asıllı varlıklı bir levanten olan Edmond Giraud'nun İzmir'in Bornova kazasına 2 kilometre uzaklıktaki 220 dönümlük çiftliğiydi. 1950'li yılların başında, İzmirli 50 dolayında tanınmış iş adamı, İzmir'de eksikliği hissedilen yabancı dil ile eğitim veren yatılı bir okulu şehirlerine kazandırmak amacı ile bir araya geldiler. Görüşmeler sonunda Giraud, arazisini içindeki tarihi köşkü, korusu ve güvercinliğiyle birlikte, bir okul yapılması koşuluyla, 26 Mart 1953 tarihinde sembolik bir bedelle Ege Koleji T.A.Ş.'e devretti ve kendisi de şirket ortağı oldu. Arazi üzerine, zengin bitki örtüsü korunarak derslikler, yatakhaneler, yemekhane ve konferans salonu inşa edildi. Böylece, 1953-1954 öğretim yılında \"Bornova Anadolu Lisesi\" eğitim ve öğretime başladı. Okula ilk yıl 38 yatılı erkek öğrenci kaydoldu.",
    historyParagraph2: "1954 yılında Türkiye Cumhuriyeti Millî Eğitim Bakanlığı'nca yurt çapında yabancı dille öğretim yapacak olan Maarif Bakanlığı Kolejleri'nin kurulması kararlaştırılınca İzmirdeki Maarif Bakanlığı Koleji için uygun nitelikte bir yer aranmaya başlandı. İzmir Koleji; Diyarbakır, Eskişehir, İstanbul/Kadıköy, Konya ve Samsun Kolejleri ile birlikte Türkiye'nin ilk altı Maarif Bakanlığı Koleji arasında 22 Ekim 1955'te öğretime başlamıştır.",
    historyParagraph3: "İlk 10 yıl sadece yatılı erkek kabul eden İzmir Koleji, 1964-1965 öğretim yılından itibaren Orta Öğretim Genel Müdürlüğü kararı ile kızları da kabul eden karma öğretime başladı. Bu yıldan başlamak üzere gündüzlü kız ve erkek öğrenciler de okula kabul edilmeye başladı.",
    historyParagraph4: "1975 yılında okulun adı \"İzmir Anadolu Lisesi\" (İAL) olarak değiştirildi. 1976-1977 öğretim yılında ise, İzmir'de başka Anadolu Liseleri açılması üzerine, \"Bornova Anadolu Lisesi\" (BAL) adını aldı.",
    developersTitle: "Bu Sanal Turu Hazırlayanlar",
    software: "Yazılım:",
    softwareAssistant: "Yazılım Yardımcısı:",
    projectOfficer: "Proje Görevlisi:",
    contactTitle: "İletişim",
    startTourButton: "Tura Başla",
    languageSwitchText: "English"
  },
  en: {
    welcomeTitle: "Welcome to Bornova Anatolian High School (BAL) Virtual Tour!",
    aboutProjectTitle: "About This Project",
    projectName: "BAL360: Turkey's First High School Level Virtual Tour Campus Promotion Project",
    projectTeamTitle: "Project Team:",
    projectLead: "Project Lead:",
    projectAssistants: "Project Assistants:",
    teamMembers: "Team Members:",
    consultantAcademics: "Consultant Academics:",
    cekim: "Photography Manager:",
    projectPurposeTitle: "1. Project Aim and Goal",
    projectPurposeText: "The BAL360 Project aims to introduce the Bornova Anatolian High School (BAL) campus using virtual tour technology. Our goal is to enable students who will make high school choices to remotely explore the physical, social, and academic environment of the school through a 360° photo-based virtual experience. This way, prospective students and parents who cannot physically visit the campus due to geographical barriers or lack of opportunity will be able to make a more informed and concrete decision about the school.",
    targetAudienceTitle: "2. Target Audience",
    targetAudienceList: [
      "8th-grade students and parents who will make choices after LGS (High School Entrance Exam)",
      "Guidance counselors",
      "School promotion units affiliated with the Ministry of National Education",
      "Public and private sector representatives interested in educational technologies"
    ],
    innovationTitle: "3. Innovative Aspect of the Project",
    innovationList: [
      "It is the first high school level virtual campus tour in Turkey, entirely produced by students and developed without the use of any paid software.",
      "It offers a unique content production example that supports digitalization in education through 360° photo integration.",
      "Its web-based structure, accessible via web browsing, provides access to students from all over Turkey."
    ],
    technicalDescriptionTitle: "4. Technical Description and Method",
    technicalDescriptionText: "Insta360 camera equipment was used for 360° photo shoots in the project. All sections of the school (classrooms, laboratories, sports hall, garden, and social areas) were photographed in a planned sequence to create a virtual route. The prepared 360° photos have been transformed into an interactive virtual tour experience via a special web application, accessible to users via their computers or phones. This application allows users to view different areas of the school in 360 degrees. Users can drag within the images to look around and navigate to different locations via embedded interactive points (hotspots). The website will be published with a user-friendly interface in both Turkish and English.",
    valueAndImpactTitle: "5. Added Value and Social Impact of the Project",
    valueAndImpactList: [
      { strong: "Equality in Access to Education:", text: "Offers school promotion to students who do not have physical access." },
      { strong: "Technology Literacy:", text: "Encourages high school students to produce projects with advanced media and software tools." },
      { strong: "Contribution to Guidance Process:", text: "Provides a powerful school promotion tool for guidance counselors." },
      { strong: "Sustainability:", text: "Can be scaled and disseminated throughout Turkey by creating a replicable model for different high schools." }
    ],
    futureStepsTitle: "6. Future Steps of the Project",
    futureStepsList: [
      "Launching the BAL360 website compatible with all devices.",
      "Presenting the project in guidance seminars.",
      "Disseminating the model by organizing content production workshops for other high schools.",
      "Integration of advanced virtual tour routes and AI-powered guide narration.",
      "Integration of images into Google Earth.",
      "Ultimately, the goal is to develop and professionalize the images through future phases."
    ],
    aboutSchoolTitle: "About Our School",
    aboutSchoolText: "Bornova Anatolian High School (BAL) is an Anatolian high school located in Bornova, İzmir, providing education in three languages.",
    schoolInfoList: [
      { strong: "Slogan:", text: "The bright voice of the future" },
      { strong: "Established:", text: "March 26, 1953" },
      { strong: "Country:", text: "Turkey" },
      { strong: "City:", text: "İzmir" },
      { strong: "District:", text: "Bornova" },
      { strong: "Type:", text: "Anatolian High School" },
      { strong: "Principal:", text: "Aydın Doğmuş" },
      { strong: "Language of Education:", text: "Turkish" },
      { strong: "Foreign Languages:", text: "English, German, French" },
      { strong: "Number of Students:", text: "1533 (as of 2024)" },
      { strong: "Number of Teachers:", text: "104 (as of 2024)" },
      { strong: "Number of classrooms:", text: "55 (as of 2024)" },
      { strong: "Address:", text: "Mevlana, Ord. Prof. Dr. Muhiddin Erel Cd., 35050 Bornova/İzmir" },
      { strong: "Official Website:", text: "" }
    ],
    historyTitle: "History",
    historyParagraph1: "The area where the school's current facilities are located was, until the 1950s, the 220-acre farm of Edmond Giraud, a wealthy Levantine of French origin, located 2 kilometers from Bornova district of İzmir. In the early 1950s, about 50 well-known businessmen from İzmir came together with the aim of bringing a boarding school providing foreign language education, which was felt to be lacking in İzmir, to their city. As a result of the negotiations, Giraud, transferred his land, along with its historical mansion, grove, and dovecote, to Ege Koleji T.A.Ş.'e devretti ve kendisi de şirket ortağı oldu. Arazi üzerine, zengin bitki örtüsü korunarak derslikler, yatakhaneler, yemekhane ve konferans salonu inşa edildi. Böylece, 1953-1954 öğretim yılında \"Bornova Anatolian High School\" education and teaching began. In its first year, 38 male boarding students enrolled.",
    historyParagraph2: "In 1954, when the Ministry of National Education of the Republic of Turkey decided to establish Ministry of Education Colleges that would provide foreign language education throughout the country, a suitable location for the Ministry of Education College in İzmir began to be sought. İzmir College; Diyarbakır, Eskişehir, İstanbul/Kadıköy, Konya and Samsun Colleges, along with Turkey's first six Ministry of Education Colleges, started education on October 22, 1955.",
    historyParagraph3: "For the first 10 years, İzmir College only accepted male boarding students. From the 1964-1965 academic year, by the decision of the General Directorate of Secondary Education, it began co-education, accepting girls as well. From this year onwards, day students (both girls and boys) also began to be admitted to the school.",
    historyParagraph4: "In 1975, the school's name was changed to \"İzmir Anatolian High School\" (İAL) as it is still known today. In the 1976-1977 academic year, after other Anatolian High Schools were opened in İzmir, it took the name \"Bornova Anatolian High School\" (BAL).",
    developersTitle: "Developers of This Virtual Tour",
    software: "Software:",
    softwareAssistant: "Software Assistant:",
    projectOfficer: "Project Officer:",
    contactTitle: "Contact",
    startTourButton: "Start Tour",
    languageSwitchText: "Türkçe"
  }
} as const;

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ title, children, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        className="w-full cursor-pointer flex justify-between items-center py-3 px-4 text-lg font-bold text-gray-800 hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
        onClick={onToggle}
      >
        {title}
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-3 bg-gray-100">{children}</div>
      </div>
    </div>
  );
}

interface IntroModalProps {
  language: Language;
  onStartTour: () => void;
  onLanguageToggle: () => void;
}

export default function IntroModal({ language, onStartTour, onLanguageToggle }: IntroModalProps) {
  const t = translations[language];
  const [isAnimated, setIsAnimated] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Bu Proje Hakkında': false,
    'Okulumuz Hakkında': false,
    'Tarihçesi': false,
    'Bu Sanal Turu Hazırlayanlar': false,
    'İletişim': false,
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  return (
    <div className="fixed inset-0 bg-linear-to-br from-red-800 to-red-950 flex flex-col items-center z-100 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-modal-title"
        aria-describedby="intro-modal-description"
        className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-sm:p-4 text-center transform scale-95 opacity-100 mt-0 flex flex-col grow ${isAnimated ? 'animate-scaleIn' : ''}`}
      >
        <div className="shrink-0">
          <img src="/logo.png" alt="Bornova Anadolu Lisesi Logo" className="mx-auto mb-6 w-32 h-32 object-contain" />
          <h1 id="intro-modal-title" className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
            {t.welcomeTitle}
          </h1>
        </div>

        <div id="intro-modal-description" className="text-left text-gray-800 space-y-2 mb-32 grow overflow-y-auto pr-2">
          <AccordionItem title={t.aboutProjectTitle} isOpen={openSections['Bu Proje Hakkında']} onToggle={() => toggleSection('Bu Proje Hakkında')}>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.projectName}</h3>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t.projectTeamTitle}</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>{t.projectLead}</strong> Ali Başar Muslu (10H)</li>
                <li><strong>{t.projectAssistants}</strong> Emre Bozkurt (10C), Canberk Özçağan (10C), Selen Can (10A), Doruk Munzur Tulga (10C)</li>
                <li><strong>{t.teamMembers}</strong> Devran Ersönmez (10H), Barlas Ardıç (10C), Efkan Şenol (10H)</li>
                <li><strong>{t.consultantAcademics}</strong> Prof. Dr. Vahap TECİM (Dokuz Eylül Üniversitesi), Yunus Al (Bornova Anadolu Lisesi Matematik Öğretmeni)</li>
                <li><strong>{t.cekim}</strong> Selim Yengil(Dokuz Eylül Üniversitesi)</li>
              </ul>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.projectPurposeTitle}</h3>
              <p>{t.projectPurposeText}</p>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.targetAudienceTitle}</h3>
              <ul className="list-disc list-inside space-y-1">{t.targetAudienceList.map((item, index) => <li key={index}>{item}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.innovationTitle}</h3>
              <ul className="list-disc list-inside space-y-1">{t.innovationList.map((item, index) => <li key={index}>{item}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.technicalDescriptionTitle}</h3>
              <p>{t.technicalDescriptionText}</p>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.valueAndImpactTitle}</h3>
              <ul className="list-disc list-inside space-y-1">{t.valueAndImpactList.map((item, index) => <li key={index}><strong>{item.strong}</strong> {item.text}</li>)}</ul>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.futureStepsTitle}</h3>
              <ul className="list-disc list-inside space-y-1">{t.futureStepsList.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          </AccordionItem>

          <AccordionItem title={t.aboutSchoolTitle} isOpen={openSections['Okulumuz Hakkında']} onToggle={() => toggleSection('Okulumuz Hakkında')}>
            <div className="space-y-4">
              <p>{t.aboutSchoolText}</p>
              <ul className="list-disc list-inside space-y-1">
                {t.schoolInfoList.map((item, index) => <li key={index}><strong>{item.strong}</strong> {item.text}{(item.strong === "Resmî Sitesi:" || item.strong === "Official Website:") && <a href="https://izmirbal.meb.k12.tr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">izmirbal.meb.k12.tr</a>}</li>)}
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem title={t.historyTitle} isOpen={openSections['Tarihçesi']} onToggle={() => toggleSection('Tarihçesi')}>
            <div className="space-y-4"><p>{t.historyParagraph1}</p><p>{t.historyParagraph2}</p><p>{t.historyParagraph3}</p><p>{t.historyParagraph4}</p></div>
          </AccordionItem>

          <AccordionItem title={t.developersTitle} isOpen={openSections['Bu Sanal Turu Hazırlayanlar']} onToggle={() => toggleSection('Bu Sanal Turu Hazırlayanlar')}>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>{t.software}</strong> <a href="https://www.instagram.com/emre.bozqurt/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Emre Bozkurt</a></li>
              <li><strong>{t.softwareAssistant}</strong> <a href="https://www.instagram.com/_canberk_q/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Canberk Özçağan</a></li>
              <li><strong>{t.projectOfficer}</strong> <a href="https://www.instagram.com/basar.muslu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ali Başar Muslu</a></li>
            </ul>
          </AccordionItem>

          <AccordionItem title={t.contactTitle} isOpen={openSections['İletişim']} onToggle={() => toggleSection('İletişim')}>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>{t.software}</strong> <a href="mailto:emreb.programming@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">emreb.programming@gmail.com</a></li>
              <li><strong>{t.softwareAssistant}</strong> <a href="mailto:canberkozcagan@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">canberkozcagan@gmail.com</a></li>
              <li><strong>{t.projectOfficer}</strong> <a href="mailto:abasarmuslu@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">abasarmuslu@gmail.com</a></li>
            </ul>
          </AccordionItem>
        </div>

        <button onClick={onStartTour} className="px-8 py-3 mt-8 bg-blue-600 text-white cursor-pointer font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-500 transform hover:scale-102 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50">
          {t.startTourButton}
        </button>

        <div className="absolute top-4 right-4">
          <button onClick={onLanguageToggle} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full shadow-md hover:bg-gray-300 transition-colors text-sm font-semibold">
            {t.languageSwitchText}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
