import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getMatchHistory } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";

export default function DashboardTab({ session, onOpenHistory, onStartNewMatch, navigation }) {
  const [matchCount, setMatchCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  const loadMatchCount = useCallback(async () => {
    setIsLoadingCount(true);
    try {
      const response = await getMatchHistory();
      if (response?.success && Array.isArray(response.data)) {
        setMatchCount(response.data.length);
      } else {
        setMatchCount(0);
      }
    } catch {
      setMatchCount(0);
    } finally {
      setIsLoadingCount(false);
    }
  }, []);

  useEffect(() => {
    loadMatchCount();
  }, [loadMatchCount]);

  useFocusEffect(
    useCallback(() => {
      loadMatchCount();
    }, [loadMatchCount])
  );

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader
        navigation={navigation}
        title="Cricket Dashboard"
        subtitle={`Welcome, ${session?.user?.name || "Player"}`}
        canGoDashboard={false}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subtitle}>Quick actions</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Matches</Text>
        {isLoadingCount ? (
          <ActivityIndicator color="#0f766e" />
        ) : (
          <Text style={styles.cardValue}>{matchCount}</Text>
        )}

        <Pressable
          onPress={onOpenHistory}
          style={({ pressed }) => [styles.linkPill, pressed && styles.pressed]}
        >
          <Text style={styles.linkPillText}>View Previous Matches</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onStartNewMatch}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
      >
        <Text style={styles.primaryButtonText}>Start New Match</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7fafc",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0891b2",
    letterSpacing: -1,
  },
  linkPill: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#a5f3fc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkPillText: {
    color: "#0891b2",
    fontWeight: "700",
    fontSize: 13,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#0891b2",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
