import { HeroSection } from '@/components/layout/hero-section';
import { FeaturesSection } from '@/components/layout/features-section';
import { PopularProcedures } from '@/components/procedures/popular-procedures';
import { ChatWidget } from '@/components/chat/chat-widget';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PopularProcedures />
      <ChatWidget />
    </>
  );
}