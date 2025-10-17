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
}));

// Mock images
jest.mock('../../assets/images/profile.jpg', () => 1);
jest.mock('../../assets/images/bin.jpg', () => 1);
