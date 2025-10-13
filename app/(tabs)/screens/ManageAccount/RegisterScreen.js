import React from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { COLORS } from '../../styles/ManageAccount/RegisterScreen';
import { useRegisterForm } from '../../hooks/ManageAccount/useRegisterForm';
import { RegisterForm } from '../../components/ManageAccount/RegisterForm';

export default function RegisterScreen() {
  const {
    form,
    handleChange,
    handleRegister,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
  } = useRegisterForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trash2 size={40} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our waste management community</Text>
        </View>

        <View style={styles.form}>
          <RegisterForm
            form={form}
            handleChange={handleChange}
            handleRegister={handleRegister}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.white, marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255, 255, 255, 0.9)' },
  form: { padding: 20, marginTop: -10 },
});
