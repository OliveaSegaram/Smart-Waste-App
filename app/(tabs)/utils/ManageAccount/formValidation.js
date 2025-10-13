// src/utils/formValidation.js

export const validateRegistration = (formData) => {
  const { fullName, email, phone, address, password, confirmPassword } = formData;

  if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
    return 'Please fill all fields';
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return 'Enter a valid email address';
  }

  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null; // ✅ valid form
};
