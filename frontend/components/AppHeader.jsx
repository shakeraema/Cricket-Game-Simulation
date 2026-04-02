import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppHeader({
  navigation,
  title,
  subtitle,
  style,
  onBackPress,
  canGoDashboard = true,
  titleColor = "#1a202c",
  subtitleColor = "#718096",
  iconColor = "#0891b2",
  disabledIconColor = "#94a3b8",
}) {
  const canGoBack = Boolean(navigation?.canGoBack?.());

  const handleBack = () => {
    if (typeof onBackPress === "function") {
      onBackPress();
      return;
    }

    if (canGoBack) {
      navigation.goBack();
    }
  };

  const handleGoDashboard = () => {
    if (!canGoDashboard) {
      return;
    }

    const routeNames = navigation?.getState?.()?.routeNames || [];

    if (routeNames.includes("Home")) {
      navigation.navigate("Home");
      return;
    }

    if (routeNames.includes("Dashboard")) {
      navigation.navigate("Dashboard");
      return;
    }

    if (routeNames.includes("Login")) {
      navigation.navigate("Login");
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconRow}>
        <Pressable
          onPress={handleBack}
          disabled={!canGoBack}
          style={({ pressed }) => [styles.iconButton, (!canGoBack || pressed) && styles.pressed]}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={34}
            color={canGoBack ? iconColor : disabledIconColor}
          />
        </Pressable>

        <Pressable
          onPress={handleGoDashboard}
          disabled={!canGoDashboard}
          style={({ pressed }) => [
            styles.iconButton,
            (!canGoDashboard || pressed) && styles.pressed,
          ]}
        >
          <Ionicons
            name="speedometer-outline"
            size={30}
            color={canGoDashboard ? iconColor : disabledIconColor}
          />
        </Pressable>
      </View>

      {!!title && <Text style={[styles.title, { color: titleColor }]}>{title}</Text>}
      {!!subtitle && <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
});
