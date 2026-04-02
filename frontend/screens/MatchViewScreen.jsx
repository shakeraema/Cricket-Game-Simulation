import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMatchById } from "../services/api";
import AppHeader from "../components/AppHeader";

export default function MatchViewScreen({ route, navigation }) {
  const { matchId } = route.params || {};

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchMatch = async () => {
      try {
        const response = await getMatchById(matchId);
        if (mounted) {
          if (response?.success) {
            setMatch(response.data);
          } else {
            setError(response?.message || "Unable to load match");
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err?.message || "Unable to load match");
        }
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
  }, [matchId]);

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

  if (error || !match) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <AppHeader navigation={navigation} title="Match Details" />
          <Text style={styles.errorText}>{error || "Match not found"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstInnings = match.innings?.[0];
  const secondInnings = match.innings?.[1];
  const result = match.result;
  const isCompleted = match.status === "COMPLETED";

  const getBallsBowled = (innings) => {
    if (!innings) return 0;
    return (innings.overs || 0) * 6 + (innings.balls || 0);
  };

  const totalMatchBalls = (match.oversLimit || 0) * 6;
  const secondInningsBallsBowled = getBallsBowled(secondInnings);
  const ballsRemaining = Math.max(0, totalMatchBalls - secondInningsBallsBowled);
  const wicketsRemaining = Math.max(0, 10 - (secondInnings?.wickets || 0));

  const formatInningsScore = (innings) => {
    if (!innings) return "N/A";
    return `${innings.runs}/${innings.wickets} (${innings.overs}.${innings.balls})`;
  };

  const renderBatsmenTable = (innings) => {
    const batsmen = Array.isArray(innings?.batsmen)
      ? innings.batsmen.filter((batsman) => batsman?.status !== "yet_to_bat")
      : [];

    if (!batsmen.length) {
      return <Text style={styles.emptyTableText}>No batting stats available.</Text>;
    }

    return (
      <View style={styles.tableBlock}>
        <Text style={styles.tableTitle}>Batting Stats</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.nameCol]}>Player</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>R</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>B</Text>
          <Text style={[styles.tableHeaderText, styles.statusCol]}>Status</Text>
        </View>
        {batsmen.map((batsman, idx) => (
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
                  batsman?.status === "out" ? styles.batsmanOut : styles.batsmanBatting,
                ]}
              >
                {batsman?.status === "out" ? "OUT" : "BATTING"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderBowlersTable = (innings) => {
    const bowlers = Array.isArray(innings?.bowlers)
      ? innings.bowlers.filter((bowler) => (bowler?.overs || 0) > 0 || (bowler?.wickets || 0) > 0)
      : [];

    if (!bowlers.length) {
      return <Text style={styles.emptyTableText}>No bowling stats available.</Text>;
    }

    return (
      <View style={styles.tableBlock}>
        <Text style={styles.tableTitle}>Bowling Stats</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.nameCol]}>Bowler</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>O</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>R</Text>
          <Text style={[styles.tableHeaderText, styles.numCol]}>W</Text>
        </View>
        {bowlers.map((bowler, idx) => (
          <View key={`${bowler?.name || "bowler"}-${idx}`} style={styles.tableRow}>
            <Text style={[styles.tableCellText, styles.nameCol]} numberOfLines={1}>
              {bowler?.name || "-"}
            </Text>
            <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.overs ?? 0}</Text>
            <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.runs ?? 0}</Text>
            <Text style={[styles.tableCellText, styles.numCol]}>{bowler?.wickets ?? 0}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getStatusColor = (status) => {
    if (status === "COMPLETED") return "#047857";
    if (status === "PAUSED") return "#b45309";
    return "#1d4ed8";
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          navigation={navigation}
          title="Match Details"
          subtitle="Full scoreboard and result"
        />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Match ID</Text>
            <Text style={styles.infoValue}>{matchId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team A</Text>
            <Text style={styles.infoValue}>{match.teamA}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team B</Text>
            <Text style={styles.infoValue}>{match.teamB}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Overs</Text>
            <Text style={styles.infoValue}>{match.oversLimit}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
              <Text style={styles.statusText}>{match.status}</Text>
            </View>
          </View>
        </View>

        {isCompleted && result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Match Result</Text>
            <Text style={styles.resultWinner}>{result.winner} Won</Text>
            {result.winType === "wickets" && (
              <Text style={styles.resultMargin}>
                Won by {result.winMargin || wicketsRemaining} wickets with {ballsRemaining} balls remaining
              </Text>
            )}
            {result.winType === "runs" && (
              <Text style={styles.resultMargin}>
                Won by {result.winMargin || 0} runs
              </Text>
            )}
          </View>
        )}

        {firstInnings && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>First Innings - {firstInnings.battingTeam}</Text>
            <View style={styles.inningsGrid}>
              <View style={styles.inningsInfoBlock}>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Batting Team:</Text> {firstInnings.battingTeam}</Text>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Score:</Text> {formatInningsScore(firstInnings)}</Text>
              </View>
              <View style={styles.inningsInfoBlock}>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Bowling Team:</Text> {firstInnings.bowlingTeam}</Text>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Overs Limit:</Text> {firstInnings.oversLimit}</Text>
              </View>
            </View>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Runs</Text>
                <Text style={styles.scoreValue}>{firstInnings.runs}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Wickets</Text>
                <Text style={styles.scoreValue}>{firstInnings.wickets}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Balls</Text>
                <Text style={styles.scoreValue}>{firstInnings.balls}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Overs</Text>
                <Text style={styles.scoreValue}>
                  {firstInnings.overs}.{firstInnings.balls}
                </Text>
              </View>
            </View>
            {renderBatsmenTable(firstInnings)}
            {renderBowlersTable(firstInnings)}
          </View>
        )}

        {secondInnings && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Second Innings - {secondInnings.battingTeam}</Text>
            <View style={styles.inningsGrid}>
              <View style={styles.inningsInfoBlock}>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Batting Team:</Text> {secondInnings.battingTeam}</Text>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Score:</Text> {formatInningsScore(secondInnings)}</Text>
                {secondInnings.target ? (
                  <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Target:</Text> {secondInnings.target}</Text>
                ) : null}
              </View>
              <View style={styles.inningsInfoBlock}>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Bowling Team:</Text> {secondInnings.bowlingTeam}</Text>
                <Text style={styles.inningsInfoText}><Text style={styles.inningsInfoLabel}>Overs Limit:</Text> {secondInnings.oversLimit}</Text>
              </View>
            </View>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Runs</Text>
                <Text style={styles.scoreValue}>{secondInnings.runs}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Wickets</Text>
                <Text style={styles.scoreValue}>{secondInnings.wickets}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Balls</Text>
                <Text style={styles.scoreValue}>{secondInnings.balls}</Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Overs</Text>
                <Text style={styles.scoreValue}>
                  {secondInnings.overs}.{secondInnings.balls}
                </Text>
              </View>
            </View>
            {renderBatsmenTable(secondInnings)}
            {renderBowlersTable(secondInnings)}
          </View>
        )}

        {match.toss && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Toss Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Toss Winner</Text>
              <Text style={styles.infoValue}>
                {match.toss.winner}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Decision</Text>
              <Text style={styles.infoValue}>
                {match.toss.decision === "bat" ? "Bat First" : "Bowl First"}
              </Text>
            </View>
          </View>
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
    paddingVertical: 10,
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
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  resultCard: {
    backgroundColor: "#dcfce7",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#86efac",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    fontSize: 14,
    color: "#065f46",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  resultWinner: {
    fontSize: 24,
    fontWeight: "800",
    color: "#065f46",
  },
  resultMargin: {
    fontSize: 14,
    color: "#047857",
    fontWeight: "600",
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
    fontWeight: "900",
    color: "#0891b2",
  },
  inningsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  inningsInfoBlock: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 4,
  },
  inningsInfoText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  inningsInfoLabel: {
    color: "#0f172a",
    fontWeight: "800",
  },
  tableBlock: {
    marginTop: 8,
    gap: 6,
  },
  tableTitle: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "800",
    textTransform: "uppercase",
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
  emptyTableText: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 10,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.82,
  },
});
