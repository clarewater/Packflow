import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppScreen } from './src/app-screen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AppScreen />
    </SafeAreaView>
  );
}
