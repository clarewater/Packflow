import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRoot } from './src/app';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f4f2ee' }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f2ee' }}>
        <StatusBar style="dark" />
        <AppRoot />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
