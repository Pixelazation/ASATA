import 'dotenv/config';

export default {
  expo: {
    name: "Expo Starter",
    owner: "team-kyot",
    slug: "expo-starter",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",  //icon.png 128x128
    userInterfaceStyle: "automatic",
    scheme: "myapp",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    jsEngine: "jsc",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "io.batyr.expo-starter"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png", //adaptive-icon.png 366x366
        backgroundColor: "#FFFFFF"
      },
      config: {
        googleMaps: {
          apiKey: process.env.MAPS_PLATFORM_KEY
        }
      },
      googleServicesFile: "./google-services.json",
      package: "io.batyr.expostarter",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./assets/favicon.png" //favicon.png 48x48
    },
    plugins: [
      "expo-localization",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "155e32a4-7d85-4f66-8d70-dab0b7bfffda"
      }
    }
  }
};