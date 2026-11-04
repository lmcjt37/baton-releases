import SwiftUI

/// Change this on a branch to see each worktree test its own build.
let marker = "main"

@main
struct BatonNativeApp: App {
  var body: some Scene { WindowGroup { ContentView() } }
}

struct ContentView: View {
  @State private var tapped = false

  var body: some View {
    VStack(spacing: 16) {
      Text("Baton native sample")
      Text("Marker: \(marker)").accessibilityIdentifier("marker")
      Button("Tap me") { tapped = true }.accessibilityIdentifier("tap")
      if tapped { Text("Tapped").accessibilityIdentifier("tapped") }
    }
  }
}
