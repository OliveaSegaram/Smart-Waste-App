import { fireEvent, render } from '@testing-library/react-native';
import RouteSuccess from '../app/tabs/screens/managewaste/RouteSuccess';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('RouteSuccess', () => {
  it('renders success message and button', () => {
    const { getByText, getByTestId } = render(<RouteSuccess />);
    expect(getByText(/Awesome!/i)).toBeTruthy();
    expect(getByTestId('back-to-dashboard-btn')).toBeTruthy();
  });

  it('navigates to AdminDashboard when button pressed', () => {
    const { getByTestId } = render(<RouteSuccess />);
    fireEvent.press(getByTestId('back-to-dashboard-btn'));
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/screens/managewaste/AdminDashboard');
  });
});
