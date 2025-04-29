import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {StatusBar} from "expo-status-bar";
import {SafeAreaProvider} from "react-native-safe-area-context";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import RecommendationsScreen from "./screens/RecommendationsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AuthContext from "./context/AuthContext";
import {ActivityIndicator, View, StyleSheet} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";

const {AuthProvider, useAuth} = AuthContext;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for authenticated users
const TabNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#ed1c24",
				tabBarInactiveTintColor: "#999",
				tabBarStyle: {
					paddingBottom: 5,
					paddingTop: 5,
				},
			}}
		>
			<Tab.Screen
				name="History"
				component={HomeScreen}
				options={{
					tabBarIcon: ({color, size}) => (
						<MaterialIcons
							name="history"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tab.Screen
				name="Recommendations"
				component={RecommendationsScreen}
				options={{
					tabBarIcon: ({color, size}) => (
						<MaterialIcons
							name="recommend"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					tabBarIcon: ({color, size}) => (
						<MaterialIcons
							name="person"
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tab.Navigator>
	);
};

const Navigation = () => {
	const {isSignedIn, isLoading} = useAuth();

	// Show loading indicator while checking auth state
	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#ed1c24" />
			</View>
		);
	}

	return (
		<Stack.Navigator screenOptions={{headerShown: false}}>
			{isSignedIn ? (
				<Stack.Screen name="Main" component={TabNavigator} />
			) : (
				<Stack.Screen name="Login" component={LoginScreen} />
			)}
		</Stack.Navigator>
	);
};

const RootLayout = () => {
	return (
		<SafeAreaProvider>
			<AuthProvider>
				<StatusBar style="dark" />
				<Navigation />
			</AuthProvider>
		</SafeAreaProvider>
	);
};

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default RootLayout;
