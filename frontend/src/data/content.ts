import type {
  CropItem,
  FeatureItem,
  NavItem,
  StatItem,
  StepItem,
  WeatherItem,
} from '../types/content';

export const navItems: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Crops', href: '#crops' },
  { label: 'About', href: '#about' },
];

export const heroTypedWords = [
  'Grow More Yield.',
  'AI-Powered Advice.',
  'Better Harvests.',
  'Smarter Farming.',
];

export const heroStats: StatItem[] = [
  { value: '500+', label: 'Farmers Served' },
  { value: '98%', label: 'Model Precision' },
  { value: '3x', label: 'Yield Improvement' },
];

export const featureItems: FeatureItem[] = [
  {
    title: 'AI Crop Recommendations',
    description:
      'Actionable guidance based on your soil conditions, local weather, and growth stage.',
    icon: 'AI',
  },
  {
    title: 'Real-Time Weather Feed',
    description:
      'Forecast and current weather context for your specific farm location.',
    icon: 'WX',
  },
  {
    title: 'SMS Alerts for Any Phone',
    description:
      'Critical irrigation and crop alerts sent directly to basic and smart phones.',
    icon: 'SMS',
  },
  {
    title: 'Fast Event Pipeline',
    description:
      'Event-driven architecture keeps recommendations responsive under load.',
    icon: 'EV',
  },
  {
    title: 'Bilingual Experience',
    description:
      'English and French support for farmers across Cameroon and beyond.',
    icon: 'FR/EN',
  },
  {
    title: 'Progress Analytics',
    description:
      'Track recommendations and outcomes over time to improve season decisions.',
    icon: 'BI',
  },
];

export const processSteps: StepItem[] = [
  {
    title: 'Create Account',
    description: 'Sign up and add your farm location and preferred crops.',
    icon: '01',
  },
  {
    title: 'Submit Farm Data',
    description: 'Share moisture, crop type, and growth stage in under a minute.',
    icon: '02',
  },
  {
    title: 'Model Analyzes',
    description: 'The engine combines weather context with your farm inputs instantly.',
    icon: '03',
  },
  {
    title: 'Get Action Plan',
    description: 'Receive a clear recommendation with urgency and confidence.',
    icon: '04',
  },
];

export const cropItems: CropItem[] = [
  { name: 'Maize', tag: 'MZ' },
  { name: 'Tomato', tag: 'TM' },
  { name: 'Groundnut', tag: 'GN' },
  { name: 'Plantain', tag: 'PL' },
  { name: 'Cassava', tag: 'CS' },
  { name: 'Beans', tag: 'BN' },
  { name: 'Rice', tag: 'RC' },
  { name: 'Sweet Potato', tag: 'SP' },
  { name: 'Onion', tag: 'ON' },
  { name: 'Leafy Greens', tag: 'LG' },
];

export const weatherItems: WeatherItem[] = [
  { label: 'Temperature', value: '27C', symbol: 'T' },
  { label: 'Humidity', value: '68%', symbol: 'H' },
  { label: 'Rainfall', value: '2mm', symbol: 'R' },
  { label: 'Wind', value: '12 km/h', symbol: 'W' },
];
