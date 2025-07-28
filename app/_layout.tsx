import { Stack } from 'expo-router';
import { SafeAreaView, StyleSheet, View } from 'react-native';

export default function Layout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false, 
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F8', // background base color
  },
  container: {
    flex: 1,
  },
});
