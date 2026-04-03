import { CtaBanner } from '../components/home/CtaBanner';
import { CropsSection } from '../components/home/CropsSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { Navbar } from '../components/home/Navbar';
import { SiteFooter } from '../components/home/SiteFooter';

export function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CropsSection />
      <CtaBanner />
      <SiteFooter />
    </>
  );
}
