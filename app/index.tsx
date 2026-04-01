import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Packflow</Text>
        <Text style={styles.title}>Project skeleton is ready.</Text>
        <Text style={styles.description}>
          The copied screens and business logic were removed. Only the folder
          structure and a minimal Expo Router entry remain.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
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
