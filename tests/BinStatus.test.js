import { render, waitFor } from '@testing-library/react-native';
import BinStatus from '../app/tabs/screens/managewaste/BinStatus';

// Mock router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: () => ({ binId: 'ID-258800' }),
}));

// Mock Firestore
const mockGetDocs = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: (...args) => mockGetDocs(...args),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('BinStatus', () => {
  beforeEach(() => {
    mockGetDocs.mockReset();
  });

  it('displays available collectors', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 'c1', data: () => ({ fullName: 'Alice Collector' }) },
        { id: 'c2', data: () => ({ fullName: 'Bob Collector' }) },
      ],
    });

    const { getByText, findByText } = render(<BinStatus />);
    expect(getByText(/Available Collectors/i)).toBeTruthy();

    await waitFor(async () => {
      expect(await findByText(/Alice Collector/i)).toBeTruthy();
      expect(await findByText(/Bob Collector/i)).toBeTruthy();
    });
  });
});
