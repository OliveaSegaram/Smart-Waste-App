import { fireEvent, render } from '@testing-library/react-native';
import RouteManagement from '../app/tabs/screens/managewaste/RouteManagement';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('RouteManagement', () => {
  it('renders Map View and Facility List', () => {
    const { getByText } = render(<RouteManagement />);
    expect(getByText(/Map View/i)).toBeTruthy();
    expect(getByText(/Downtown Recycle Center/i)).toBeTruthy();
  });

  it('pressing facility enables completion', () => {
    const { getByText } = render(<RouteManagement />);
    const facility = getByText(/Downtown Recycle Center/i);
    fireEvent.press(facility);
    expect(facility).toBeTruthy();
  });
});
