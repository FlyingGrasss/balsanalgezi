// app/page.tsx
import IntroModal from '@/components/IntroModal';
import TourExperience from '@/components/TourExperience';

export default function Home() {
  return (
    <>
      <main className="fixed inset-0">
        <TourExperience introModal={<IntroModal />} />
      </main>
    </>
  );
}
