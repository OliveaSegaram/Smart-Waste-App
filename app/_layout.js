import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)/screens/ManageAccount/LoginScreen" />
      <Stack.Screen name="(tabs)/screens/ManageAccount/RegisterScreen" />
      <Stack.Screen name="(tabs)/screens/ManageAccount/HomeScreen" />
    </Stack>
  );
}