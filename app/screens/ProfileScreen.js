import React from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AuthContext from "../context/AuthContext";
import Layout from "../../constants/Layout";

const {useAuth} = AuthContext;

const ProfileScreen = () => {
	const {signOut} = useAuth();

	return (
		<SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Profile</Text>
			</View>

			<View style={styles.content}>
				<TouchableOpacity style={styles.logoutButton} onPress={signOut}>
					<Text style={styles.logoutText}>Logout</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: Layout.horizontalPadding,
		paddingVertical: 12,
		backgroundColor: "#fff",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 3,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	logoutButton: {
		backgroundColor: "#ed1c24",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
	},
	logoutText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});

export default ProfileScreen;
