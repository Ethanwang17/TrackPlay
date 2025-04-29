import {Platform, StatusBar, Dimensions} from "react-native";

const {width, height} = Dimensions.get("window");

export default {
	window: {
		width,
		height,
	},
	isSmallDevice: width < 375,
	// Status bar height for iOS
	statusBarHeight: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
	// Additional top padding for devices with notch or Dynamic Island
	topInset: Platform.OS === "ios" ? 47 : 0,
	// Default horizontal padding
	horizontalPadding: 16,
};
