import 'react-native-gesture-handler/jestSetup';

// Mock expo modules
import '@testing-library/jest-native/extend-expect';

// Suppress RN warnings
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock reanimated (required by many RN components)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock Expo Router globally
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(() => Promise.resolve({ uri: 'mock-file-uri' })),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Share: {
      share: jest.fn(() => Promise.resolve()),
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
}));

// Mock images
jest.mock('../../assets/images/profile.jpg', () => 1);
jest.mock('../../assets/images/bin.jpg', () => 1);
