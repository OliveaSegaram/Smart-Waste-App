// src/hooks/useRegisterForm.js
import { useState } from 'react';
import { Alert } from 'react-native';
import { validateRegistration } from '../../utils/ManageAccount/formValidation';

export const useRegisterForm = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    userType: 'resident',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Correctly defined function for updating state
  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegister = () => {
    const error = validateRegistration(form);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    Alert.alert('Success', 'Account created successfully!');
    console.log('Registered User:', form);
  };

  return {
    form,
    handleChange,
    handleRegister,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
  };
};
