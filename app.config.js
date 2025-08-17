import 'dotenv/config';

export default {
  expo: {
    name: "memoZ",
    slug: "memoz_apk",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/memoz-icon.png", // main icon for iOS + Android
    scheme: "memozapk",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    
    splash: { // splash screen setup
      image: "./assets/images/memoz-splash.png",
      resizeMode: "contain",
      backgroundColor: "#60A5FA" // same blue as onboarding
    },

    ios: {
      supportsTablet: true
    },

    android: {
      package: "com.zirzizo.memoz",   // 👈 unique reverse-domain ID
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },

    experiments: {
      typedRoutes: true
    },

    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,

      
      eas: {
        projectId: "88203fe8-cc0a-4134-9dc1-42c0f8207fec"
      }
    }
  }
};
