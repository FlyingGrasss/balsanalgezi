'use client';

import React, { useRef, useEffect, useState, useCallback, Suspense } from 'react';
import * as THREE from 'three';

import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// --- Translations ---
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
    sidebarTitle: "Yerler",
    sidebarCloseLabel: "Sidebarı kapat",
    loadingText: "Yükleniyor...",
    closeButtonText: "Kapat",
    openSidebarLabel: "Sidebarı Aç",
    languageSwitchText: "English", // Text on the button to switch to English
    locations: [ // Translated location names
      "Giriş", "2", "3", "Anaokulu Arkası", "B Blok ile C Blok Arası", "B Blok Önü",
      "B Blok Giriş", "B Blok Koridor", "Matematik ve Bilim Atölyesi", "Robotik Odası",
      "Dörtyol", "C Blok Önü", "C Blok", "Bilgisayar Odası", "Kimya Odası",
      "A Blok Öğretmen Girişi", "Brifing Salonu", "Örnek Sınıf", "A Blok Hol",
      "20", "Koru (C Blok Yanı)", "C Blok Yanı", "BALEV Merdiven Önü",
      "BALEV Merdivenleri", "BALEV Yanı", "BALEV Arkası", "Koru (BALEV Arkası)",
      "Koru (Arka Giriş)", "Koru (A Blok Arkası)", "Kantin Yanı", "31",
      "Müzik / Resim Atölyeleri", "Müzik Atölyesi Arkası", "G Blok Arkası",
      "G Blok Önü", "36", "Halı Saha", "G Blok", "Eski Kantin", "A Blok Önü",
      "Spor Sahası", "Spor Salonu Önü", "Tören Alanı", "Konferans Salonu"
    ]
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
    sidebarTitle: "Locations",
    sidebarCloseLabel: "Close Sidebar",
    loadingText: "Loading...",
    closeButtonText: "Close",
    openSidebarLabel: "Open Sidebar",
    languageSwitchText: "Türkçe", // Text on the button to switch to English
    locations: [ // Translated location names
      "Entrance", "2", "3", "Behind Kindergarten", "Between B Block and C Block", "In front of B Block",
      "B Block Entrance", "B Block Corridor", "Mathematics and Science Workshop", "Robotics Room",
      "Crossroads", "In front of C Block", "C Block", "Computer Room", "Chemistry Room",
      "A Block Teacher's Entrance", "Briefing Hall", "Sample Classroom", "A Block Hall",
      "20", "Grove (Next to C Block)", "Next to C Block", "BALEV Staircase Front",
      "BALEV Stairs", "Next to BALEV", "Behind BALEV", "Grove (Behind BALEV)",
      "Grove (Back Entrance)", "Grove (Behind A Block)", "Next to Canteen", "31",
      "Music / Art Workshops", "Behind Music Workshop", "Behind G Block",
      "In front of G Block", "36", "Astroturf Pitch", "G Block", "Old Canteen", "In front of A Block",
      "Sports Field", "In front of Sports Hall", "Ceremony Area", "Conference Hall"
    ]
  }
};
// --- End Translations ---


// --- Interfaces ---
interface Hotspot {
  position: { x: number; y: number; z: number };
  label: string; // Label for info hotspots, can be empty for navigation arrows
  target?: number; // For navigation hotspots
  info?: InfoContent; // For info hotspots
  type?: 'info' | 'animated-arrow-down' | 'animated-arrow-left' | 'animated-arrow-right' | 'animated-arrow-up'; // Updated types
}

interface InfoContent {
  title: string;
  description: string;
}

interface Location {
  name: string;
  image: string; // Path to the panoramic image
  hotspots: Hotspot[];
  panoramaRotation?: [number, number, number]; // Rotation for the panorama mesh itself
  initialCameraTarget?: [number, number, number]; // New: Optional initial camera look-at target
}
// --- End Interfaces ---

const locations: Location[] = [
  {
    name: "Giriş",
    image: "/locations/optimized/1.webp",
    panoramaRotation: [0, 0, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.1, z: -0.25 }, label: "", target: 1, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0.05, z: 4 }, label: "", target: 41, type: 'animated-arrow-down' },
      { position: { x: -1.5, y: -0.05, z: 4 }, label: "", target: 43, type: 'animated-arrow-right' },
      // { position: { x: -1, y: 0, z: 1.5 }, label: "Konferans Salonu", info: { title: "Konferans Salonu", description: "Okulumuzun Konferans Salonu. Geniş ve ferah!" }, type: 'info' },
    ],
    initialCameraTarget: [-1, 0, 1], // Default camera target
  },
  {
    name: "2",
    image: "/locations/optimized/2.webp",
    panoramaRotation: [0, 0, 0],
    hotspots: [
      { position: { x: 3.5, y: -0.1, z: 0.2 }, label: "", target: 0, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0.1, z: -4 }, label: "", target: 42, type: 'animated-arrow-down' },
      { position: { x: -4.5, y: -0.1, z: -0.4 }, label: "", target: 2, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "3",
    image: "/locations/optimized/3.webp",
    panoramaRotation: [0, Math.PI * 1.1, 0],
    hotspots: [
      { position: { x: 4, y: -0.05, z: 0.3 }, label: "", target: 1, type: 'animated-arrow-down' },
      { position: { x: 0, y: -0.1, z: -4 }, label: "", target: 3, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: -0.1, z: -2.5 }, label: "", target: 5, type: 'animated-arrow-down' },
      { position: { x: -3, y: -0.1, z: -0.2 }, label: "", target: 10, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Anaokulu Arkası",
    image: "/locations/optimized/4.webp",
    panoramaRotation: [0, Math.PI * 0.8, 0],
    hotspots: [
      { position: { x: 0, y: -0, z: 4 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: -0, z: 3.6 }, label: "", target: 5, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok ile C Blok Arası",
    image: "/locations/optimized/5.webp",
    panoramaRotation: [0, Math.PI * 0.7, 0],
    hotspots: [
      { position: { x: 0.4, y: -0, z: 3 }, label: "", target: 10, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Önü",
    image: "/locations/optimized/6.webp",
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: 2.5, y: -0.1, z: 2.6 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.1, z: -3 }, label: "", target: 3, type: 'animated-arrow-down' },
      { position: { x: 0.5, y: -0.1, z: -2.4 }, label: "", target: 6, type: 'animated-arrow-down' },
      { position: { x: -2, y: -0, z: 2.4 }, label: "", target: 10, type: 'animated-arrow-down' },
      { position: { x: -2.2, y: 0, z: -3 }, label: "", target: 4, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Giriş",
    image: "/locations/optimized/7.webp",
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -0.5, y: -0.1, z: 3.2 }, label: "", target: 5, type: 'animated-arrow-down' },
      { position: { x: 0.65, y: -0.1, z: -4 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "B Blok Koridor",
    image: "/locations/optimized/8.webp",
    panoramaRotation: [0, Math.PI * 0.8, 0],
    hotspots: [
      { position: { x: -0.6, y: -0.1, z: 3.8 }, label: "", target: 6, type: 'animated-arrow-down' },
      { position: { x: -2.3, y: -0.1, z: 1 }, label: "", target: 8, type: 'animated-arrow-down' },
      { position: { x: -0.2, y: -0.1, z: -2.9 }, label: "", target: 9, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Matematik ve Bilim Atölyesi",
    image: "/locations/optimized/9.webp",
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: 2.5, y: -0.1, z: -2.5 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Robotik Odası",
    image: "/locations/optimized/10.webp",
    panoramaRotation: [0, Math.PI * 0.3, 0],
    hotspots: [
      { position: { x: -2, y: -0.1, z: -2.8 }, label: "", target: 7, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Dörtyol",
    image: "/locations/optimized/11.webp",
    panoramaRotation: [0, Math.PI * 1.55, 0],
    hotspots: [
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 2, type: 'animated-arrow-down' },
      { position: { x: -3.8, y: -0.1, z: -0.3 }, label: "", target: 11, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0, z: -3 }, label: "", target: 4, type: 'animated-arrow-down' },
      { position: { x: -0.4, y: -0, z: 4 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0, z: -3 }, label: "", target: 5, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "C Blok Önü",
    image: "/locations/optimized/12.webp",
    panoramaRotation: [0, Math.PI * 1.26, 0],
    hotspots: [
      { position: { x: 3.8, y: -0.1, z: 0.3 }, label: "", target: 10, type: 'animated-arrow-down' },
      { position: { x: -2.2, y: -0.1, z: -1.5 }, label: "", target: 12, type: 'animated-arrow-right' },
      { position: { x: -1.5, y: 0, z: 2.1 }, label: "", target: 15, type: 'animated-arrow-up' },
      { position: { x: -3.2, y: -0.1, z: -0.5 }, label: "", target: 19, type: 'animated-arrow-down' },

    ],
  },
  {
    name: "C Blok",
    image: "/locations/optimized/14.webp",
    panoramaRotation: [0, Math.PI * 0.32, 0],
    hotspots: [
      { position: { x: -0.6, y: -0.1, z: 2 }, label: "", target: 11, type: 'animated-arrow-left' },
      { position: { x: -0, y: -0.1, z: -2 }, label: "", target: 13, type: 'animated-arrow-down' },
      { position: { x: 0.6, y: -0.1, z: -4 }, label: "", target: 14, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Bilgisayar Odası",
    image: "/locations/optimized/15.webp",
    panoramaRotation: [0, Math.PI * 1.48, 0],
    hotspots: [
      { position: { x: 2.2, y: -0.1, z: -0.5 }, label: "", target: 12, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Kimya Odası",
    image: "/locations/optimized/16.webp",
    panoramaRotation: [0, Math.PI * 1.05, 0],
    hotspots: [
      { position: { x: 2, y: -0.1, z: 0.4 }, label: "", target: 12, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "A Blok Öğretmen Girişi",
    image: "/locations/optimized/17.webp",
    panoramaRotation: [0, Math.PI * 1.22, 0],
    hotspots: [
      { position: { x: 0.2, y: -0.15, z: -2.3 }, label: "", target: 11, type: 'animated-arrow-down' },

      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 16, type: 'animated-arrow-down' },
      { position: { x: 0.2, y: -0.05, z: 3.1 }, label: "", target: 17, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.15, z: 2.1 }, label: "", target: 18, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Brifing Salonu",
    image: "/locations/optimized/18.webp",
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -2, y: -0.25, z: 0.4 }, label: "", target: 15, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Örnek Sınıf",
    image: "/locations/optimized/19.webp",
    panoramaRotation: [0, Math.PI * 1, 0],
    hotspots: [
      { position: { x: -2, y: -0.25, z: 0.7 }, label: "", target: 15, type: 'animated-arrow-right' },
      { position: { x: -2, y: -0.25, z: 1.1 }, label: "", target: 18, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "A Blok Hol",
    image: "/locations/optimized/20.webp",
    panoramaRotation: [0, Math.PI * 1.63, 0],
    hotspots: [
      { position: { x: -0.1, y: -0.05, z: -3.2 }, label: "", target: 17, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: 0.1 }, label: "", target: 39, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "20",
    image: "/locations/optimized/21.webp",
    panoramaRotation: [0, Math.PI * 0.95, 0],
    hotspots: [
      { position: { x: 3.5, y: -0.1, z: 0.5 }, label: "", target: 11, type: 'animated-arrow-down' },
      { position: { x: 1.5, y: -0.1, z: -3 }, label: "", target: 21, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: 0.05, z: 3 }, label: "", target: 22, type: 'animated-arrow-up' },

    ],
  },
  {
    name: "Koru (C Blok Yanı)",
    image: "/locations/optimized/22.webp",
    panoramaRotation: [0, Math.PI * 0.4, 0],
    hotspots: [
      { position: { x: 3, y: -0, z: 0.4 }, label: "", target: 21, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "C Blok Yanı",
    image: "/locations/optimized/23.webp",
    panoramaRotation: [0, Math.PI * 0.75, 0],
    hotspots: [
      { position: { x: -0.2, y: -0.05, z: 3.4 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -3.5, y: -0.05, z: -0.8 }, label: "", target: 20, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "BALEV Merdiven Önü",
    image: "/locations/optimized/24.webp",
    panoramaRotation: [0, Math.PI * 0.26, 0],
    hotspots: [
      { position: { x: -0, y: -0.1, z: -3.2 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -2.5, y: 0.2, z: 0 }, label: "", target: 23, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "BALEV Merdivenleri",
    image: "/locations/optimized/25.webp",
    panoramaRotation: [0, Math.PI * 0.02, 0],
    hotspots: [
      { position: { x: 3, y: -0.3, z: 0.1 }, label: "", target: 19, type: 'animated-arrow-down' },
      { position: { x: -3, y: 0.14, z: -0.3 }, label: "", target: 24, type: 'animated-arrow-right' },
    ],
  },
  {
    name: "BALEV Yanı",
    image: "/locations/optimized/26.webp",
    panoramaRotation: [0, Math.PI * 0.15, 0],
    hotspots: [
      { position: { x: -3, y: -0.1, z: 1.5 }, label: "", target: 25, type: 'animated-arrow-down' },
      { position: { x: 2.5, y: -0.1, z: 2.5 }, label: "", target: 23, type: 'animated-arrow-right' },
    ],
  },
  {
    name: "BALEV Arkası",
    image: "/locations/optimized/27.webp",
    panoramaRotation: [0, Math.PI * 0.4, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.25, z: 0 }, label: "", target: 26, type: 'animated-arrow-down' },
      { position: { x: 3, y: 0.1, z: 0 }, label: "", target: 24, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (BALEV Arkası)",
    image: "/locations/optimized/28.webp",
    panoramaRotation: [0, Math.PI * 0.65, 0],
    hotspots: [
      { position: { x: 0.5, y: -0.05, z: 3.2 }, label: "", target: 27, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (Arka Giriş)",
    image: "/locations/optimized/29.webp",
    panoramaRotation: [0, Math.PI * -0.2, 0],
    hotspots: [
      { position: { x: 3, y: -0.05, z: -0.5 }, label: "", target: 28, type: 'animated-arrow-down' },
      { position: { x: -1, y: -0.05, z: -3.5 }, label: "", target: 26, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Koru (A Blok Arkası)",
    image: "/locations/optimized/30.webp",
    panoramaRotation: [0, Math.PI * -0.25, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 0.7 }, label: "", target: 27, type: 'animated-arrow-down' },
      { position: { x: 2.2, y: -0.1, z: 2.2 }, label: "", target: 29, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Kantin Yanı",
    image: "/locations/optimized/31.webp",
    panoramaRotation: [0, Math.PI * 0.25, 0],
    hotspots: [
      { position: { x: -2, y: -0.05, z: -3 }, label: "", target: 28, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.1, z: 0.7 }, label: "", target: 30, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "31",
    image: "/locations/optimized/32.webp",
    panoramaRotation: [0, Math.PI * -0, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: -1.75 }, label: "", target: 29, type: 'animated-arrow-down' },
      { position: { x: -0.5, y: -0.05, z: 3.5 }, label: "", target: 31, type: 'animated-arrow-down' },
      { position: { x: 2, y: -0.05, z: 2.75 }, label: "", target: 32, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: -2.75 }, label: "", target: 38, type: 'animated-arrow-right' },
      { position: { x: 3, y: -0.05, z: -3.5 }, label: "", target: 39, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "Müzik / Resim Atölyeleri",
    image: "/locations/optimized/33.webp",
    panoramaRotation: [0, Math.PI * 1.25, 0],
    hotspots: [
      { position: { x: 0.75, y: -0.05, z: -3.5 }, label: "", target: 30, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Müzik Atölyesi Arkası",
    image: "/locations/optimized/34.webp",
    panoramaRotation: [0, Math.PI * 0, 0],
    hotspots: [
      { position: { x: -1.2, y: -0.05, z: -3 }, label: "", target: 30, type: 'animated-arrow-down' },
      { position: { x: 0.5, y: -0.05, z: 3 }, label: "", target: 33, type: 'animated-arrow-left' },
    ],
  },
  {
    name: "G Blok Arkası",
    image: "/locations/optimized/35.webp",
    panoramaRotation: [0, Math.PI * -0.4, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: -2 }, label: "", target: 32, type: 'animated-arrow-right' },
      { position: { x: 2, y: -0.05, z: -3.2 }, label: "", target: 34, type: 'animated-arrow-down' },
      { position: { x: 3.5, y: -0.05, z: -0.85 }, label: "", target: 35, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "G Blok Önü",
    image: "/locations/optimized/36.webp",
    panoramaRotation: [0, Math.PI * 1.6, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 2.5 }, label: "", target: 33, type: 'animated-arrow-down' },
      { position: { x: 1.45, y: -0, z: 3 }, label: "", target: 37, type: 'animated-arrow-up' },
      { position: { x: -2, y: -0, z: -3 }, label: "", target: 38, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "36",
    image: "/locations/optimized/37.webp",
    panoramaRotation: [0, Math.PI * -0.15, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: .6 }, label: "", target: 33, type: 'animated-arrow-down' },
      { position: { x: -0.7, y: -0.05, z: -4 }, label: "", target: 36, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Halı Saha",
    image: "/locations/optimized/38.webp",
    panoramaRotation: [0, Math.PI * -0.2, 0],
    hotspots: [
      { position: { x: 1, y: -0.05, z: 3.2 }, label: "", target: 35, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "G Blok",
    image: "/locations/optimized/39.webp",
    panoramaRotation: [0, Math.PI * 0.83, 0],
    hotspots: [
      { position: { x: -0.5, y: -0.05, z: -3 }, label: "", target: 34, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Eski Kantin",
    image: "/locations/optimized/40.webp",
    panoramaRotation: [0, Math.PI * 0.05, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.05, z: 1 }, label: "", target: 30, type: 'animated-arrow-down' },
      { position: { x: -2.8, y: -0, z: -3 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: 1.8, y: -0.05, z: 3.5 }, label: "", target: 34, type: 'animated-arrow-down' },
      { position: { x: -1, y: -0., z: -4 }, label: "", target: 40, type: 'animated-arrow-up' },

    ],
  },
  {
    name: "A Blok Önü",
    image: "/locations/optimized/41.webp",
    panoramaRotation: [0, Math.PI * 0.7, 0],
    hotspots: [
      { position: { x: -3, y: -0.05, z: 1.7 }, label: "", target: 30, type: 'animated-arrow-left' },
      { position: { x: -3.5, y: -0.05, z: -1.2 }, label: "", target: 18, type: 'animated-arrow-up' },
      { position: { x: -3, y: -0.1, z: -3 }, label: "", target: 10, type: 'animated-arrow-right' },
      { position: { x: 2.9, y: 0.1, z: 3 }, label: "", target: 38, type: 'animated-arrow-down' },
      { position: { x: 3, y: -0.05, z: -2.5 }, label: "", target: 40, type: 'animated-arrow-down' },

    ],
  },
  {
    name: "Spor Sahası",
    image: "/locations/optimized/42.webp",
    panoramaRotation: [0, Math.PI * 0.5, 0],
    hotspots: [
      { position: { x: -3.5, y: -0., z: 2 }, label: "", target: 39, type: 'animated-arrow-down' },
      { position: { x: -0, y: -0., z: 3.5 }, label: "", target: 38, type: 'animated-arrow-up' },
      { position: { x: 4, y: -0.05, z: -1 }, label: "", target: 41, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Spor Salonu Önü",
    image: "/locations/optimized/43.webp",
    panoramaRotation: [0, Math.PI * 1.35, 0],
    hotspots: [
      { position: { x: -3.5, y: -0.0, z: .7 }, label: "", target: 40, type: 'animated-arrow-up' },
      { position: { x: -1.5, y: -0.1, z: -3.7 }, label: "", target: 0, type: 'animated-arrow-down' },
    ],
  },
  {
    name: "Tören Alanı",
    image: "/locations/optimized/44.webp",
    panoramaRotation: [0, Math.PI * 0.59, 0],
    hotspots: [
      { position: { x: -0, y: -0.05, z: 3.7 }, label: "", target: 1, type: 'animated-arrow-up' },
    ],
  },
  {
    name: "Konferans Salonu",
    image: "/locations/optimized/45.webp",
    panoramaRotation: [0, Math.PI * 1.4, 0],
    hotspots: [
      { position: { x: -1, y: -0.1, z: -3.5 }, label: "", target: 0, type: 'animated-arrow-right' },
    ],
  },
];

const GLOBAL_SIDEBAR_LOCATION_INDICES = [
  0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
  14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 31, 32, 33, 34, 36, 37,
  38, 39, 40, 41, 42, 43, 44 // removed 1, 2, 19, 30, 35
]; // Array.from({ length: locations.length }, (_, i) => i); // Default: show all locations

// --- Panorama Component (Updated to only use THREE.TextureLoader and anisotropic filtering) ---
interface PanoramaProps {
  imageUrl: string;
  onTextureLoaded: () => void;
  onTextureError: (error: Error) => void;
  meshRotation: [number, number, number]; // New prop for mesh rotation
}

function Panorama({ imageUrl, onTextureLoaded, onTextureError, meshRotation }: PanoramaProps) {
  let texture: THREE.Texture;

  try {
    texture = useLoader(THREE.TextureLoader, imageUrl);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    // Anisotropic Filtering for improved texture quality at oblique angles
    texture.anisotropy = 16; // Common high value, actual max depends on GPU capabilities

  } catch (error: any) {
    useEffect(() => {
      onTextureError(error);
    }, [error, onTextureError]);
    throw error;
  }

  useEffect(() => {
    if (texture) {
      onTextureLoaded();
    }
  }, [texture, onTextureLoaded]);

  return (
    <mesh scale={[-1, 1, 1]} rotation={meshRotation}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
// --- End Panorama Component ---

// --- Inline SVG Contents ---
const INFO_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`;
const ARROW_DOWN_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-down-icon lucide-arrow-big-down"><path d="M15 6v6h4l-7 7-7-7h4V6h6z"/></svg>`;
const ARROW_LEFT_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-left"><path d="M18 15h-6v4l-7-7 7-7v4h6v6z"/></svg>`;
const ARROW_RIGHT_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-right"><path d="M6 9h6V5l7 7-7 7v-4H6V9z"/></svg>`;
const ARROW_UP_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="purple" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-big-up-icon lucide-arrow-big-up"><path d="M9 18v-6H5l7-7 7 7h-4v6H9z"/></svg>`;
// --- End Inline SVG Contents ---

// Function to create a texture from SVG string at a higher resolution
// This is now only used for Three.js textures (hotspot icons)
const createTextureFromSvgString = async (svgString: string, width = 512, height = 512): Promise<THREE.Texture | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2D context for canvas.");
      resolve(null);
      return;
    }

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      URL.revokeObjectURL(url); // Clean up the object URL
      resolve(texture);
    };
    img.onerror = (error) => {
      console.error("Error loading SVG into canvas:", error);
      URL.revokeObjectURL(url); // Clean up the object URL
      resolve(null);
    };
    img.src = url;
  });
};


// --- HOTSPOT COMPONENT ---
interface HotspotComponentProps {
  hotspot: Hotspot;
  infoIconTexture: THREE.Texture | null;
  arrowDownIconTexture: THREE.Texture | null;
  arrowLeftIconTexture: THREE.Texture | null;
  arrowRightIconTexture: THREE.Texture | null;
  arrowUpIconTexture: THREE.Texture | null;
  onHotspotClick: (hotspot: Hotspot) => void;
}

function HotspotComponent({
  hotspot,
  infoIconTexture,
  arrowDownIconTexture,
  arrowLeftIconTexture,
  arrowRightIconTexture,
  arrowUpIconTexture,
  onHotspotClick
}: HotspotComponentProps) {
  const position = React.useMemo(() => new THREE.Vector3(
    hotspot.position.x * 50,
    hotspot.position.y * 50,
    hotspot.position.z * 50
  ), [hotspot.position]);

  const spriteRef = useRef<THREE.Sprite>(null);

  useFrame((state) => {
    if (hotspot.type && hotspot.type.startsWith('animated-arrow') && spriteRef.current) {
      const time = state.clock.elapsedTime;
      // Simple bounce animation: oscillate Y position relative to its initial position
      spriteRef.current.position.y = (hotspot.position.y * 50) + Math.sin(time * 2) * 3; // Adjust 3 for speed, 5 for amplitude
    }
  });

  const labelTexture = React.useMemo(() => {
    if (hotspot.type !== 'info' || !hotspot.label || hotspot.label.trim() === '') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const radius = 30;
      const x = 0;
      const y = 0;
      const width = canvas.width;
      const height = canvas.height;

      context.fillStyle = 'rgba(0, 0, 0, 0.7)';

      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.arcTo(x + width, y, x + width, y + radius, radius);
      context.lineTo(x + width, y + height - radius);
      context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
      context.lineTo(x + radius, y + height);
      context.arcTo(x, y + height, x, y + height - radius, radius);
      context.lineTo(x, y + radius);
      context.arcTo(x, y, x + radius, y, radius);
      context.closePath();
      context.fill();

      context.font = '60px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(hotspot.label, canvas.width / 2, canvas.height / 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [hotspot.label, hotspot.type]);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    onHotspotClick(hotspot);
  }, [hotspot, onHotspotClick]);

  if (hotspot.type === 'info') {
    if (!infoIconTexture) return null;

    return (
      <group position={position}>
        <sprite scale={[4, 4, 1.3]} onClick={handleClick}>
          <spriteMaterial map={infoIconTexture} transparent />
        </sprite>
        {labelTexture && (
          <sprite position={[0, 3, 0]} scale={[12, 3, 2]}>
            <spriteMaterial map={labelTexture} />
          </sprite>
        )}
      </group>
    );
  } else if (hotspot.type && hotspot.type.startsWith('animated-arrow')) {
    let currentArrowTexture: THREE.Texture | null = null;

    switch (hotspot.type) {
      case 'animated-arrow-down':
        currentArrowTexture = arrowDownIconTexture;
        break;
      case 'animated-arrow-left':
        currentArrowTexture = arrowLeftIconTexture;
        break;
      case 'animated-arrow-right':
        currentArrowTexture = arrowRightIconTexture;
        break;
      case 'animated-arrow-up':
        currentArrowTexture = arrowUpIconTexture;
        break;
      default:
        currentArrowTexture = null;
    }

    if (!currentArrowTexture) return null;

    // Rotate it -90 degrees around X to make it point horizontally (forward) on the 2D plane.
    const spriteRotation = new THREE.Euler(-Math.PI / 2, 0, 0);

    return (
      <group position={position}>
        <sprite ref={spriteRef} scale={[15, 15, 1.5]} onClick={handleClick} rotation={spriteRotation}>
          <spriteMaterial map={currentArrowTexture} transparent />
        </sprite>
      </group>
    );
  } else {
    return null;
  }
}
// --- END HOTSPOT COMPONENT ---

// --- Sidebar Component ---
interface SidebarProps {
  locations: Location[];
  currentLocation: number;
  setCurrentLocation: (index: number) => void;
  isOpen: boolean;
  onClose: () => void;
  locale: 'tr' | 'en'; // Add locale prop
}

function Sidebar({ locations, currentLocation, setCurrentLocation, isOpen, onClose, locale }: SidebarProps) {
  const t = translations[locale]; // Get current language translations

  const handleLocationClick = (index: number) => {
    setCurrentLocation(index);
    onClose(); // Close sidebar after navigating
  };

  // Use the global sidebar locations array
  const displayedLocations = React.useMemo(() => {
    const validLocations: { originalIndex: number; name: string; }[] = [];
    if (GLOBAL_SIDEBAR_LOCATION_INDICES && GLOBAL_SIDEBAR_LOCATION_INDICES.length > 0) {
      GLOBAL_SIDEBAR_LOCATION_INDICES.forEach(index => {
        if (locations[index]) { // Check if the location exists at this index
          validLocations.push({
            originalIndex: index,
            name: t.locations[index] || locations[index].name // Use translated name, fallback to original
          });
        }
      });
    } else {
      // Fallback to all locations if the global indices array is not valid
      locations.forEach((loc, index) => {
        validLocations.push({
          originalIndex: index,
          name: t.locations[index] || loc.name // Use translated name, fallback to original
        });
      });
    }
    return validLocations;
  }, [locations, t.locations]); // Depend on locations and translated locations

  return (
    <>
      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar content - Moved to right, made scrollable */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold select-none text-gray-800">{t.sidebarTitle}</h2> {/* Translated */}
          <button
            onClick={onClose}
            className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
            aria-label={t.sidebarCloseLabel} 
          >
            {/* Inline Close SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable area for navigation buttons */}
        <nav className="p-4 bg-gray-200 space-y-2 overflow-y-auto max-h-[calc(100%-8rem)]">
          {displayedLocations.map((location, index) => (
            <button
              key={location.originalIndex} // Use original index for key
              onClick={() => handleLocationClick(location.originalIndex)} // Pass original index
              className={`block w-full cursor-pointer select-none text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentLocation === location.originalIndex
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-800 hover:bg-blue-50'
                }`}
            >
              {location.name}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
// --- End Sidebar Component ---

// AccordionItem Component
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
        className="w-full flex justify-between items-center py-3 px-4 text-lg font-bold text-gray-800 hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
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
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[500vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Welcome Modal Component ---
interface WelcomeModalProps {
  onStartTour: () => void;
  language: 'tr' | 'en'; // Add language prop
  onLanguageToggle: () => void; // Add language toggle prop
}

function WelcomeModal({ onStartTour, language, onLanguageToggle }: WelcomeModalProps) {
  const t = translations[language]; // Get current language translations

  // State to manage which accordion sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Bu Proje Hakkında': false, // Use original keys for state management
    'Okulumuz Hakkında': false,
    'Tarihçesi': false,
    'Bu Sanal Turu Hazırlayanlar': false,
    'İletişim': false,
  });

  // Function to toggle the open/close state of an accordion section
  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-800 to-red-950 flex flex-col items-center z-[100] overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-8 max-sm:p-4 text-center transform scale-95 opacity-0 mt-0 animate-scaleIn flex flex-col flex-grow">
        <div className="flex-shrink-0">
          <img src="/logo.png" alt="Bornova Anadolu Lisesi Logo" className="mx-auto mb-6 w-32 h-32 object-contain" />
          <h1 className="text-4xl max-sm:text-2xl font-extrabold text-gray-900 mb-4 drop-shadow-md">
            {t.welcomeTitle}
          </h1>
        </div>

        <div className="text-left text-gray-800 space-y-2 mb-16 flex-grow overflow-y-auto pr-2">

          <AccordionItem
            title={t.aboutProjectTitle}
            isOpen={openSections['Bu Proje Hakkında']}
            onToggle={() => toggleSection('Bu Proje Hakkında')}
          >
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
              <ul className="list-disc list-inside space-y-1">
                {t.targetAudienceList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.innovationTitle}</h3>
              <ul className="list-disc list-inside space-y-1">
                {t.innovationList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.technicalDescriptionTitle}</h3>
              <p>{t.technicalDescriptionText}</p>

              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.valueAndImpactTitle}</h3>
              <ul className="list-disc list-inside space-y-1">
                {t.valueAndImpactList.map((item, index) => (
                  <li key={index}><strong>{item.strong}</strong> {item.text}</li>
                ))}
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{t.futureStepsTitle}</h3>
              <ul className="list-disc list-inside space-y-1">
                {t.futureStepsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem
            title={t.aboutSchoolTitle}
            isOpen={openSections['Okulumuz Hakkında']}
            onToggle={() => toggleSection('Okulumuz Hakkında')}
          >
            <div className="space-y-4">
              <p>{t.aboutSchoolText}</p>
              <ul className="list-disc list-inside space-y-1">
                {t.schoolInfoList.map((item, index) => (
                  <li key={index}>
                    <strong>{item.strong}</strong> {item.text}
                    {(item.strong === "Resmî Sitesi:" || item.strong === "Official Website:") && (
                      <a href="https://izmirbal.meb.k12.tr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">izmirbal.meb.k12.tr</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </AccordionItem>

          <AccordionItem
            title={t.historyTitle}
            isOpen={openSections['Tarihçesi']}
            onToggle={() => toggleSection('Tarihçesi')}
          >
            <div className="space-y-4">
              <p>{t.historyParagraph1}</p>
              <p>{t.historyParagraph2}</p>
              <p>{t.historyParagraph3}</p>
              <p>{t.historyParagraph4}</p>
            </div>
          </AccordionItem>

          <AccordionItem
            title={t.developersTitle}
            isOpen={openSections['Bu Sanal Turu Hazırlayanlar']}
            onToggle={() => toggleSection('Bu Sanal Turu Hazırlayanlar')}
          >
            <ul className="list-disc list-inside space-y-1">
              <li><strong>{t.software}</strong> <a href="https://www.instagram.com/emre.bozqurt/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Emre Bozkurt</a></li>
              <li><strong>{t.softwareAssistant}</strong> <a href="https://www.instagram.com/_canberk_q/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Canberk Özçağan</a></li>
              <li><strong>{t.projectOfficer}</strong> <a href="https://www.instagram.com/basar.muslu/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ali Başar Muslu</a></li>
            </ul>
          </AccordionItem>

          <AccordionItem
            title={t.contactTitle}
            isOpen={openSections['İletişim']}
            onToggle={() => toggleSection('İletişim')}
          >
            <ul className="list-disc list-inside space-y-1">
              <li><strong>{t.software}</strong> <a href="mailto:contact@emreb.com.tr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">contact@emreb.com.tr</a></li>
              <li><strong>{t.softwareAssistant}</strong> <a href="mailto:canberkozcagan@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">canberkozcagan@gmail.com</a></li>
              <li><strong>{t.projectOfficer}</strong> <a href="mailto:abasarmuslu@gmail.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">abasarmuslu@gmail.com</a></li>
            </ul>
          </AccordionItem>

        </div>

        <button
          onClick={onStartTour}
          className="px-8 py-3 mt-8 bg-blue-600 text-white cursor-pointer font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-500 transform hover:scale-102 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {t.startTourButton}
        </button>

        {/* Language Switch Button - Only visible on Welcome Modal */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onLanguageToggle}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full shadow-md hover:bg-gray-300 transition-colors text-sm font-semibold"
          >
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


export default function VirtualTour() {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<InfoContent | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const [showWelcomeModal, setShowWelcomeModal] = useState(true); // New: State to control welcome modal visibility
  const [language, setLanguage] = useState<'tr' | 'en'>('tr'); // Language state lifted here

  const t = translations[language]; // Get current language translations

  const infoIconTextureRef = useRef<THREE.Texture | null>(null);
  const arrowDownIconTextureRef = useRef<THREE.Texture | null>(null);
  const arrowLeftIconTextureRef = useRef<THREE.Texture | null>(null);
  const arrowRightIconTextureRef = useRef<THREE.Texture | null>(null);
  const arrowUpIconTextureRef = useRef<THREE.Texture | null>(null);

  const orbitControlsRef = useRef<any>(null); // Ref for OrbitControls

  const [panoramaMeshRotation, setPanoramaMeshRotation] = useState<[number, number, number]>([0, 0, 0]);

  const handleHotspotClick = useCallback((hotspot: Hotspot) => {
    if (hotspot.target !== undefined) {
      setIsLoading(true); // Show loading when changing location
      setCurrentLocation(hotspot.target);
    } else if (hotspot.info) {
      setModalContent(hotspot.info);
      setShowModal(true);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  const handleStartTour = useCallback(() => {
    setShowWelcomeModal(false);
  }, []);

  const handleLanguageToggle = useCallback(() => {
    setLanguage(prevLang => (prevLang === 'tr' ? 'en' : 'tr'));
  }, []);

  useEffect(() => {
    // Load info icon texture from inline SVG
    createTextureFromSvgString(INFO_SVG_CONTENT, 64, 64).then((texture) => {
      infoIconTextureRef.current = texture;
      console.log('Info icon texture loaded from inline SVG.');
    });

    // Load arrow icon textures from inline SVG
    createTextureFromSvgString(ARROW_DOWN_SVG_CONTENT, 512, 512).then((texture) => {
      arrowDownIconTextureRef.current = texture;
      console.log('Arrow Down icon texture loaded from inline SVG.');
    });
    createTextureFromSvgString(ARROW_LEFT_SVG_CONTENT, 512, 512).then((texture) => {
      arrowLeftIconTextureRef.current = texture;
      console.log('Arrow Left icon texture loaded from inline SVG.');
    });
    createTextureFromSvgString(ARROW_RIGHT_SVG_CONTENT, 512, 512).then((texture) => {
      arrowRightIconTextureRef.current = texture;
      console.log('Arrow Right icon texture loaded from inline SVG.');
    });
    createTextureFromSvgString(ARROW_UP_SVG_CONTENT, 512, 512).then((texture) => {
      arrowUpIconTextureRef.current = texture;
      console.log('Arrow Up icon texture loaded from inline SVG.');
    });

  }, []);

  useEffect(() => {
    // Only set loading state and panorama rotation if the welcome modal is not shown
    if (!showWelcomeModal) {
      setIsLoading(true);
      const currentLocData = locations[currentLocation];
      if (currentLocData.panoramaRotation) {
        setPanoramaMeshRotation(currentLocData.panoramaRotation);
      } else {
        setPanoramaMeshRotation([0, 0, 0]); // Default to no rotation if not specified
      }
    }
  }, [currentLocation, showWelcomeModal]); // Depend on currentLocation and showWelcomeModal

  // Effect for setting initial camera target - now also depends on showWelcomeModal
  useEffect(() => {
    if (!isLoading && orbitControlsRef.current && locations[currentLocation]?.initialCameraTarget) {
      const initialTarget = locations[currentLocation].initialCameraTarget;
      if (initialTarget) {
        orbitControlsRef.current.target.set(...initialTarget);
        orbitControlsRef.current.update();
        console.log(`Set initial camera target for location ${currentLocation} to:`, initialTarget);
      }
    }
  }, [isLoading, currentLocation, locations]); // Removed showWelcomeModal from dependencies to prevent re-triggering after modal close

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden font-inter">
      {/* Welcome Modal - Rendered conditionally */}
      {showWelcomeModal && <WelcomeModal onStartTour={handleStartTour} language={language} onLanguageToggle={handleLanguageToggle} />}

      {/* Main Tour Content - Rendered only if welcome modal is dismissed */}
      {!showWelcomeModal && (
        <>
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white text-lg">{t.loadingText}</p> {/* Translated loading text */}
              </div>
            </div>
          )}

          {/* Info Modal */}
          {showModal && modalContent && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 relative">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{modalContent.title}</h3>
                <p className="text-gray-700 text-sm mb-4">{modalContent.description}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                  className="absolute top-2 right-2 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                  aria-label={t.closeButtonText} // Translated close button label
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Hamburger Menu Button - Moved to right, using inline SVG */}
          <button
            onClick={toggleSidebar}
            className="absolute top-4 right-4 cursor-pointer z-40 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors"
            aria-label={t.openSidebarLabel} // Translated sidebar toggle label
          >
            {/* Inline Hamburger SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Sidebar Component */}
          <Sidebar
            locations={locations}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            locale={language} // Pass the language state here
          />

          <a href='https://www.instagram.com/emre.bozqurt' target='_blank' rel='noopener noreferrer'
            className="absolute bottom-4 left-[50%] max-sm:bottom-2 max-sm:text-sm max-sm:w-[95vw] underline -translate-x-1/2 w-fit text-center cursor-pointer z-40 p-2 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors">
            {language == "tr" ? `Bu website Emre Bozkurt'28 tarafından yapılmıştır.` : `This website was made by Emre Bozkurt'28`}
          </a>

          {/* THREE.JS CANVAS CONTAINER */}
          <Canvas
            dpr={[1, 2]}
            camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 0.1] }}
            className="w-full h-full"
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0); // Make canvas background transparent
            }}
          >
            <Suspense fallback={null}>
              <Panorama
                imageUrl={locations[currentLocation].image}
                onTextureLoaded={() => setIsLoading(false)}
                onTextureError={(error) => {
                  console.error("Error loading panorama texture:", error);
                  setIsLoading(false);
                }}
                meshRotation={panoramaMeshRotation}
              />

              {locations[currentLocation].hotspots.map((hotspot, index) => (
                <HotspotComponent
                  key={index}
                  hotspot={hotspot}
                  infoIconTexture={infoIconTextureRef.current}
                  arrowDownIconTexture={arrowDownIconTextureRef.current}
                  arrowLeftIconTexture={arrowLeftIconTextureRef.current}
                  arrowRightIconTexture={arrowRightIconTextureRef.current}
                  arrowUpIconTexture={arrowUpIconTextureRef.current}
                  onHotspotClick={handleHotspotClick}
                />
              ))}
            </Suspense>

            <OrbitControls
              ref={orbitControlsRef}
              enableDamping
              dampingFactor={0.05}
              minDistance={1}
              maxDistance={1000}
              target={locations[currentLocation].initialCameraTarget ? new THREE.Vector3(...locations[currentLocation].initialCameraTarget!) : new THREE.Vector3(0, 0, 0)}
              enableZoom={false}
              rotateSpeed={-0.7}
            />
          </Canvas>
        </>
      )}
    </div>
  );
}
