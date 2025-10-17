import { render, waitFor } from '@testing-library/react-native';
import { getAuth } from 'firebase/auth';
import { getDocs } from 'firebase/firestore';
import PaymentScreen from '../../app/(tabs)/screens/ManageAccount/PaymentScreen';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn()
  })
}));

// Mock Clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn()
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  ArrowLeft: 'ArrowLeft',
  Bell: 'Bell',
  CreditCard: 'CreditCard',
  Landmark: 'Landmark',
  CheckCircle: 'CheckCircle',
  Clock: 'Clock',
  Copy: 'Copy',
  Building2: 'Building2',
  Award: 'Award'
}));

describe('PaymentScreen - UI Rendering Tests', () => {
  
  const mockUnpaidRecords = [
    {
      id: '1',
      residentName: 'John Doe',
      collectionDate: '2024-10-15',
      month: 'October 2024',
      totalCost: '25.50',
      status: 'Unpaid'
    },
    {
      id: '2',
      residentName: 'Jane Smith',
      collectionDate: '2024-10-16',
      month: 'October 2024',
      totalCost: '20.00',
      status: 'Unpaid'
    }
  ];

  const mockUserAuth = {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue(mockUserAuth);
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('October 2024');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Shows loading state initially
  test('should show loading indicator initially', () => {
    getDocs.mockImplementation(() => new Promise(() => {}));
    
    const { getByText } = render(<PaymentScreen />);
    
    expect(getByText('Loading payment details...')).toBeTruthy();
  });

  // Test 2: Renders payment screen with unpaid bills
  test('should render payment screen with unpaid bills', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Pay Bill')).toBeTruthy();
      expect(getByText('Amount Due')).toBeTruthy();
      expect(getByText('$45.50')).toBeTruthy();
    });
  });

  // Test 3: Calculates total bill amount correctly
  test('should calculate total bill amount correctly', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      const totalAmount = getByText('$45.50');
      expect(totalAmount).toBeTruthy();
    });
  });

  // Test 4: Shows payment options
  test('should display payment options', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Credit/Debit Card')).toBeTruthy();
      expect(getByText('Pay securely via Stripe')).toBeTruthy();
      expect(getByText('Bank Transfer')).toBeTruthy();
      expect(getByText('Transfer to our bank account')).toBeTruthy();
    });
  });

  // Test 5: Shows reward points preview
  test('should show reward points preview', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Reward Points')).toBeTruthy();
      expect(getByText(/2 points/)).toBeTruthy();
    });
  });

  // Test 6: Shows empty state when no unpaid bills
  test('should show no pending payments when bill is zero', async () => {
    getDocs.mockResolvedValue({
      forEach: () => {}
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('$0.00')).toBeTruthy();
      expect(getByText('No Pending Payments')).toBeTruthy();
    });
  });

  // Test 7: Handles Firebase errors gracefully
  test('should handle Firebase errors without crashing', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    getDocs.mockRejectedValue(new Error('Firebase error'));

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Pay Bill')).toBeTruthy();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching current bill:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  // Test 8: Displays breakdown of unpaid records
  test('should display breakdown of unpaid collections', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText('Unpaid Collections:')).toBeTruthy();
      expect(getByText('2024-10-15')).toBeTruthy();
      expect(getByText('$25.50')).toBeTruthy();
      expect(getByText('2024-10-16')).toBeTruthy();
      expect(getByText('$20.00')).toBeTruthy();
    });
  });

  // Test 9: Displays correct month information
  test('should display correct month for billing period', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      expect(getByText(/October 2024/)).toBeTruthy();
    });
  });

  // Test 10: Shows correct number of unpaid records
  test('should show correct count of unpaid bills', async () => {
    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockUnpaidRecords.forEach(record => {
          callback({ id: record.id, data: () => record });
        });
      }
    });

    const { getByText } = render(<PaymentScreen />);

    await waitFor(() => {
      // Should show 2 unpaid collections
      expect(getByText('Unpaid Collections:')).toBeTruthy();
      expect(getByText('2024-10-15')).toBeTruthy();
      expect(getByText('2024-10-16')).toBeTruthy();
    });
  });
});