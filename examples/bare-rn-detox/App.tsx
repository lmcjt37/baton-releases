import { useState } from 'react';
import { Platform, Pressable, Settings, StatusBar, StyleSheet, Text, View } from 'react-native';

/** Edit MARKER in a worktree to prove each Stage serves its own branch. */
export const MARKER = 'main';

const FLAKY_RUNS = 'batonFlakyRuns';

/**
 * For the demo's flaky flow: fails on odd runs and passes on even ones, so a Concert with one retry reports it flaky.
 * The count lives in iOS Settings so it survives the relaunch between attempts.
 */
function runFlakyCheck() {
  if (Platform.OS !== 'ios') return true;
  const runs = (Number(Settings.get(FLAKY_RUNS)) || 0) + 1;
  Settings.set({ [FLAKY_RUNS]: runs });
  return runs % 2 === 0;
}

function App() {
  const [flaky, setFlaky] = useState<'passed' | 'failed'>();
  return (
    <View style={styles.container} testID="baton-sample-ready">
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Baton sample</Text>
      <Text style={styles.marker} testID="baton-sample-marker">
        {`marker: ${MARKER}`}
      </Text>
      <Pressable style={styles.button} testID="baton-sample-flaky" onPress={() => setFlaky(runFlakyCheck() ? 'passed' : 'failed')}>
        <Text style={styles.buttonText}>Run flaky check</Text>
      </Pressable>
      {flaky && <Text style={styles.marker}>{`flaky check: ${flaky}`}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700' },
  marker: { marginTop: 12, fontSize: 18, color: '#555' },
  button: { marginTop: 32, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#eee' },
  buttonText: { fontSize: 16 }
});

export default App;
