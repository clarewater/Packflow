import { StyleSheet, Text, View } from 'react-native';

export function AppScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Packflow</Text>
      <Text style={styles.title}>App entry moved to App.tsx.</Text>
      <Text style={styles.description}>
        This project now uses the standard Expo root entry file and keeps the
        implementation inside src.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f4efe6',
  },
  eyebrow: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8c5e3c',
  },
  title: {
    marginBottom: 12,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    color: '#1f1a17',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4d443d',
  },
});
