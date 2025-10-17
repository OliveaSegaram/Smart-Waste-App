import { render } from '@testing-library/react-native';
import AdminDashboard from '../app/tabs/screens/managewaste/AdminDashboard';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('AdminDashboard', () => {
  it('renders dashboard title and stat cards', () => {
    const { getByText } = render(<AdminDashboard />);

    expect(getByText(/Admin Dashboard/i)).toBeTruthy();
    expect(getByText('50')).toBeTruthy(); // Total Bins
    expect(getByText('12')).toBeTruthy(); // Bins Needing Collection
    expect(getByText('Latest Bin Status')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = render(<AdminDashboard />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
