
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { Trash2, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const COLORS = {
  primary: "#5DADE2",
  secondary: "#6b7280",
  accent: "#10B981",
  error: "#ef4444",
  white: "#ffffff",
  background: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  textLight: "#6B7280",
};

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login...");
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Firebase Auth successful, fetching user data...");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        Alert.alert("Error", "User data not found. Please contact support.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.userType || "resident";
      
      console.log("Login successful, user role:", userRole);

      Alert.alert("Success", `Welcome back, ${userData.fullName}!`, [
        {
          text: "OK",
          onPress: () => {
            // Navigate based on user role
            if (userRole === "business") {
              router.replace("/(tabs)/screens/ManageAccount/BusinessDashboardScreen");
            } else {
              router.replace("/(tabs)/screens/ManageAccount/DashboardScreen");
            }
          }
        }
      ]);

    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred.";
      }

      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    router.push("/(tabs)/screens/ManageAccount/RegisterScreen");
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password reset feature coming soon!");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Trash2 size={48} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your waste collection
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.form}>
              <Text style={styles.formTitle}>Login to your account</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={COLORS.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={COLORS.secondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <Eye size={20} color={loading ? COLORS.border : COLORS.secondary} />
                    ) : (
                      <EyeOff size={20} color={loading ? COLORS.border : COLORS.secondary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegisterRedirect} disabled={loading}>
                  <Text style={styles.registerLink}>Register Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: "bold", color: COLORS.white, marginBottom: 10 },
  subtitle: { fontSize: 15, color: "rgba(255, 255, 255, 0.9)", textAlign: "center" },
  formContainer: { flex: 1, paddingTop: 30 },
  form: { paddingHorizontal: 24, paddingBottom: 40 },
  formTitle: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginBottom: 24, textAlign: "center" },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  eyeIcon: { padding: 8 },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  rememberMeContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  checkboxInner: { width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.white },
  rememberMeText: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  forgotPasswordText: { fontSize: 14, color: COLORS.primary, fontWeight: "600" },
  loginButton: {
    backgroundColor: COLORS.primary, // ✅ CHANGED TO BLUE
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary, // ✅ CHANGED TO BLUE
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: { backgroundColor: COLORS.secondary, opacity: 0.7 },
  loadingContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  loginButtonText: { color: COLORS.white, fontSize: 17, fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: COLORS.textLight, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingTop: 8 },
  footerText: { fontSize: 15, color: COLORS.textLight },
  registerLink: { fontSize: 15, color: COLORS.primary, fontWeight: "700" },
});

export default LoginScreen;