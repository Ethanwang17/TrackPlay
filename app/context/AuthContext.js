import React, {createContext, useState, useContext, useEffect} from "react";
import {setAuthToken} from "../../services/traktService";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
	const [authState, setAuthState] = useState({
		token: null,
		isLoading: true,
		isSignedIn: false,
	});

	// Check if user is already signed in on app load
	useEffect(() => {
		const loadToken = async () => {
			try {
				const token = await SecureStore.getItemAsync("access_token");

				if (token) {
					setAuthToken(token);
					setAuthState({
						token,
						isLoading: false,
						isSignedIn: true,
					});
				} else {
					setAuthState({
						token: null,
						isLoading: false,
						isSignedIn: false,
					});
				}
			} catch (error) {
				console.error("Error loading token", error);
				setAuthState({
					token: null,
					isLoading: false,
					isSignedIn: false,
				});
			}
		};

		loadToken();
	}, []);

	// Save auth data when user signs in
	const signIn = async (authData) => {
		try {
			const {access_token, refresh_token, expires_in} = authData;

			// Store tokens in secure storage
			await SecureStore.setItemAsync("access_token", access_token);
			await SecureStore.setItemAsync("refresh_token", refresh_token);

			// Set the auth token for API calls
			setAuthToken(access_token);

			// Update state
			setAuthState({
				token: access_token,
				isLoading: false,
				isSignedIn: true,
			});
		} catch (error) {
			console.error("Error signing in", error);
		}
	};

	// Clear auth data when user signs out
	const signOut = async () => {
		try {
			// Remove tokens from secure storage
			await SecureStore.deleteItemAsync("access_token");
			await SecureStore.deleteItemAsync("refresh_token");

			// Update state
			setAuthState({
				token: null,
				isLoading: false,
				isSignedIn: false,
			});
		} catch (error) {
			console.error("Error signing out", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				...authState,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook for using auth context
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Create a default export React component for Expo Router
const AuthContextExport = () => null;
AuthContextExport.AuthProvider = AuthProvider;
AuthContextExport.useAuth = useAuth;

export default AuthContextExport;
