import Image from 'next/image';

/**
 * Server-rendered landing content for the tour.
 *
 * Keep the meaningful copy in this Server Component so it is present in the
 * initial HTML response before the WebGL experience is loaded.
 */
export default function IntroModal() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-linear-to-br from-red-800 to-red-950 p-4 max-sm:p-3">
      <section
        id="intro-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-modal-title"
        aria-describedby="intro-modal-description"
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white text-center shadow-2xl max-sm:max-h-[calc(100vh-1.5rem)]"
      >
        <header className="shrink-0 p-8 pb-4 max-sm:p-4 max-sm:pb-2">
          <Image
            src="/logo.png"
            alt="Bornova Anadolu Lisesi logosu"
            width={128}
            height={128}
            priority
            className="mx-auto mb-5 h-24 w-24 object-contain max-sm:mb-3 max-sm:h-20 max-sm:w-20"
          />
          <h1
            id="intro-modal-title"
            className="text-4xl font-extrabold text-gray-900 drop-shadow-md max-sm:text-2xl"
          >
            Bornova Anadolu Lisesi 360° Sanal Gezi
          </h1>
          <p
            id="intro-modal-description"
            className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-700 max-sm:mt-2 max-sm:text-sm max-sm:leading-6"
          >
            Bornova Anadolu Lisesi kampüsünü 360° fotoğraflarla keşfedin; sınıfları,
            laboratuvarları, spor alanlarını ve sosyal alanları interaktif bir sanal
            turla inceleyin.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-4 text-left text-gray-800 max-sm:px-4">
          <h2 className="mb-2 text-xl font-bold text-gray-900">BAL360 Sanal Gezi</h2>
          <p className="leading-7">
            BAL360, Bornova Anadolu Lisesi kampüsünü uzaktan tanımanızı sağlayan,
            öğrenciler tarafından hazırlanmış bir 360° sanal kampüs tanıtım
            projesidir. Görüntünün içinde sürükleyerek etrafa bakabilir ve
            etkileşimli noktalarla farklı konumlara geçebilirsiniz.
          </p>

          <h2 className="mb-2 mt-6 text-xl font-bold text-gray-900">Okulumuz hakkında</h2>
          <p className="leading-7">
            Bornova Anadolu Lisesi, İzmir&apos;in Bornova ilçesinde bulunan ve üç dilde
            eğitim veren köklü bir Anadolu lisesidir. Bu sanal gezi, okulun fiziksel
            ortamını, eğitim alanlarını ve sosyal yaşamını daha yakından tanımanıza
            yardımcı olur.
          </p>

          <details className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <summary className="cursor-pointer font-bold text-gray-900">
              Proje hakkında daha fazla bilgi
            </summary>
            <p className="mt-3 leading-7">
              Projenin amacı, lise tercihi yapacak öğrencilerin ve velilerin okulun
              fiziksel, sosyal ve akademik ortamını uzaktan keşfedebilmesini
              sağlamaktır. Sanal tur, bilgisayar ve mobil cihazlarda web tarayıcısı
              üzerinden kullanılabilir.
            </p>
          </details>
        </div>

        <footer className="shrink-0 border-t border-gray-100 bg-white p-5 max-sm:p-4">
          <button
            id="intro-modal-start"
            type="button"
            data-intro-action="start"
            className="cursor-pointer rounded-full bg-blue-600 px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 max-sm:w-full"
          >
            Geziye Başla
          </button>
          <p className="mt-2 text-xs text-gray-500">
            Gezi başlatıldığında interaktif 360° görüntüleyici yüklenir.
          </p>
        </footer>
      </section>
    </div>
  );
}
