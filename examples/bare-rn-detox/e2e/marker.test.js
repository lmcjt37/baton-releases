describe('marker', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  // EXPECTED_MARKER comes from baton.config.ts env: Detox tests read Baton's params from process.env.
  it("serves this Stage's bundle #smoke", async () => {
    await waitFor(element(by.id('baton-sample-marker'))).toBeVisible().withTimeout(120000);
    await expect(element(by.text(`marker: ${process.env.EXPECTED_MARKER}`))).toBeVisible();
    await device.takeScreenshot('marker');
  });
});
