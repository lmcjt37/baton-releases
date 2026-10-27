describe('launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows the app #smoke', async () => {
    await waitFor(element(by.id('baton-sample-ready'))).toBeVisible().withTimeout(120000);
    await expect(element(by.text('Baton sample'))).toBeVisible();
    await device.takeScreenshot('launch');
  });
});
