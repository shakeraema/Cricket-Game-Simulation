import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import NewMatchScreen from "./screens/NewMatchScreen";
import TossScreen from "./screens/TossScreen";
import MatchPlayScreen from "./screens/MatchPlayScreen";
import MatchViewScreen from "./screens/MatchViewScreen";
import { logout, restoreSession } from "./services/authService";

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const storedSession = await restoreSession();
        if (isMounted && storedSession?.token) {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setSession(null);
  };

  if (isBootstrapping) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5b5" />
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!session ? (
          <AuthStack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              animation: "fade",
            }}
          >
            <AuthStack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoggedIn={setSession} />}
            </AuthStack.Screen>
            <AuthStack.Screen name="Signup">
              {(props) => <SignupScreen {...props} onSignedUp={setSession} />}
            </AuthStack.Screen>
          </AuthStack.Navigator>
        ) : (
          <AppStack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <AppStack.Screen name="Home">
              {(props) => (
                <HomeScreen
                  {...props}
                  session={session}
                  onLogout={handleLogout}
                />
              )}
            </AppStack.Screen>
            <AppStack.Screen name="NewMatch" component={NewMatchScreen} />
            <AppStack.Screen name="TossScreen" component={TossScreen} />
            <AppStack.Screen name="MatchPlay" component={MatchPlayScreen} />
            <AppStack.Screen name="MatchView" component={MatchViewScreen} />
          </AppStack.Navigator>
        )}
      </NavigationContainer>
      <StatusBar style={session ? "dark" : "light"} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#043d5e",
    justifyContent: "center",
    alignItems: "center",
  },
});
