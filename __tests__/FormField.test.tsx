/**
 * Component test: Validates that FormField renders correctly with the provided
 * label and placeholder, and fires its onChangeText callback when user input is simulated.
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '@/components/FormField';

// Mock the ThemeContext so FormField gets a theme without full app setup
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      text: '#000',
      textSecondary: '#666',
      border: '#ccc',
      inputBg: '#f9f9f9',
      danger: '#dc2626',
      primary: '#1e40af',
    },
  }),
}));

describe('FormField component', () => {
  it('renders the label correctly', () => {
    const { getByText } = render(
      <FormField label="Email Address" placeholder="Enter email" onChangeText={() => {}} />
    );
    expect(getByText('Email Address')).toBeTruthy();
  });

  it('renders with the correct placeholder', () => {
    const { getByPlaceholderText } = render(
      <FormField label="Email" placeholder="you@example.com" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('calls onChangeText when user types', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <FormField label="Name" placeholder="Enter name" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter name'), 'John');
    expect(onChangeText).toHaveBeenCalledWith('John');
  });

  it('displays error message when error prop is provided', () => {
    const { getByText } = render(
      <FormField label="Email" placeholder="Enter email" onChangeText={() => {}} error="This field is required" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not display error message when error prop is not provided', () => {
    const { queryByRole } = render(
      <FormField label="Email" placeholder="Enter email" onChangeText={() => {}} />
    );
    expect(queryByRole('alert')).toBeNull();
  });

  it('has an accessible label matching the label prop', () => {
    const { getByLabelText } = render(
      <FormField label="Trip Name" placeholder="Enter trip name" onChangeText={() => {}} />
    );
    expect(getByLabelText('Trip Name')).toBeTruthy();
  });
});
