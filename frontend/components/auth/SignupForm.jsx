import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignupForm({
  name,
  email,
  password,
  isLoading,
  error,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onLoginPress,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Create Account</Text>

      {!!error && <Text style={styles.errorMessage}>{error}</Text>}

      <TextInput
        autoCapitalize="words"
        autoCorrect={false}
        editable={!isLoading}
        onChangeText={onNameChange}
        placeholder="Full Name"
        placeholderTextColor="#7a8699"
        style={styles.input}
        value={name}
      />

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        keyboardType="email-address"
        onChangeText={onEmailChange}
        placeholder="Email"
        placeholderTextColor="#7a8699"
        style={styles.input}
        value={email}
      />

      <TextInput
        autoCapitalize="none"
        editable={!isLoading}
        onChangeText={onPasswordChange}
        placeholder="Password (min. 6 characters)"
        placeholderTextColor="#7a8699"
        secureTextEntry
        style={styles.input}
        value={password}
      />

      <Pressable
        disabled={isLoading}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          (pressed || isLoading) && styles.buttonPressed,
        ]}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Text>
      </Pressable>

      <Text style={styles.footerText}>
        Already have an account?{" "}
        <Text onPress={onLoginPress} style={styles.footerLink}>
          Sign in
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
    gap: 12,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 32,
    color: "#2d3748",
    fontWeight: "700",
  },
  errorMessage: {
    color: "#b42318",
    backgroundColor: "#fee4e2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecdca",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f7fafc",
    color: "#2d3748",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontSize: 16,
  },
  submitButton: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#06658f",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 8,
    textAlign: "center",
    color: "#4a5568",
    fontSize: 15,
  },
  footerLink: {
    color: "#075985",
    fontWeight: "700",
  },
});
