import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { DarkTheme, LightTheme } from '../constants/themes';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <ThemeProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
