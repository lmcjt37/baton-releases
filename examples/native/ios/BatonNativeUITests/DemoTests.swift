import XCTest

/// A failure and a flaky test for the `demo` programme; skipped unless it sets DEMO=1.
final class DemoTests: XCTestCase {
  private let env = ProcessInfo.processInfo.environment
  private let app = XCUIApplication()

  override func setUpWithError() throws {
    try XCTSkipUnless(env["DEMO"] == "1", "runs in the demo programme")
    continueAfterFailure = false
    app.launch()
  }

  func testSignIn() {
    XCTAssertTrue(app.buttons["sign-in"].waitForExistence(timeout: 3), "The sample has no sign-in screen")
  }

  /// Fails on a Concert's first try and passes on its retry: FLAKY_FILE is per Concert, on the Mac.
  func testFlaky() throws {
    let file = try XCTUnwrap(env["FLAKY_FILE"])
    if FileManager.default.fileExists(atPath: file) {
      try FileManager.default.removeItem(atPath: file)
      return
    }
    FileManager.default.createFile(atPath: file, contents: nil)
    XCTFail("Fails the first time, passes on the retry")
  }
}
