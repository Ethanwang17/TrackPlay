import React from "react";
import {Redirect} from "expo-router";

export default function Index() {
	// This redirects to the app's main screen
	return <Redirect href="/Home" />;
}
