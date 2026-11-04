import XCTest

/// `_smoke_` in a name tags the test `smoke`.
final class MarkerTests: XCTestCase {
  private let app = XCUIApplication()

  override func setUp() {
    continueAfterFailure = false
    app.launch()
  }

  func test_smoke_showsMarker() {
    let expected = ProcessInfo.processInfo.environment["EXPECTED_MARKER"] ?? "main"
    let label = app.staticTexts["marker"]
    XCTAssertTrue(label.waitForExistence(timeout: 30))
    XCTAssertEqual(label.label, "Marker: \(expected)")
  }

  func test_smoke_tapShowsResult() {
    app.buttons["tap"].tap()
    XCTAssertTrue(app.staticTexts["tapped"].waitForExistence(timeout: 5))
  }
}
