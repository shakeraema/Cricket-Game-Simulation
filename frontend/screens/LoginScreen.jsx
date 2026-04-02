import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "../components/auth/LoginForm";
import { useLogin } from "../hooks/useLogin";

export default function LoginScreen({ navigation, onLoggedIn }) {
  const [statusText, setStatusText] = useState("");

  const { email, setEmail, password, setPassword, isLoading, error, handleLogin } =
    useLogin((result) => {
      const userEmail = result?.user?.email || "user";
      setStatusText(`Login success for ${userEmail}`);

      if (typeof onLoggedIn === "function") {
        onLoggedIn(result);
      }
    });

  const handleSignupPress = () => {
    navigation.navigate("Signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.backgroundTopGlow} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <LoginForm
          email={email}
          error={error}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSignupPress={handleSignupPress}
          onSubmit={handleLogin}
          password={password}
        />

        {!!statusText && <Text style={styles.statusText}>{statusText}</Text>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#043d5e",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#043d5e",
  },
  backgroundTopGlow: {
    position: "absolute",
    top: -120,
    alignSelf: "center",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: "#0ea5b5",
    opacity: 0.25,
  },
  statusText: {
    marginTop: 14,
    color: "#dbeafe",
    fontWeight: "600",
  },
});
