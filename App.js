import { StatusBar } from 'expo-status-bar';
import Navigation from "$src/navigation";
import screens from "$screens";
import { StyleSheet,View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container} testID="RN_MainExpoUIClientComponent">
      <Navigation
        screens ={screens}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
