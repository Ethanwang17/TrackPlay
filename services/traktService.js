import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import {
	TRAKT_CLIENT_ID,
	TRAKT_CLIENT_SECRET,
	REDIRECT_URI,
	TRAKT_API_URL,
	TRAKT_AUTH_URL,
	TRAKT_TOKEN_URL,
} from "../config/trakt.config";

// Create axios instance with default headers
const traktAPI = axios.create({
	baseURL: TRAKT_API_URL,
	headers: {
		"Content-Type": "application/json",
		"trakt-api-version": "2",
		"trakt-api-key": TRAKT_CLIENT_ID,
	},
});

// Start OAuth flow
export const authorize = async () => {
	// Construct the authorization URL
	const authUrl = `${TRAKT_AUTH_URL}?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;

	// Open browser to authorize
	const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

	if (result.type === "success") {
		const {url} = result;
		// Extract code from URL
		const code = Linking.parse(url).queryParams?.code;
		if (code) {
			return await getToken(code);
		}
	}

	throw new Error("Authentication failed");
};

// Exchange code for token
export const getToken = async (code) => {
	try {
		const response = await axios.post(TRAKT_TOKEN_URL, {
			code,
			client_id: TRAKT_CLIENT_ID,
			client_secret: TRAKT_CLIENT_SECRET,
			redirect_uri: REDIRECT_URI,
			grant_type: "authorization_code",
		});

		return response.data;
	} catch (error) {
		console.error("Error getting token:", error);
		throw error;
	}
};

// Set token for future API calls
export const setAuthToken = (token) => {
	traktAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

// Get user's watched history
export const getWatchedHistory = async () => {
	try {
		// Get movies watched
		const moviesResponse = await traktAPI.get("/sync/history/movies");

		// Get episodes watched
		const showsResponse = await traktAPI.get("/sync/history/episodes");

		// Combine and format data
		const movies = moviesResponse.data.map((item) => ({
			id: item.id,
			title: item.movie.title,
			type: "movie",
			watched_at: item.watched_at,
		}));

		const shows = showsResponse.data.map((item) => ({
			id: item.id,
			title: `${item.show.title} - ${
				item.episode.title ||
				`S${item.episode.season}E${item.episode.number}`
			}`,
			type: "show",
			watched_at: item.watched_at,
		}));

		// Combine movies and shows, sort by most recently watched
		return [...movies, ...shows].sort(
			(a, b) => new Date(b.watched_at) - new Date(a.watched_at)
		);
	} catch (error) {
		console.error("Error fetching watch history:", error);
		throw error;
	}
};

// Get recommendations for movies and shows
export const getRecommendations = async () => {
	try {
		// Get movie recommendations
		const movieRecommendations = await traktAPI.get(
			"/recommendations/movies"
		);

		// Get show recommendations
		const showRecommendations = await traktAPI.get(
			"/recommendations/shows"
		);

		// Format movie recommendations
		const movies = movieRecommendations.data.map((item) => ({
			id: item.ids.trakt,
			imdbId: item.ids.imdb,
			title: item.title,
			year: item.year,
			type: "movie",
			rating: item.rating,
		}));

		// Format show recommendations
		const shows = showRecommendations.data.map((item) => ({
			id: item.ids.trakt,
			imdbId: item.ids.imdb,
			title: item.title,
			year: item.year,
			type: "show",
			rating: item.rating,
		}));

		// Combine movies and shows
		return {
			movies,
			shows,
		};
	} catch (error) {
		console.error("Error fetching recommendations:", error);
		throw error;
	}
};
