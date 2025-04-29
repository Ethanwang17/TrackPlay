import React, {useState} from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import {authorize} from "../../services/traktService";
import AuthContext from "../context/AuthContext";

const {useAuth} = AuthContext;

const LoginScreen = () => {
	const {signIn} = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleLogin = async () => {
		try {
			setLoading(true);
			setError(null);

			// Start OAuth flow
			const authData = await authorize();

			// Sign in with the obtained token
			await signIn(authData);
		} catch (error) {
			console.error("Login error:", error);
			setError("Authentication failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>TrackPlay</Text>
			<Text style={styles.subtitle}>
				Track your watched movies and shows
			</Text>

			{error && <Text style={styles.errorText}>{error}</Text>}

			<TouchableOpacity
				style={styles.loginButton}
				onPress={handleLogin}
				disabled={loading}
			>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<Text style={styles.loginButtonText}>
						Login with Trakt.tv
					</Text>
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		marginBottom: 30,
		textAlign: "center",
	},
	loginButton: {
		backgroundColor: "#ed1c24",
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 8,
		marginTop: 20,
	},
	loginButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		marginBottom: 10,
	},
});

export default LoginScreen;
