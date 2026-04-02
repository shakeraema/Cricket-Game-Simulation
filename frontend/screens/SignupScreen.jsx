import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignupForm from "../components/auth/SignupForm";
import { useSignup } from "../hooks/useSignup";

export default function SignupScreen({ navigation, onSignedUp }) {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleSignup,
  } = useSignup((result) => {
    if (typeof onSignedUp === "function") {
      onSignedUp(result);
    }
  });

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.backgroundTopGlow} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <SignupForm
          name={name}
          email={email}
          password={password}
          isLoading={isLoading}
          error={error}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignup}
          onLoginPress={handleLoginPress}
        />
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
});
