import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react-native';
import { COLORS } from '../../styles/ManageAccount/RegisterScreen';

const InputField = ({ icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, toggleEye }) => (
  <View style={styles.inputContainer}>
    <View style={styles.inputWrapper}>
      <Icon size={20} color={COLORS.secondary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {toggleEye && (
        <TouchableOpacity onPress={toggleEye} style={styles.eyeIcon}>
          {secureTextEntry ? <EyeOff size={20} color={COLORS.secondary} /> : <Eye size={20} color={COLORS.secondary} />}
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const RegisterForm = ({ form, handleChange, handleRegister, showPassword, showConfirmPassword, setShowPassword, setShowConfirmPassword }) => (
  <>
    {/* User Type Selection */}
    <View style={styles.userTypeContainer}>
      <Text style={styles.label}>I am a:</Text>
      <View style={styles.userTypeButtons}>
        {['resident', 'collector', 'business'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.userTypeButton, form.userType === type && styles.userTypeButtonActive]}
            onPress={() => handleChange('userType', type)}
          >
            <Text style={[styles.userTypeText, form.userType === type && styles.userTypeTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    {/* Input Fields */}
    <InputField icon={User} placeholder="Full Name" value={form.fullName} onChangeText={v => handleChange('fullName', v)} />
    <InputField icon={Mail} placeholder="Email Address" value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" />
    <InputField icon={Phone} placeholder="Phone Number" value={form.phone} onChangeText={v => handleChange('phone', v)} keyboardType="phone-pad" />
    <InputField icon={MapPin} placeholder="Address" value={form.address} onChangeText={v => handleChange('address', v)} />
    <InputField icon={Lock} placeholder="Password" value={form.password} onChangeText={v => handleChange('password', v)} secureTextEntry={!showPassword} toggleEye={() => setShowPassword(!showPassword)} />
    <InputField icon={Lock} placeholder="Confirm Password" value={form.confirmPassword} onChangeText={v => handleChange('confirmPassword', v)} secureTextEntry={!showConfirmPassword} toggleEye={() => setShowConfirmPassword(!showConfirmPassword)} />

    {/* Register Button */}
    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
      <Text style={styles.registerButtonText}>Register</Text>
    </TouchableOpacity>
  </>
);

const styles = StyleSheet.create({
  inputContainer: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 16, color: COLORS.text },
  eyeIcon: { padding: 8 },
  userTypeContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  userTypeButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  userTypeButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  userTypeText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  userTypeTextActive: { color: COLORS.white },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});
