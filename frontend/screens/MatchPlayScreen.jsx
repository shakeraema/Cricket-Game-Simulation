import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getMatchById,
  playBall,
  pauseMatch,
  resumeMatch,
  startSecondInnings,
} from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "../components/AppHeader";

export default function MatchPlayScreen({ route, navigation }) {
  const { matchId } = route.params || {};

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showInningsComplete, setShowInningsComplete] = useState(false);
  const [showBatsmenModal, setShowBatsmenModal] = useState(false);
  const [showBowlersModal, setShowBowlersModal] = useState(false);
  const [message, setMessage] = useState("");

  const extractMatchPayload = (response) => { 
    const payload = response?.data;
    if (!payload) return null;
    if (payload.match) return payload.match;
    return payload;
  };

  const isInningsComplete = (innings) => {
    return Boolean(innings?.completed || innings?.isComplete);
  };

  const fetchLatestMatch = async () => {
    const response = await getMatchById(matchId);
    if (!response?.success) {
      throw new Error(response?.message || "Failed to fetch match");
    }

    const latestMatch = extractMatchPayload(response);
    setMatch(latestMatch);
    return latestMatch;
  };

  useEffect(() => {
    let mounted = true;

    const fetchMatch = async () => {
      try {
        const response = await getMatchById(matchId);
        if (mounted && response?.success) {
          const data = extractMatchPayload(response);
          setMatch(data);

          // Check if match is completed
          if (data?.status === "COMPLETED") {
            navigation.replace("MatchView", { matchId });
            return;
          }

          // Check if innings was just completed
          if (data?.currentInnings === 0 && !showInningsComplete) {
            const firstInnings = data?.innings?.[0];
            if (isInningsComplete(firstInnings)) {
              setShowInningsComplete(true);
            }
          }
        }
      } catch (error) {
        console.error("Fetch match error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMatch();
    return () => {
      mounted = false;
    };
  }, [matchId, navigation, showInningsComplete]);

  const handlePlayBall = async () => {
    if (!match || actionLoading) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await playBall(matchId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to play ball");
      }

      const updatedMatch = extractMatchPayload(response);
      setMatch(updatedMatch);

      const currentInnings = updatedMatch.innings[updatedMatch.currentInnings];
      const lastBall = currentInnings?.ballLog?.[currentInnings.ballLog.length - 1];
      const ballResult =
        lastBall?.outcome === "W"
          ? "Wicket"
          : `${lastBall?.runs ?? 0} run${(lastBall?.runs ?? 0) === 1 ? "" : "s"}`;
      setMessage(
        `Over ${currentInnings?.overs ?? 0}.${currentInnings?.balls ?? 0} • ${ballResult} • ${currentInnings?.runs ?? 0}/${currentInnings?.wickets ?? 0}`,
      );

      // Check if innings is complete
      if (isInningsComplete(currentInnings)) {
        if (updatedMatch.currentInnings === 0 && updatedMatch.innings.length < 2) {
          setShowInningsComplete(true);
        }
      }

      // Check if match is complete
      if (updatedMatch.status === "COMPLETED") {
        setTimeout(() => {
          navigation.replace("MatchView", { matchId });
        }, 1000);
      }
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to play ball");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async () => {
    if (!match || actionLoading) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await pauseMatch(matchId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to pause match");
      }

      await fetchLatestMatch();
      setMessage("Match paused");
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to pause match");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!match || actionLoading) return;

    setActionLoading(true);
    setMessage("");

    try {
      const response = await resumeMatch(matchId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to resume match");
      }

      await fetchLatestMatch();
      setMessage("Match resumed");
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to resume match");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartSecondInnings = async () => {
    if (!match || actionLoading) return;

    setActionLoading(true);
    setShowInningsComplete(false);
    setMessage("");

    try {
      const response = await startSecondInnings(matchId);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to start second innings");
      }

      const updatedMatch = extractMatchPayload(response);
      setMatch(updatedMatch);
      setMessage("Second innings started");
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to start second innings");
      setShowInningsComplete(true);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <ActivityIndicator color="#0f766e" size="large" />
          <Text style={styles.loadingText}>Loading match...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <AppHeader navigation={navigation} title="Match Play" />
          <Text style={styles.errorText}>Match not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentInnings = match.innings[match.currentInnings];
  const inningsNumber = match.currentInnings + 1;
  const isFirstInnings = match.currentInnings === 0;
  const isSecondInnings = match.currentInnings === 1;
  const isPaused = match.status === "PAUSED";
  const isInProgress = match.status === "IN_PROGRESS";

  const battingTeam =
    match.innings[match.currentInnings]?.battingTeam === match.teamA
      ? match.teamA
      : match.teamB;
  const bowlingTeam =
    match.innings[match.currentInnings]?.bowlingTeam === match.teamA
      ? match.teamA
      : match.teamB;

  const target =
    isSecondInnings && match.innings[0]
      ? match.innings[0].runs + 1
      : null;

  const batsmen = Array.isArray(currentInnings?.batsmen)
    ? currentInnings.batsmen
    : [];
  const bowlers = Array.isArray(currentInnings?.bowlers)
    ? currentInnings.bowlers
    : [];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          navigation={navigation}
          title="Match Play"
          subtitle={`Innings ${inningsNumber}`}
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Batting</Text>
            <Text style={styles.infoValue}>{battingTeam}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bowling</Text>
            <Text style={styles.infoValue}>{bowlingTeam}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Overs</Text>
            <Text style={styles.infoValue}>{match.oversLimit}</Text>
          </View>
        </View>

        {target && (
          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Target</Text>
            <Text style={styles.targetValue}>{target} runs</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Runs</Text>
              <Text style={styles.scoreValue}>{currentInnings?.runs || 0}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Wickets</Text>
              <Text style={styles.scoreValue}>{currentInnings?.wickets || 0}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Balls</Text>
              <Text style={styles.scoreValue}>{currentInnings?.balls || 0}</Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Overs</Text>
              <Text style={styles.scoreValue}>
                {currentInnings?.overs ?? 0}.{currentInnings?.balls ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Players</Text>
          <View style={styles.currentPlayersGrid}>
            <View style={[styles.currentPlayerCard, styles.strikerCard]}>
              <Text style={styles.currentPlayerLabel}>Striker</Text>
              <View style={styles.iconLabelRow}>
                <Ionicons name="baseball-outline" size={14} color="#c2410c" />
                <Text style={styles.currentPlayerName}>{currentInnings?.striker || "-"}</Text>
              </View>
            </View>
            <View style={[styles.currentPlayerCard, styles.bowlerCard]}>
              <Text style={styles.currentPlayerLabel}>Bowler</Text>
              <View style={styles.iconLabelRow}>
                <Ionicons name="radio-button-on-outline" size={14} color="#1d4ed8" />
                <Text style={styles.currentPlayerName}>{currentInnings?.currentBowler || "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scoreboards</Text>
          <View style={styles.scoreboardButtonsRow}>
            <Pressable
              onPress={() => setShowBatsmenModal(true)}
              style={({ pressed }) => [
                styles.modalOpenButton,
                styles.modalOpenButtonBatsmen,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.modalOpenButtonContent}>
                <Ionicons name="people-outline" size={14} color="#ffffff" />
                <Text style={styles.modalOpenButtonText}>Batsmen</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setShowBowlersModal(true)}
              style={({ pressed }) => [
                styles.modalOpenButton,
                styles.modalOpenButtonBowlers,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.modalOpenButtonContent}>
                <Ionicons name="american-football-outline" size={14} color="#ffffff" />
                <Text style={styles.modalOpenButtonText}>Bowlers</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            {message || "Commentary: Press Play Ball to start or continue the over."}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={handlePlayBall}
            disabled={actionLoading || !isInProgress || isInningsComplete(currentInnings)}
            style={({ pressed }) => [
              styles.button,
              styles.playButton,
              (actionLoading || !isInProgress || isInningsComplete(currentInnings)) &&
                styles.buttonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {actionLoading ? "Playing..." : "Play Ball"}
            </Text>
          </Pressable>

          {!isPaused ? (
            <Pressable
              onPress={handlePause}
              disabled={actionLoading || isInningsComplete(currentInnings)}
              style={({ pressed }) => [
                styles.button,
                styles.pauseButton,
                (actionLoading || isInningsComplete(currentInnings)) && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Pause</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleResume}
              disabled={actionLoading}
              style={({ pressed }) => [
                styles.button,
                styles.resumeButton,
                actionLoading && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Resume</Text>
            </Pressable>
          )}

          {isFirstInnings && isInningsComplete(currentInnings) && (
            <Pressable
              onPress={handleStartSecondInnings}
              disabled={actionLoading}
              style={({ pressed }) => [
                styles.button,
                styles.continueButton,
                actionLoading && styles.buttonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.buttonText}>Start 2nd Innings</Text>
            </Pressable>
          )}
        </View>

        <Modal visible={showInningsComplete} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>First Innings Complete!</Text>
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Total Runs</Text>
                <Text style={styles.modalScore}>{match?.innings?.[0]?.runs || 0}</Text>
                <Text style={styles.modalLabel}>Wickets</Text>
                <Text style={styles.modalScore}>{match?.innings?.[0]?.wickets || 0}</Text>
              </View>
              <Pressable
                onPress={handleStartSecondInnings}
                disabled={actionLoading}
                style={({ pressed }) => [
                  styles.submitButton,
                  actionLoading && styles.buttonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {actionLoading ? "Starting..." : "Start 2nd Innings"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showBatsmenModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardLarge}>
              <Text style={styles.modalTitle}>Batsmen Scoreboard</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.nameCol]}>Player</Text>
                <Text style={[styles.tableHeaderText, styles.numCol]}>R</Text>
                <Text style={[styles.tableHeaderText, styles.numCol]}>B</Text>
                <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
              </View>
              <ScrollView style={styles.modalTableScroll} showsVerticalScrollIndicator={false}>
                {batsmen.length ? (
                  batsmen.map((batsman, idx) => (
                    <View key={`${batsman?.name || "batsman"}-${idx}`} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, styles.nameCol]} numberOfLines={1}>
                        {batsman?.name || "-"}
                      </Text>
                      <Text style={[styles.tableCellText, styles.numCol]}>{batsman?.runs ?? 0}</Text>
                      <Text style={[styles.tableCellText, styles.numCol]}>{batsman?.balls ?? 0}</Text>
                      <View style={styles.statusCol}>
                        <Text
                          style={[
                            styles.batsmanStatus,
                            batsman?.status === "out"
                              ? styles.batsmanOut
                              : batsman?.status === "batting"
                                ? styles.batsmanBatting
                                : styles.batsmanWaiting,
                          ]}
                        >
                          {batsman?.status || "-"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyTableText}>No batsmen data available.</Text>
                )}
              </ScrollView>
              <Pressable
                onPress={() => setShowBatsmenModal(false)}
                style={({ pressed }) => [styles.closeModalButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showBowlersModal} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardLarge}>
              <Text style={styles.modalTitle}>Bowlers Scoreboard</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.nameCol]}>Bowler</Text>
                <Text style={[styles.tableHeaderText, styles.numCol]}>O</Text>
                <Text style={[styles.tableHeaderText, styles.numCol]}>R</Text>
                <Text style={[styles.tableHeaderText, styles.numCol]}>W</Text>
              </View>
              <ScrollView style={styles.modalTableScroll} showsVerticalScrollIndicator={false}>
                {bowlers.length ? (
                  bowlers.map((bowler, idx) => (
                    <View key={`${bowler?.name || "bowler"}-${idx}`} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, styles.nameCol]} numberOfLines={1}>
                        {bowler?.name || "-"}
                      </Text>
                      <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.overs ?? 0}</Text>
                      <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.runs ?? 0}</Text>
                      <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.wickets ?? 0}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyTableText}>No bowlers data available.</Text>
                )}
              </ScrollView>
              <Pressable
                onPress={() => setShowBowlersModal(false)}
                style={({ pressed }) => [styles.closeModalButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeModalButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  targetCard: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    padding: 14,
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  targetValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0369a1",
    marginTop: 4,
  },
  scoreGrid: {
    flexDirection: "row",
    gap: 8,
  },
  scoreItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  currentPlayersGrid: {
    flexDirection: "row",
    gap: 10,
  },
  currentPlayerCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  strikerCard: {
    backgroundColor: "#fff7ed",
    borderColor: "#fdba74",
  },
  bowlerCard: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  currentPlayerLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: "700",
  },
  currentPlayerName: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "800",
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreboardButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalOpenButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalOpenButtonBatsmen: {
    backgroundColor: "#0f766e",
  },
  modalOpenButtonBowlers: {
    backgroundColor: "#0369a1",
  },
  modalOpenButtonText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  modalOpenButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  tableCellText: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
  },
  nameCol: {
    flex: 2,
  },
  numCol: {
    flex: 1,
    textAlign: "center",
  },
  statusCol: {
    flex: 1.4,
    alignItems: "flex-end",
  },
  batsmanStatus: {
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "800",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: "hidden",
  },
  batsmanBatting: {
    color: "#166534",
    backgroundColor: "#dcfce7",
  },
  batsmanOut: {
    color: "#991b1b",
    backgroundColor: "#fee2e2",
  },
  batsmanWaiting: {
    color: "#334155",
    backgroundColor: "#e2e8f0",
  },
  emptyTableText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 12,
    fontWeight: "600",
  },
  messageBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    textAlign: "center",
  },
  controls: {
    gap: 10,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "#0284c7",
  },
  pauseButton: {
    backgroundColor: "#f59e0b",
  },
  resumeButton: {
    backgroundColor: "#16a34a",
  },
  continueButton: {
    backgroundColor: "#16a34a",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.82,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 18,
    gap: 16,
  },
  modalCardLarge: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    gap: 10,
    maxHeight: "78%",
  },
  modalTableScroll: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  modalContent: {
    gap: 8,
    alignItems: "center",
  },
  modalLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalScore: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f766e",
  },
  submitButton: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  closeModalButton: {
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 2,
  },
  closeModalButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
    textTransform: "uppercase",
  },
});
