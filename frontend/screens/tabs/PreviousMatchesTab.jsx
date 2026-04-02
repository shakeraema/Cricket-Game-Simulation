import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getMatchHistory } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";

function getResultLabel(match) {
  if (match?.result?.winner) return `${match.result.winner} won`;
  if (match?.status === "COMPLETED") return "Match ended";
  return "-";
}

function getHistoryStatusLabel(match) {
  if (match?.status === "COMPLETED") return "Completed";

  const hasTossCompleted = Boolean(match?.toss?.winner && match?.toss?.decision);
  if (!hasTossCompleted) return "Toss Pending";

  const firstInnings = match?.innings?.[0];
  const firstInningsPending =
    match?.currentInnings === 0 &&
    firstInnings &&
    (firstInnings.balls || 0) === 0 &&
    !firstInnings.completed;

  if (firstInningsPending) return "First Innings Pending";
  if (match?.status === "PAUSED") return "Paused";

  return "In Progress";
}

function getHistoryStatusStyle(label) {
  if (label === "Completed") return styles.statusCompleted;
  if (label === "Paused") return styles.statusPaused;
  if (label === "Toss Pending" || label === "First Innings Pending") return styles.statusPending;
  return styles.statusInProgress;
}

function MatchCard({ match, navigation }) {
  const statusLabel = getHistoryStatusLabel(match);
  const resultLabel = getResultLabel(match);

  const hasTossCompleted = Boolean(match?.toss?.winner && match?.toss?.decision);
  const buttonLabel = match?.status === "COMPLETED" ? "View" : "Play";

  const handlePress = () => {
    if (match?.status === "COMPLETED") {
      navigation.navigate("MatchView", { matchId: match?._id });
      return;
    }

    if (!hasTossCompleted) {
      navigation.navigate("TossScreen", {
        matchId: match?._id,
        teamA: match?.teamA,
        teamB: match?.teamB,
        oversLimit: match?.oversLimit ?? match?.overs,
      });
      return;
    }

    navigation.navigate("MatchPlay", { matchId: match?._id });
  };

  return (
    <SafeAreaView style={styles.matchCard}>
      <View style={styles.rowTop}>
        <Text style={styles.teamsText}>
          {match?.teamA || "Team A"} vs {match?.teamB || "Team B"}
        </Text>
        <Text style={styles.dateText}>
          {match?.createdAt ? new Date(match.createdAt).toLocaleDateString() : "-"}
        </Text>
      </View>

      <View style={styles.rowGrid}>
        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Overs</Text>
          <Text style={styles.infoValue}>{match?.oversLimit ?? match?.overs ?? "-"}</Text>
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusChip, getHistoryStatusStyle(statusLabel)]}>
            <Text style={styles.statusChipText}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>Result</Text>
        <Text style={styles.resultValue}>{resultLabel}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        onPress={handlePress}
      >
        <Text style={styles.actionButtonText}>{buttonLabel}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function PreviousMatchesTab({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await getMatchHistory();
      if (!response?.success) {
        throw new Error(response?.message || "Unable to load match history");
      }

      setMatches(Array.isArray(response.data) ? response.data.slice(0, 20) : []);
      setError("");
    } catch (err) {
      setError(err?.message || "Unable to load match history");
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.stateText}>Loading previous matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          onPress={() => loadHistory()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!matches.length) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateText}>No matches yet. Start your first match from Dashboard.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <AppHeader
        navigation={navigation}
        title="Previous Matches"
        subtitle="Recent match history"
        canGoDashboard={false}
      />

      <FlatList
        data={matches}
        keyExtractor={(item) => String(item?._id || Math.random())}
        renderItem={({ item }) => <MatchCard match={item} navigation={navigation} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHistory(true)}
            tintColor="#0f766e"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7fafc",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  matchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  teamsText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  rowGrid: {
    flexDirection: "row",
    gap: 10,
  },
  infoPill: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  infoLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusCompleted: {
    color: "#059669",
  },
  statusPaused: {
    color: "#d97706",
  },
  statusPending: {
    color: "#b45309",
  },
  statusInProgress: {
    color: "#0891b2",
  },
  statusChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#334155",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  resultLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  resultValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  actionButton: {
    marginTop: 8,
    backgroundColor: "#0891b2",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: "#f7fafc",
  },
  stateText: {
    fontSize: 15,
    textAlign: "center",
    color: "#718096",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    color: "#dc2626",
    fontWeight: "700",
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#0891b2",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.85,
  },
});
