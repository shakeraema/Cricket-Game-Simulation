import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";

export default function ProfileTab({ session, navigation, onLogout }) {
  const user = session?.user || {};
  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader
        navigation={navigation}
        title="My Profile"
        subtitle="Manage your account information"
        canGoDashboard={false}
      />

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarMeta}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userRole}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Player"}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      {/* Account Information Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        {/* Email Row */}
        <View style={styles.infoRow}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.icon}>✉</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email || "Not provided"}</Text>
          </View>
        </View>

        {/* Role Row */}
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <View style={styles.iconPlaceholder}>
            <Text style={styles.icon}>👤</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Account Role</Text>
            <Text style={styles.infoValue}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Player"}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusIndicator}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Account Active</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Avatar Section
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0891b2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },

  // Main Card
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a202c",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: "#1a202c",
    fontWeight: "700",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#edf2f7",
    marginVertical: 8,
  },

  // Status Card
  statusCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    color: "#16a34a",
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#043d5e",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
