import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { completeToss, getMatchById } from "../services/api";
import AppHeader from "../components/AppHeader";

const COIN_ANIMATION_DURATION = 2200;

function CoinFlip({ isFlipping, coinFace }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isFlipping) return;

    let animationInterval;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < COIN_ANIMATION_DURATION) {
        const progress = elapsed / COIN_ANIMATION_DURATION;
        // Simple pulsing effect
        const newScale = 1 + Math.sin(progress * Math.PI * 8) * 0.2;
        setScale(newScale);
        animationInterval = requestAnimationFrame(animate);
      } else {
        setScale(1);
      }
    };

    animationInterval = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationInterval);
  }, [isFlipping]);

  return (
    <View style={styles.coinArea}>
      <View
        style={[
          styles.coin,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.coinFace}>{coinFace}</Text>
      </View>
    </View>
  );
}

export default function TossScreen({ route, navigation }) {
  const { matchId, teamA, teamB, oversLimit } = route.params || {};

  const [matchData, setMatchData] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState("HEADS");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const matchTeamA = teamA || matchData?.teamA;
  const matchTeamB = teamB || matchData?.teamB;
  const matchOversLimit = oversLimit || matchData?.oversLimit;

  const selectedTeamName = selectedTeam
    ? selectedTeam === "teamA"
      ? matchTeamA
      : matchTeamB
    : null;

  useEffect(() => {
    let mounted = true;

    const fetchMatch = async () => {
      if (!matchId) {
        setLoadingMatch(false);
        return;
      }

      try {
        const response = await getMatchById(matchId);
        if (mounted && response?.success) {
          setMatchData(response.data);

          // If toss already completed, redirect to play
          if (response.data?.toss?.winner && response.data?.toss?.decision) {
            navigation.replace("MatchPlay", { matchId });
          }
        }
      } catch {
        // Continue with data from route params
      } finally {
        if (mounted) {
          setLoadingMatch(false);
        }
      }
    };

    fetchMatch();
    return () => {
      mounted = false;
    };
  }, [matchId, navigation]);

  const runCoinFlip = () => {
    if (submitting || isFlipping || selectedTeam) return;

    setIsFlipping(true);
    setSelectedDecision(null);
    setMessage("");

    const winner = Math.random() < 0.5 ? "teamA" : "teamB";
    const face = winner === "teamA" ? "HEADS" : "TAILS";

    setTimeout(() => {
      setCoinFace(face);
      setSelectedTeam(winner);
      setIsFlipping(false);
      const teamName = winner === "teamA" ? matchTeamA : matchTeamB;
      setMessage(`Toss won by ${teamName}. Choose bat or bowl.`);
    }, COIN_ANIMATION_DURATION);
  };

  const handleConfirmToss = async () => {
    if (!selectedTeam || !selectedDecision) {
      Alert.alert("Incomplete", "Please select a team and decision first.");
      return;
    }

    if (!matchId) {
      Alert.alert("Error", "Match ID not found.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await completeToss({
        matchId,
        tossWinner: selectedTeam,
        decision: selectedDecision,
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to record toss");
      }

      setMessage("Toss recorded! Redirecting...");
      setTimeout(() => {
        navigation.replace("MatchPlay", { matchId });
      }, 500);
    } catch (error) {
      Alert.alert("Error", error?.message || "Unable to record toss");
      setSubmitting(false);
    }
  };

  if (loadingMatch) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <Text style={styles.loadingText}>Loading match...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!matchId || (!matchTeamA && !matchData?.teamA) || (!matchTeamB && !matchData?.teamB)) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <AppHeader
            navigation={navigation}
            title="Coin Toss Arena"
            onBackPress={() => navigation.navigate("Home")}
          />
          <Text style={styles.errorText}>Match data not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerContainer}>
        <AppHeader
          navigation={navigation}
          title="Coin Toss Arena"
          subtitle="Flip the coin and choose your innings"
          onBackPress={() => navigation.navigate("Home")}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Match ID</Text>
            <Text style={styles.infoValue}>{matchId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Overs</Text>
            <Text style={styles.infoValue}>{matchOversLimit || "-"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Teams</Text>
          <View style={styles.teamGrid}>
            <View
              style={[styles.teamPill, selectedTeam === "teamA" && styles.teamPillActive]}
            >
              <Text style={styles.teamLabel}>Team A</Text>
              <Text style={styles.teamName}>{matchTeamA || "-"}</Text>
            </View>
            <View
              style={[styles.teamPill, selectedTeam === "teamB" && styles.teamPillActive]}
            >
              <Text style={styles.teamLabel}>Team B</Text>
              <Text style={styles.teamName}>{matchTeamB || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flip the Coin</Text>
          <CoinFlip isFlipping={isFlipping} coinFace={coinFace} />
          <Pressable
            onPress={runCoinFlip}
            disabled={isFlipping || submitting || !!selectedTeam}
            style={({ pressed }) => [styles.flipButton, pressed && styles.pressed]}
          >
            <Text style={styles.flipButtonText}>
              {isFlipping ? "Flipping..." : "Flip Coin"}
            </Text>
          </Pressable>
          {selectedTeamName && !isFlipping && (
            <Text style={styles.winnerText}>Toss Winner: {selectedTeamName}</Text>
          )}
        </View>

        {selectedTeam && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{selectedTeamName} - Choose Your Innings</Text>
            <View style={styles.decisionGrid}>
              <Pressable
                onPress={() => setSelectedDecision("bat")}
                disabled={submitting || isFlipping}
                style={[
                  styles.decisionButton,
                  selectedDecision === "bat" && styles.decisionButtonActive,
                ]}
              >
                <Text style={[styles.decisionText, selectedDecision === "bat" && styles.decisionTextActive]}>
                  Bat First
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectedDecision("bowl")}
                disabled={submitting || isFlipping}
                style={[
                  styles.decisionButton,
                  selectedDecision === "bowl" && styles.decisionButtonActive,
                ]}
              >
                <Text style={[styles.decisionText, selectedDecision === "bowl" && styles.decisionTextActive]}>
                  Bowl First
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {message && (
          <View
            style={[
              styles.messageBox,
              message.includes("Error") && styles.messageError,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {selectedTeam && selectedDecision && (
          <Pressable
            onPress={handleConfirmToss}
            disabled={submitting || isFlipping}
            style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Recording Toss..." : "Confirm Toss Result"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
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
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a202c",
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
  teamGrid: {
    flexDirection: "row",
    gap: 10,
  },
  teamPill: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  teamPillActive: {
    borderColor: "#0891b2",
    backgroundColor: "#ecfdf5",
  },
  teamLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "700",
  },
  coinArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  coin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fbbf24",
    borderWidth: 3,
    borderColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  coinFace: {
    fontSize: 16,
    fontWeight: "900",
    color: "#78350f",
    letterSpacing: 1,
  },
  flipButton: {
    marginTop: 12,
    backgroundColor: "#0891b2",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  flipButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  winnerText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 15,
    color: "#0891b2",
    fontWeight: "700",
  },
  decisionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  decisionButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    alignItems: "center",
  },
  decisionButtonActive: {
    borderColor: "#0891b2",
    backgroundColor: "#ecfdf5",
  },
  decisionText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a202c",
  },
  decisionTextActive: {
    color: "#0891b2",
  },
  messageBox: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageError: {
    backgroundColor: "#ffe4e6",
    borderColor: "#fecdd3",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    textAlign: "center",
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: "#0891b2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
});
