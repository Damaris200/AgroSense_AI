import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import '@/i18n';

// findBy* queries poll up to this long. The default (1000ms) is too short for
// pages that chain two async loads (e.g. getMyFarms → getWeatherForFarm) on the
// resource-starved CI runner, which caused intermittent "Unable to find element"
// failures for the weather and soil dashboard tests.
configure({ asyncUtilTimeout: 10000 });
