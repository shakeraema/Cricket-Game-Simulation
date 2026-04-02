import { StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import DashboardTab from "./tabs/DashboardTab";
import PreviousMatchesTab from "./tabs/PreviousMatchesTab";
import ProfileTab from "./tabs/ProfileTab";

const Tab = createBottomTabNavigator();

export default function HomeScreen({ session, onLogout, navigation }) {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0891b2",
        tabBarInactiveTintColor: "#cbd5e1",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            Dashboard: focused ? "speedometer" : "speedometer-outline",
            PreviousMatches: focused ? "time" : "time-outline",
            Profile: focused ? "person-circle" : "person-circle-outline",
          };

          return (
            <Ionicons
              name={iconMap[route.name] || "ellipse-outline"}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        options={{ tabBarLabel: "Dashboard" }}
      >
        {(props) => ( // props are passed to ensure the tab screen has access to navigation and session data
          <DashboardTab
            {...props} // Spread the props to ensure navigation and other props are passed down
            session={session} 
            onOpenHistory={() => props.navigation.navigate("PreviousMatches")} // Use the tab's navigation to navigate to PreviousMatches tab
            onStartNewMatch={() => navigation.navigate("NewMatch")} // Use the main navigation to navigate to NewMatch screen
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="PreviousMatches"
        options={{ tabBarLabel: "Previous Matches" }}
      >
        {(props) => <PreviousMatchesTab {...props} navigation={navigation} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{ tabBarLabel: "Profile" }}
      >
        {(props) => <ProfileTab {...props} session={session} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 95,
    paddingBottom: 10,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
