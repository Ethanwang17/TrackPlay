import React, {useState, useEffect} from "react";
import {
	View,
	Text,
	SectionList,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Linking,
	Alert,
	Clipboard,
	Image,
	Dimensions,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {getRecommendations} from "../../services/traktService";
import {getPosterByImdbId} from "../../services/tmdbService";
import Layout from "../../constants/Layout";

const {width} = Dimensions.get("window");
const ITEM_WIDTH = width * 0.44;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;

const RecommendationsScreen = () => {
	const [recommendations, setRecommendations] = useState({
		movies: [],
		shows: [],
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchRecommendations = async (isRefreshing = false) => {
		try {
			if (isRefreshing) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);

			const data = await getRecommendations();

			// Add poster loading logic
			const updatedMovies = await Promise.all(
				data.movies.map(async (movie) => {
					if (movie.imdbId) {
						const posterUrl = await getPosterByImdbId(
							movie.imdbId,
							"movie"
						);
						return {...movie, posterUrl};
					}
					return movie;
				})
			);

			const updatedShows = await Promise.all(
				data.shows.map(async (show) => {
					if (show.imdbId) {
						const posterUrl = await getPosterByImdbId(
							show.imdbId,
							"show"
						);
						return {...show, posterUrl};
					}
					return show;
				})
			);

			setRecommendations({
				movies: updatedMovies,
				shows: updatedShows,
			});
		} catch (error) {
			console.error("Error fetching recommendations:", error);
			setError("Failed to load recommendations. Please try again.");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchRecommendations();
	}, []);

	const handleRefresh = () => {
		fetchRecommendations(true);
	};

	const openInStremio = (item) => {
		if (!item.imdbId) {
			Alert.alert("Error", "No IMDB ID available for this item");
			return;
		}

		let url;
		if (item.type === "movie") {
			// For movies, videoId is the same as metaId
			url = `stremio:///detail/movie/${item.imdbId}/${item.imdbId}`;
		} else {
			// For shows, we just go to the show page
			url = `stremio:///detail/series/${item.imdbId}`;
		}

		console.log("Opening Stremio with URL:", url);

		// First try with the universal link approach
		Linking.openURL(url).catch((err) => {
			console.error("Error opening Stremio:", err);

			// As a fallback, let the user know what happened
			Alert.alert(
				"Could not open Stremio",
				"Make sure Stremio is installed. If on iOS, you may need to copy the link and paste it in Safari.",
				[
					{
						text: "Cancel",
						style: "cancel",
					},
					{
						text: "Copy Link",
						onPress: () => {
							Clipboard.setString(url);
							Alert.alert(
								"Link copied",
								"Open Safari and paste the link in the address bar.",
								[
									{
										text: "OK",
									},
								]
							);
						},
					},
				]
			);
		});
	};

	const renderItem = ({item}) => (
		<TouchableOpacity
			style={styles.itemContainer}
			onPress={() => openInStremio(item)}
		>
			<View style={styles.itemContent}>
				{item.posterUrl ? (
					<Image
						source={{uri: item.posterUrl}}
						style={styles.poster}
						resizeMode="cover"
					/>
				) : (
					<View style={styles.posterPlaceholder}>
						<Text style={styles.posterPlaceholderText}>
							No Poster
						</Text>
					</View>
				)}
				<View style={styles.itemDetails}>
					<Text style={styles.itemTitle}>
						{item.title} ({item.year})
					</Text>
					<View
						style={[
							styles.typeTag,
							{
								backgroundColor:
									item.type === "movie"
										? "#3498db"
										: "#9b59b6",
							},
						]}
					>
						<Text style={styles.typeText}>{item.type}</Text>
					</View>
					{item.rating && (
						<Text style={styles.ratingText}>
							Rating: {item.rating}/10
						</Text>
					)}
				</View>
			</View>
		</TouchableOpacity>
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

	const sections = [
		{title: "Movies", data: recommendations.movies || []},
		{title: "Shows", data: recommendations.shows || []},
	];

	return (
		<SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Recommendations</Text>
			</View>

			{error ? (
				<View style={styles.centerContainer}>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity
						style={styles.retryButton}
						onPress={() => fetchRecommendations()}
					>
						<Text style={styles.retryText}>Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<SectionList
					sections={sections}
					renderItem={renderItem}
					renderSectionHeader={({section: {title}}) => (
						<Text style={styles.sectionHeader}>{title}</Text>
					)}
					keyExtractor={(item) => item.id.toString()}
					contentContainerStyle={styles.listContainer}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					ListEmptyComponent={
						<Text style={styles.emptyText}>
							No recommendations found
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
	sectionHeader: {
		fontSize: 18,
		fontWeight: "600",
		backgroundColor: "#f5f5f5",
		paddingVertical: 8,
		paddingHorizontal: Layout.horizontalPadding,
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
		alignItems: "flex-start",
	},
	poster: {
		width: 85,
		height: 127,
		borderRadius: 4,
	},
	posterPlaceholder: {
		width: 85,
		height: 127,
		borderRadius: 4,
		backgroundColor: "#eee",
		justifyContent: "center",
		alignItems: "center",
	},
	posterPlaceholderText: {
		color: "#999",
		fontSize: 12,
	},
	itemDetails: {
		flex: 1,
		marginLeft: 12,
	},
	itemTitle: {
		fontSize: 16,
		fontWeight: "500",
		flex: 1,
		marginBottom: 8,
		flexWrap: "wrap",
	},
	typeTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		alignSelf: "flex-start",
		marginBottom: 8,
	},
	typeText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "500",
	},
	ratingText: {
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

export default RecommendationsScreen;
