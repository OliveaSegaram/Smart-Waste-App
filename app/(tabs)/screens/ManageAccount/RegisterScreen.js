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
  ActivityIndicator
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

const COLORS = {
  primary: "#10b981",
  secondary: "#6b7280",
  error: "#ef4444",
  white: "#ffffff",
  background: "#f9fafb",
  border: "#e5e7eb",
  text: "#111827",
  textLight: "#6b7280",
};

const RegisterScreen = ({ navigation }) => {
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

      // ✅ Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
      console.log("Firebase Auth user created:", userId);

      // ✅ Save user info in Firestore with user ID as document ID
      const userData = {
        uid: userId,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address.trim(),
        userType,
        createdAt: new Date(),
        status: "active",
      };

      const userRef = doc(db, "users", userId);
      await setDoc(userRef, userData);
      console.log("User data saved to Firestore with ID:", userId);

      Alert.alert(
        "Success!", 
        "Account created successfully!\nYou can now login to your account.",
        [
          {
            text: "OK",
            onPress: () => {
              // Clear form fields
              setFullName("");
              setEmail("");
              setPhone("");
              setAddress("");
              setPassword("");
              setConfirmPassword("");
              
              // Navigate to login screen
              if (navigation) {
                navigation.navigate("Login");
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error("Registration error details:", {
        code: error.code,
        message: error.message,
        fullError: error
      });

      let errorMessage = "Registration failed. Please try again.";
      
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered. Please use a different email or login.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address format.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case "auth/configuration-not-found":
          errorMessage = "Authentication service not configured. Please contact support.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later.";
          break;
        case "permission-denied":
          errorMessage = "Database permission denied. Please contact support.";
          break;
        default:
          errorMessage = error.message || "An unexpected error occurred. Please try again.";
      }

      Alert.alert("Registration Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    if (navigation) {
      navigation.navigate("Login");
    } else {
      Alert.alert("Info", "Login screen navigation not configured");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Trash2 size={40} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our waste management community</Text>
        </View>

        <View style={styles.form}>
          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <Text style={styles.label}>I am a:</Text>
            <View style={styles.userTypeButtons}>
              {[
                { value: "resident", label: "Resident" },
                { value: "collector", label: "Collector" },
                { value: "business", label: "Business" }
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.userTypeButton,
                    userType === type.value && styles.userTypeButtonActive,
                  ]}
                  onPress={() => setUserType(type.value)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.userTypeText,
                      userType === type.value && styles.userTypeTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Full Name Input */}
          <InputField
            icon={<User size={20} color={COLORS.secondary} />}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          {/* Email Input */}
          <InputField
            icon={<Mail size={20} color={COLORS.secondary} />}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          {/* Phone Input */}
          <InputField
            icon={<Phone size={20} color={COLORS.secondary} />}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!loading}
          />

          {/* Address Input */}
          <InputField
            icon={<MapPin size={20} color={COLORS.secondary} />}
            placeholder="Full Address"
            value={address}
            onChangeText={setAddress}
            editable={!loading}
          />

          {/* Password Input */}
          <PasswordField
            label="Password"
            value={password}
            onChangeText={setPassword}
            showPassword={showPassword}
            toggleShow={() => setShowPassword(!showPassword)}
            editable={!loading}
          />

          {/* Confirm Password Input */}
          <PasswordField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            showPassword={showConfirmPassword}
            toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            editable={!loading}
          />

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By registering, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
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
  );
};

// 🔹 Reusable Input Component
const InputField = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType, 
  autoCapitalize = "sentences",
  autoComplete = "off",
  editable = true 
}) => (
  <View style={styles.inputContainer}>
    <View style={[
      styles.inputWrapper,
      !editable && styles.inputDisabled
    ]}>
      {icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        editable={editable}
        selectionColor={COLORS.primary}
      />
    </View>
  </View>
);

// 🔹 Reusable Password Input Component
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
    <View style={[
      styles.inputWrapper,
      !editable && styles.inputDisabled
    ]}>
      <Lock size={20} color={COLORS.secondary} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={COLORS.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        editable={editable}
        selectionColor={COLORS.primary}
      />
      <TouchableOpacity 
        onPress={toggleShow} 
        style={styles.eyeIcon}
        disabled={!editable}
      >
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
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingBottom: 30 
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: COLORS.white, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  form: { 
    padding: 20, 
    marginTop: -10 
  },
  userTypeContainer: { 
    marginBottom: 24 
  },
  label: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: COLORS.text, 
    marginBottom: 12 
  },
  userTypeButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userTypeButtonActive: { 
    borderColor: COLORS.primary, 
    backgroundColor: COLORS.primary 
  },
  userTypeText: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: COLORS.text 
  },
  userTypeTextActive: { 
    color: COLORS.white 
  },
  inputContainer: { 
    marginBottom: 16 
  },
  passwordLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    opacity: 0.7,
  },
  input: { 
    flex: 1, 
    paddingVertical: 16, 
    fontSize: 16, 
    color: COLORS.text,
    marginLeft: 12,
  },
  inputIcon: {
    marginRight: 0,
  },
  eyeIcon: { 
    padding: 8 
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 16,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    backgroundColor: COLORS.secondary,
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: "bold",
    marginLeft: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: { 
    fontSize: 14, 
    color: COLORS.textLight 
  },
  loginLink: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: "600" 
  },
});

export default RegisterScreen;