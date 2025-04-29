import axios from "axios";
import {
	TMDB_API_KEY,
	TMDB_API_URL,
	TMDB_IMAGE_BASE_URL,
} from "../config/tmdb.config";

// Create axios instance with default headers
const tmdbAPI = axios.create({
	baseURL: TMDB_API_URL,
	params: {
		api_key: TMDB_API_KEY,
	},
});

// Get movie poster by IMDB ID
export const getMoviePosterByImdbId = async (imdbId) => {
	try {
		const response = await tmdbAPI.get(`/find/${imdbId}`, {
			params: {
				external_source: "imdb_id",
			},
		});

		// Check if we found a movie match
		if (
			response.data.movie_results &&
			response.data.movie_results.length > 0
		) {
			const posterPath = response.data.movie_results[0].poster_path;
			return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : null;
		}
		return null;
	} catch (error) {
		console.error("Error fetching movie poster:", error);
		return null;
	}
};

// Get TV show poster by IMDB ID
export const getTVPosterByImdbId = async (imdbId) => {
	try {
		const response = await tmdbAPI.get(`/find/${imdbId}`, {
			params: {
				external_source: "imdb_id",
			},
		});

		// Check if we found a TV show match
		if (response.data.tv_results && response.data.tv_results.length > 0) {
			const posterPath = response.data.tv_results[0].poster_path;
			return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : null;
		}
		return null;
	} catch (error) {
		console.error("Error fetching TV poster:", error);
		return null;
	}
};

// Get poster URL by IMDB ID and content type
export const getPosterByImdbId = async (imdbId, type) => {
	if (type === "movie") {
		return await getMoviePosterByImdbId(imdbId);
	} else {
		return await getTVPosterByImdbId(imdbId);
	}
};
