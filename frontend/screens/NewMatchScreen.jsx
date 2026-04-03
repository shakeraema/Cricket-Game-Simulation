import { useEffect, useMemo, useState } from "react";
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
import { createMatch, getTeams } from "../services/api";
import AppHeader from "../components/AppHeader";

const OVERS_OPTIONS = [2, 5, 10];

function TeamPickerModal({ title, visible, teams, selectedName, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView contentContainerStyle={styles.modalList}>
            {teams.map((team) => {
              const isSelected = selectedName === team.name;
              return (
                <Pressable
                  key={team._id || team.name}
                  onPress={() => onSelect(team.name)}
                  style={({ pressed }) => [
                    styles.modalRow,
                    isSelected && styles.modalRowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.modalRowText}>{team.name}</Text>
                  {!!team.country && <Text style={styles.modalRowSub}>{team.country}</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function NewMatchScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [overs, setOvers] = useState(5);
  const [creating, setCreating] = useState(false);
  const [pickerType, setPickerType] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadTeams = async () => {
      setLoadingTeams(true);
      try {
        const response = await getTeams();
        if (!mounted) return;

        if (response?.success && Array.isArray(response.data)) {
          setTeams(response.data);
        } else {
          setTeams([]);
        }
      } catch {
        if (mounted) {
          setTeams([]);
        }
      } finally {
        if (mounted) {
          setLoadingTeams(false);
        }
      }
    };

    loadTeams();
    return () => {
      mounted = false;
    };
  }, []);

  const canCreate = teamA && teamB && teamA !== teamB && !creating;

  const teamAOptions = useMemo(() => teams.filter((t) => t.name !== teamB), [teams, teamB]);
  const teamBOptions = useMemo(() => teams.filter((t) => t.name !== teamA), [teams, teamA]);

  const handleCreateMatch = async () => {
    if (!canCreate) {
      Alert.alert("Invalid selection", "Please select two different teams.");
      return;
    }

    setCreating(true);
    try {
      const response = await createMatch({ teamA, teamB, overs });
      if (!response?.success) {
        throw new Error(response?.message || "Failed to create match");
      }

      const createdId = response?.data?.matchId || response?.data?._id;
      
      // Navigate to Toss screen with match data
      navigation.replace("TossScreen", {
        matchId: createdId,
        teamA,
        teamB,
        oversLimit: overs,
      });
    } catch (error) {
      Alert.alert("Create failed", error?.message || "Unable to create match");
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerContainer}>
        <AppHeader
          navigation={navigation}
          title="Create New Match"
          subtitle="Set teams and overs"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          {loadingTeams ? (
            <View style={styles.centerState}>
              <ActivityIndicator color="#0f766e" />
              <Text style={styles.stateText}>Loading teams...</Text>
            </View>
          ) : teams.length === 0 ? (
            <View style={styles.centerState}>
              <Text style={styles.errorText}>No teams available. Please contact admin.</Text>
            </View>
          ) : (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Team A</Text>
                <Pressable
                  onPress={() => setPickerType("A")}
                  style={({ pressed }) => [styles.selectorButton, pressed && styles.pressed]}
                >
                  <Text style={[styles.selectorText, !teamA && styles.selectorPlaceholder]}>
                    {teamA || "Select Team A"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Team B</Text>
                <Pressable
                  onPress={() => setPickerType("B")}
                  style={({ pressed }) => [styles.selectorButton, pressed && styles.pressed]}
                >
                  <Text style={[styles.selectorText, !teamB && styles.selectorPlaceholder]}>
                    {teamB || "Select Team B"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Number of Overs</Text>
                <View style={styles.oversRow}>
                  {OVERS_OPTIONS.map((option) => {
                    const selected = overs === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => setOvers(option)}
                        style={({ pressed }) => [
                          styles.oversChip,
                          selected && styles.oversChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text style={[styles.oversText, selected && styles.oversTextActive]}>{option} Overs</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.helpText}>Choose match duration</Text>
              </View>

              {!!teamA && !!teamB && (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>
                    {teamA} vs {teamB} - {overs} Overs
                  </Text>
                </View>
              )}

              <Pressable
                disabled={!canCreate}
                onPress={handleCreateMatch}
                style={({ pressed }) => [
                  styles.submitButton,
                  (!canCreate || creating) && styles.submitButtonDisabled,
                  pressed && canCreate && styles.pressed,
                ]}
              >
                <Text style={styles.submitButtonText}>{creating ? "Creating Match..." : "Proceed to Toss"}</Text>
              </Pressable>
            </>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoHeading}>How it works</Text>
          <Text style={styles.infoItem}>- Select two different teams</Text>
          <Text style={styles.infoItem}>- Choose number of overs</Text>
          <Text style={styles.infoItem}>- Proceed to toss in match flow</Text>
          <Text style={styles.infoItem}>- Play ball by ball after toss</Text>
        </View>
      </ScrollView>

      <TeamPickerModal
        title="Select Team A"
        visible={pickerType === "A"}
        teams={teamAOptions}
        selectedName={teamA}
        onSelect={(name) => {
          setTeamA(name);
          if (name === teamB) {
            setTeamB("");
          }
          setPickerType(null);
        }}
        onClose={() => setPickerType(null)}
      />

      <TeamPickerModal
        title="Select Team B"
        visible={pickerType === "B"}
        teams={teamBOptions}
        selectedName={teamB}
        onSelect={(name) => {
          setTeamB(name);
          if (name === teamA) {
            setTeamA("");
          }
          setPickerType(null);
        }}
        onClose={() => setPickerType(null)}
      />
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
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  centerState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
  },
  stateText: {
    color: "#475569",
    fontWeight: "600",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    fontWeight: "700",
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },
  selectorButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  selectorText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
  },
  selectorPlaceholder: {
    color: "#64748b",
    fontWeight: "500",
  },
  oversRow: {
    flexDirection: "row",
    gap: 8,
  },
  oversChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    alignItems: "center",
  },
  oversChipActive: {
    borderColor: "#0891b2",
    backgroundColor: "#ecfdf5",
  },
  oversText: {
    color: "#1a202c",
    fontSize: 13,
    fontWeight: "700",
  },
  oversTextActive: {
    color: "#0891b2",
  },
  helpText: {
    color: "#64748b",
    fontSize: 12,
  },
  summaryBox: {
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0891b2",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryText: {
    color: "#1a202c",
    fontWeight: "700",
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#0891b2",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 6,
  },
  infoHeading: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 4,
  },
  infoItem: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  modalCard: {
    maxHeight: "70%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalList: {
    gap: 8,
  },
  modalRow: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalRowSelected: {
    borderColor: "#0891b2",
    backgroundColor: "#ecfdf5",
  },
  modalRowText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  modalRowSub: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.82,
  },
});
