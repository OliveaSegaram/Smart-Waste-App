import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import {
  Trash2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../../firebase";
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

const RegisterScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("resident");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName || !email || !phone || !address || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log("Starting registration process...");

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
      console.log("Firebase Auth user created:", userId);

      // Save user info in Firestore
      const userData = {
        uid: userId,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        userType,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      const userRef = doc(db, "users", userId);
      await setDoc(userRef, userData);
      console.log("User data saved to Firestore with ID:", userId);

      Alert.alert(
        "Success!", 
        `Account created successfully as ${userType}!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate based on user type
              if (userType === "business") {
                router.replace("/(tabs)/screens/ManageAccount/BusinessDashboardScreen");
              } else {
                router.replace("/(tabs)/screens/ManageAccount/DashboardScreen");
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Registration failed. Please try again.";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Check your connection.";
          break;
        default:
          errorMessage = error.message || "An error occurred.";
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/(tabs)/screens/ManageAccount/LoginScreen");
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our waste management community</Text>
          </View>

          <View style={styles.form}>
            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <Text style={styles.label}>I am a:</Text>
              <View style={styles.userTypeButtons}>
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === "resident" && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType("resident")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === "resident" && styles.userTypeTextActive,
                    ]}
                  >
                    Resident
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.userTypeButton,
                    userType === "business" && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType("business")}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === "business" && styles.userTypeTextActive,
                    ]}
                  >
                    Business
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Full Name */}
            <InputField
              icon={<User size={20} color={COLORS.secondary} />}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            {/* Email */}
            <InputField
              icon={<Mail size={20} color={COLORS.secondary} />}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            {/* Phone */}
            <InputField
              icon={<Phone size={20} color={COLORS.secondary} />}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />

            {/* Address */}
            <InputField
              icon={<MapPin size={20} color={COLORS.secondary} />}
              placeholder="Full Address"
              value={address}
              onChangeText={setAddress}
              editable={!loading}
            />

            {/* Password */}
            <PasswordField
              label="Password"
              value={password}
              onChangeText={setPassword}
              showPassword={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              editable={!loading}
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showPassword={showConfirmPassword}
              toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              editable={!loading}
            />

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By registering, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                loading && styles.registerButtonDisabled
              ]} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.registerButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginRedirect} disabled={loading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const InputField = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType, 
  autoCapitalize = "sentences",
  editable = true 
}) => (
  <View style={styles.inputContainer}>
    <View style={[styles.inputWrapper, !editable && styles.inputDisabled]}>
      {icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  </View>
);

const PasswordField = ({ 
  label, 
  value, 
  onChangeText, 
  showPassword, 
  toggleShow, 
  editable = true 
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.passwordLabel}>{label}</Text>
    <View style={[styles.inputWrapper, !editable && styles.inputDisabled]}>
      <Lock size={20} color={COLORS.secondary} />
      <TextInput
        style={styles.input}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        editable={editable}
      />
      <TouchableOpacity onPress={toggleShow} disabled={!editable}>
        {showPassword ? (
          <Eye size={20} color={editable ? COLORS.secondary : COLORS.border} />
        ) : (
          <EyeOff size={20} color={editable ? COLORS.secondary : COLORS.border} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

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
  form: { padding: 20, marginTop: -10 },
  userTypeContainer: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 12 },
  userTypeButtons: { flexDirection: "row", gap: 12 },
  userTypeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userTypeButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  userTypeText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  userTypeTextActive: { color: COLORS.white },
  inputContainer: { marginBottom: 16 },
  passwordLabel: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginBottom: 8, marginLeft: 4 },
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
  inputDisabled: { backgroundColor: COLORS.background, opacity: 0.7 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text, marginLeft: 12 },
  termsContainer: { marginTop: 8, marginBottom: 16, paddingHorizontal: 8 },
  termsText: { fontSize: 12, color: COLORS.textLight, textAlign: "center" },
  termsLink: { color: COLORS.primary, fontWeight: "600" },
  registerButton: {
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
  registerButtonDisabled: { backgroundColor: COLORS.secondary, opacity: 0.7 },
  loadingContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  registerButtonText: { color: COLORS.white, fontSize: 17, fontWeight: "bold" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 16, fontSize: 13, color: COLORS.textLight, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 15, color: COLORS.textLight },
  loginLink: { fontSize: 15, color: COLORS.primary, fontWeight: "700" },
});

export default RegisterScreen;