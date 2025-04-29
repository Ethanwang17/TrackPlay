import React, {useState, useEffect} from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Platform,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {getWatchedHistory} from "../../services/traktService";
import AuthContext from "../context/AuthContext";
import Layout from "../../constants/Layout";

const {useAuth} = AuthContext;

const HomeScreen = () => {
	const {signOut} = useAuth();
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchWatchHistory = async (isRefreshing = false) => {
		try {
			if (isRefreshing) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);

			const data = await getWatchedHistory();
			setHistory(data);
		} catch (error) {
			console.error("Error fetching watch history:", error);
			setError("Failed to load watch history. Please try again.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchWatchHistory();
	}, []);

	const handleRefresh = () => {
		fetchWatchHistory(true);
	};

	const renderItem = ({item}) => (
		<View style={styles.itemContainer}>
			<View style={styles.itemContent}>
				<Text style={styles.itemTitle}>{item.title}</Text>
				<View
					style={[
						styles.typeTag,
						{
							backgroundColor:
								item.type === "movie" ? "#3498db" : "#9b59b6",
						},
					]}
				>
					<Text style={styles.typeText}>{item.type}</Text>
				</View>
			</View>
			<Text style={styles.dateText}>
				{new Date(item.watched_at).toLocaleDateString()}
			</Text>
		</View>
	);

	if (loading && !refreshing) {
		return (
			<SafeAreaView
				style={styles.container}
				edges={["top", "right", "left"]}
			>
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#ed1c24" />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Watch History</Text>
			</View>

			{error ? (
				<View style={styles.centerContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={() => fetchWatchHistory()}
					>
						<Text style={styles.retryText}>Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={history}
					renderItem={renderItem}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					ListEmptyComponent={
						<Text style={styles.emptyText}>
							No watch history found
						</Text>
					}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
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
	listContainer: {
		padding: 16,
	},
	itemContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 16,
		marginBottom: 12,
		elevation: 1,
		shadowColor: "#000",
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.05,
		shadowRadius: 2,
	},
	itemContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "500",
		flex: 1,
		marginRight: 8,
	},
	typeTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
	},
	typeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "500",
	},
	dateText: {
		color: "#666",
		fontSize: 12,
	},
	emptyText: {
		textAlign: "center",
		color: "#666",
		marginTop: 30,
	},
	errorText: {
		color: "red",
		marginBottom: 16,
		textAlign: "center",
	},
	retryButton: {
		backgroundColor: "#ed1c24",
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderRadius: 6,
	},
	retryText: {
		color: "#fff",
		fontWeight: "600",
	},
});

export default HomeScreen;
