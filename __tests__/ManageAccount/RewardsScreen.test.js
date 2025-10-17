import { render, waitFor } from '@testing-library/react-native';
import { getAuth } from 'firebase/auth';
import { getDoc, getDocs } from 'firebase/firestore';
import RewardsScreen from '../../app/(tabs)/screens/ManageAccount/RewardsScreen';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn()
}));

// Mock Expo Router - Execute callback using useEffect instead
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({
      back: jest.fn(),
      push: jest.fn()
    }),
    useFocusEffect: (callback) => {
      React.useEffect(() => {
        callback();
      }, []);
    }
  };
});

// Mock icons
jest.mock('lucide-react-native', () => ({
  Bell: 'Bell',
  Recycle: 'Recycle',
  Percent: 'Percent',
  TrendingUp: 'TrendingUp',
  ArrowLeft: 'ArrowLeft',
  Lock: 'Lock',
  Award: 'Award'
}));

describe('RewardsScreen - UI Rendering Tests', () => {
  
  const mockUserAuth = {
    currentUser: {
      uid: 'test-user-123',
      email: 'test@example.com'
    }
  };

  const mockUserRewardsData = {
    userId: 'test-user-123',
    totalPoints: 150,
    claimedRewards: [],
    activeDiscount: null,
    createdAt: '2024-10-01T00:00:00.000Z',
    lastUpdated: '2024-10-15T00:00:00.000Z'
  };

  const mockRewardTasks = [
    {
      id: '1',
      name: '5% Discount',
      description: 'Get 5% off your next payment',
      pointsRequired: 50,
      rewardType: 'discount',
      rewardValue: 5,
      icon: 'percent',
      iconColor: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      id: '2',
      name: '10% Discount',
      description: 'Get 10% off your next payment',
      pointsRequired: 100,
      rewardType: 'discount',
      rewardValue: 10,
      icon: 'percent',
      iconColor: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      id: '3',
      name: 'Bonus Points',
      description: 'Get 50 bonus points',
      pointsRequired: 200,
      rewardType: 'bonus_points',
      rewardValue: 50,
      icon: 'award',
      iconColor: '#8B5CF6',
      bgColor: '#EDE9FE'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue(mockUserAuth);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Shows loading state initially
  test('should show loading indicator initially', () => {
    getDoc.mockImplementation(() => new Promise(() => {}));
    getDocs.mockImplementation(() => new Promise(() => {}));
    
    const { getByText } = render(<RewardsScreen />);
    
    expect(getByText('Loading rewards...')).toBeTruthy();
  });

  // Test 2: Renders rewards screen with user points
  test('should render rewards screen with user points', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('My Rewards')).toBeTruthy();
      expect(getByText('150')).toBeTruthy();
      expect(getByText('Total Points')).toBeTruthy();
    });
  });

  // Test 3: Displays available rewards correctly
  test('should display available rewards correctly', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('Available Rewards')).toBeTruthy();
      expect(getByText('5% Discount')).toBeTruthy();
      expect(getByText('10% Discount')).toBeTruthy();
      expect(getByText('Bonus Points')).toBeTruthy();
    });
  });

  // Test 4: Shows correct reward point requirements
  test('should show correct point requirements for rewards', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('50 pts')).toBeTruthy();
      expect(getByText('100 pts')).toBeTruthy();
      expect(getByText('200 pts')).toBeTruthy();
    });
  });

  // Test 5: Shows progress information for rewards
  test('should display progress information for rewards', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('150 / 50 pts')).toBeTruthy();
      expect(getByText('150 / 100 pts')).toBeTruthy();
      expect(getByText('150 / 200 pts')).toBeTruthy();
    });
  });

  // Test 6: Shows ready to claim status for unlocked rewards
  test('should show ready to claim status for unlocked rewards', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getAllByText } = render(<RewardsScreen />);

    await waitFor(() => {
      const readyToClaim = getAllByText('✓ Ready to Claim');
      expect(readyToClaim.length).toBeGreaterThan(0);
    });
  });

  // Test 7: Shows remaining points needed for locked rewards
  test('should show remaining points needed for locked rewards', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('50 more points needed')).toBeTruthy();
    });
  });

  // Test 8: Shows empty state when no rewards available
  test('should show empty state when no rewards are available', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: () => {}
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('No rewards available yet')).toBeTruthy();
      expect(getByText('Check back later for exciting rewards!')).toBeTruthy();
    });
  });

  // Test 9: Shows active discount banner when present
  test('should display active discount banner when user has active discount', async () => {
    const dataWithDiscount = {
      ...mockUserRewardsData,
      activeDiscount: {
        rewardId: '1',
        rewardName: '5% Discount',
        rewardType: 'discount',
        rewardValue: 5,
        pointsUsed: 50,
        claimedAt: '2024-10-15T00:00:00.000Z',
        status: 'active'
      }
    };

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => dataWithDiscount
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('Active Discount')).toBeTruthy();
      expect(getByText('5% off - 5% Discount')).toBeTruthy();
    });
  });

  // Test 10: Displays "How to Earn Points" information
  test('should display how to earn points information', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserRewardsData
    });

    getDocs.mockResolvedValue({
      forEach: (callback) => {
        mockRewardTasks.forEach(task => {
          callback({ id: task.id, data: () => task });
        });
      }
    });

    const { getByText } = render(<RewardsScreen />);

    await waitFor(() => {
      expect(getByText('How to Earn Points')).toBeTruthy();
      expect(getByText('Earn 1 point for every garbage collection payment')).toBeTruthy();
      expect(getByText('Points accumulate and unlock rewards')).toBeTruthy();
      expect(getByText('Claim rewards instantly once unlocked')).toBeTruthy();
    });
  });
});