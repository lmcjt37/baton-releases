describe('sign in', () => {
  // Always fails: the sample has no sign-in screen. Shows a failed test, its screenshot and device log.
  it('signs in', async () => {
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.id('baton-sample-ready'))).toBeVisible().withTimeout(120000);
    await element(by.text('Sign in')).tap();
  });
});
