import { CtaBanner } from '../components/home/CtaBanner';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { HeroSection } from '../components/home/HeroSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { Navbar } from '../components/home/Navbar';
import { SiteFooter } from '../components/home/SiteFooter';
import { useTheme } from '../context/ThemeContext';

export function HomePage() {
  const { isDark } = useTheme();

  return (
    <div
      className={`transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-950'
      }`}
    >
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaBanner />
      <SiteFooter />
    </div>
  );
}
