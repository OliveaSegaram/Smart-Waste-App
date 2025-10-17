import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import DashboardScreen from '../../app/(tabs)/screens/ManageAccount/DashboardScreen';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com'
    }
  }
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => {
    // Simulate focus effect by calling the callback
    const React = require('react');
    React.useEffect(() => {
      const unsubscribe = callback();
      return unsubscribe;
    }, []);
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock icons with testID support
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const createMockIcon = (name) => {
    return React.forwardRef((props, ref) => 
      React.createElement(View, { ...props, testID: name, ref })
    );
  };

  return {
    DollarSign: createMockIcon('DollarSign'),
    Trash2: createMockIcon('Trash2'),
    Award: createMockIcon('Award'),
    Calendar: createMockIcon('Calendar'),
    Bell: createMockIcon('Bell'),
    User: createMockIcon('User'),
    LogOut: createMockIcon('LogOut'),
    Edit2: createMockIcon('Edit2'),
    X: createMockIcon('X'),
    MapPin: createMockIcon('MapPin'),
    Phone: createMockIcon('Phone'),
    Mail: createMockIcon('Mail'),
  };
});

// Suppress console warnings
const originalError = console.error;
const originalLog = console.log;
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

describe('DashboardScreen - Essential Tests', () => {
  
  const mockUserData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St, Colombo',
    userType: 'Resident',
  };

  const mockCollectionData = {
    id: 'collection-1',
    organicWaste: 10,
    recyclableWaste: 5,
    totalWeight: 15,
    totalCost: 50,
    status: 'Unpaid',
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    createdAt: new Date().toISOString(),
  };

  const mockScheduleData = {
    id: 'schedule-1',
    userId: 'test-user-123',
    wasteType: 'Organic',
    preferredDate: '25/10/2024',
    preferredTime: '09:00',
    status: 'Scheduled',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    
    // Mock user data
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserData,
    });

    // Mock empty collections by default
    getDocs.mockResolvedValue({
      empty: true,
      size: 0,
      docs: [],
      forEach: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Fetches user data on mount
  test('should fetch user data when component mounts', async () => {
    render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getDoc).toHaveBeenCalled();
    });
  });

  // Test 2: Displays fetched user data
  test('should display user name after fetching data', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Welcome, John Doe')).toBeTruthy();
    });
  });

  // Test 3: Fetches collections data
  test('should fetch collections data on mount', async () => {
    render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getDocs).toHaveBeenCalled();
    });
  });

  // Test 4: Displays schedule data correctly
  test('should display scheduled pickup when data exists', async () => {
    // Mock getDocs to return schedule data on second call
    let callCount = 0;
    getDocs.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call - collections (empty)
        return Promise.resolve({
          empty: true,
          size: 0,
          docs: [],
          forEach: jest.fn(),
        });
      } else {
        // Second call - schedules (with data)
        return Promise.resolve({
          empty: false,
          size: 1,
          docs: [{
            id: 'schedule-1',
            data: () => mockScheduleData
          }],
          forEach: (callback) => {
            callback({ id: 'schedule-1', data: () => mockScheduleData });
          },
        });
      }
    });

    const { getByText } = render(<DashboardScreen />);
    
    // Wait for user data
    await waitFor(() => {
      expect(getByText('Welcome, John Doe')).toBeTruthy();
    });

    // Wait for schedule data to appear
    await waitFor(() => {
      expect(getByText('09:00')).toBeTruthy();
      expect(getByText('Organic')).toBeTruthy();
    }, { timeout: 4000 });
  });

  // Test 5: Handles empty data gracefully
  test('should show no data messages when collections are empty', async () => {
    const { getByText } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('No collections yet')).toBeTruthy();
      expect(getByText('No schedule yet')).toBeTruthy();
    });
  });

  // Test 6: Profile modal functionality
  test('should open and display profile information', async () => {
    const { getByText, getByTestId } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Welcome, John Doe')).toBeTruthy();
    });

    // Open profile modal
    const profileButton = getByTestId('User');
    fireEvent.press(profileButton);

    // Check profile information
    await waitFor(() => {
      expect(getByText('My Profile')).toBeTruthy();
      expect(getByText('john@example.com')).toBeTruthy();
      expect(getByText('1234567890')).toBeTruthy();
      expect(getByText('123 Main St, Colombo')).toBeTruthy();
    });
  });

  // Test 7: Profile update functionality
  test('should update profile data successfully', async () => {
    updateDoc.mockResolvedValue({});

    const { getByText, getByPlaceholderText, getByTestId } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Welcome, John Doe')).toBeTruthy();
    });

    // Open profile modal
    const profileButton = getByTestId('User');
    fireEvent.press(profileButton);
    
    // Open edit modal
    await waitFor(() => {
      fireEvent.press(getByText('Edit Profile'));
    });

    // Update name field
    const nameInput = getByPlaceholderText('Enter your full name');
    fireEvent.changeText(nameInput, 'Jane Doe');

    // Save changes
    fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Profile updated successfully');
    });
  });

  // Test 8: Validates required fields
  test('should validate required fields when updating profile', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<DashboardScreen />);
    
    await waitFor(() => {
      expect(getByText('Welcome, John Doe')).toBeTruthy();
    });

    // Open profile modal
    const profileButton = getByTestId('User');
    fireEvent.press(profileButton);
    
    // Open edit modal
    await waitFor(() => {
      fireEvent.press(getByText('Edit Profile'));
    });

    // Clear required field
    const nameInput = getByPlaceholderText('Enter your full name');
    fireEvent.changeText(nameInput, '');

    // Try to save with empty field
    fireEvent.press(getByText('Save Changes'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill all fields');
    });
  });

  // Test 9: Handles API errors gracefully
  test('should handle Firestore errors when fetching data', async () => {
    // Mock Firestore error
    getDoc.mockRejectedValue(new Error('Firestore error'));
    
    const { getByText } = render(<DashboardScreen />);
    
    await waitFor(() => {
      // Should still render the component without crashing
      expect(getByText(/Welcome/)).toBeTruthy();
    });
  });
});