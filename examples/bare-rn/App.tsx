import { StatusBar, StyleSheet, Text, View } from 'react-native';

/** Edit MARKER in a worktree to prove each Stage serves its own branch. */
export const MARKER = 'main';

function App() {
  return (
    <View style={styles.container} testID="baton-sample-ready">
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Baton sample</Text>
      <Text style={styles.marker} testID="baton-sample-marker">
        {`marker: ${MARKER}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700' },
  marker: { marginTop: 12, fontSize: 18, color: '#555' }
});

export default App;
