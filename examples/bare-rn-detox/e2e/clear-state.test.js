describe('clear state', () => {
  // resetAppState wipes the app's data and settings; the relaunch must still load this Stage's bundle.
  it("still loads this Stage's bundle after resetAppState #smoke", async () => {
    await device.launchApp({ newInstance: true, resetAppState: true });
    await waitFor(element(by.id('baton-sample-marker'))).toBeVisible().withTimeout(120000);
    await expect(element(by.text(`marker: ${process.env.EXPECTED_MARKER}`))).toBeVisible();
  });
});
