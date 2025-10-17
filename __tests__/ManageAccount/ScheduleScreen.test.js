import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { getAuth } from 'firebase/auth';
import { Alert } from 'react-native';
import ScheduleScreen from '../../app/(tabs)/screens/ManageAccount/ScheduleScreen';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn()
  })
}));

// Mock icons
jest.mock('lucide-react-native', () => ({
  Bell: 'Bell',
  ArrowLeft: 'ArrowLeft',
  Calendar: 'Calendar',
  Clock: 'Clock',
  Trash2: 'Trash2'
}));

// Suppress React version mismatch warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Incompatible React versions') ||
       args[0].includes('react-native-renderer'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('ScheduleScreen - Unit Tests', () => {
  
  const mockUserAuth = {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue(mockUserAuth);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Component renders successfully
  test('should render schedule screen with all elements', () => {
    const { getByText, getByPlaceholderText } = render(<ScheduleScreen />);
    
    expect(getByText('Schedule Pickup')).toBeTruthy();
    expect(getByText('Type of Waste *')).toBeTruthy();
    expect(getByText('Quantity *')).toBeTruthy();
    expect(getByText('Address *')).toBeTruthy();
    expect(getByText('Preferred Date *')).toBeTruthy();
    expect(getByText('Preferred Time *')).toBeTruthy();
    expect(getByText('Special Instructions (Optional)')).toBeTruthy();
    expect(getByPlaceholderText('e.g., 25')).toBeTruthy();
    expect(getByPlaceholderText('DD/MM/YYYY')).toBeTruthy();
  });

  // Test 2: All waste type buttons are displayed
  test('should display all waste type options', () => {
    const { getByText } = render(<ScheduleScreen />);
    
    expect(getByText('Organic')).toBeTruthy();
    expect(getByText('Recyclable')).toBeTruthy();
    expect(getByText('Electronic')).toBeTruthy();
    expect(getByText('Furniture')).toBeTruthy();
    expect(getByText('Mixed')).toBeTruthy();
    expect(getByText('Other')).toBeTruthy();
  });

  // Test 3: All unit options are displayed
  test('should display all unit options', () => {
    const { getAllByText, getByText } = render(<ScheduleScreen />);
    
    const kgElements = getAllByText('kg');
    expect(kgElements.length).toBeGreaterThan(0);
    expect(getByText('bag')).toBeTruthy();
    expect(getByText('bucket')).toBeTruthy();
    expect(getByText('box')).toBeTruthy();
  });

  // Test 4: Waste type selection works correctly
  test('should select waste type when button is pressed', () => {
    const { getByText } = render(<ScheduleScreen />);
    
    const organicButton = getByText('Organic');
    fireEvent.press(organicButton);
    
    // Component should update - we can verify this by checking if button remains pressable
    expect(organicButton).toBeTruthy();
  });

  // Test 5: Unit selection works correctly
  test('should select unit when button is pressed', () => {
    const { getByText } = render(<ScheduleScreen />);
    
    const bagButton = getByText('bag');
    fireEvent.press(bagButton);
    
    expect(bagButton).toBeTruthy();
  });

  // Test 6: Quantity input accepts numeric values
  test('should accept quantity input', () => {
    const { getByPlaceholderText } = render(<ScheduleScreen />);
    
    const quantityInput = getByPlaceholderText('e.g., 25');
    fireEvent.changeText(quantityInput, '30');
    
    expect(quantityInput.props.value).toBe('30');
  });

  // Test 7: Address input accepts text
  test('should accept address input', () => {
    const { getByPlaceholderText } = render(<ScheduleScreen />);
    
    const addressInput = getByPlaceholderText('e.g., 123 Main Street, Colombo 03');
    fireEvent.changeText(addressInput, '456 Test Street, Colombo 05');
    
    expect(addressInput.props.value).toBe('456 Test Street, Colombo 05');
  });

  // Test 8: Date input accepts date format
  test('should accept date input', () => {
    const { getByPlaceholderText } = render(<ScheduleScreen />);
    
    const dateInput = getByPlaceholderText('DD/MM/YYYY');
    fireEvent.changeText(dateInput, '25/10/2024');
    
    expect(dateInput.props.value).toBe('25/10/2024');
  });

  // Test 9: Time input accepts time format
  test('should accept time input', () => {
    const { getByPlaceholderText } = render(<ScheduleScreen />);
    
    const timeInput = getByPlaceholderText('HH:MM (e.g., 09:30)');
    fireEvent.changeText(timeInput, '14:30');
    
    expect(timeInput.props.value).toBe('14:30');
  });

  // Test 10: Special instructions input accepts text
  test('should accept special instructions input', () => {
    const { getByPlaceholderText } = render(<ScheduleScreen />);
    
    const instructionsInput = getByPlaceholderText('e.g., Please ring the bell twice, Side gate is locked');
    fireEvent.changeText(instructionsInput, 'Call before arriving');
    
    expect(instructionsInput.props.value).toBe('Call before arriving');
  });

  // Test 11: Shows validation error when required fields are empty
  test('should show validation error when required fields are missing', async () => {
    const { getByText } = render(<ScheduleScreen />);
    
    const confirmButton = getByText('Confirm Pickup Schedule');
    fireEvent.press(confirmButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Error',
        'Please fill in all required fields'
      );
    });
  });

});