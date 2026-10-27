const fs = require('node:fs');
const path = require('node:path');

// Run count kept on the host, so resetAppState in another test can't wipe it.
const COUNT = path.join(__dirname, '..', '.baton', 'flaky-runs');

describe('flaky', () => {
  // Fails on odd runs and passes on even ones, so a Concert with one retry reports it flaky.
  it('passes on the second run', async () => {
    const runs = (Number(fs.existsSync(COUNT) && fs.readFileSync(COUNT, 'utf8')) || 0) + 1;
    fs.mkdirSync(path.dirname(COUNT), { recursive: true });
    fs.writeFileSync(COUNT, String(runs));
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.id('baton-sample-ready'))).toBeVisible().withTimeout(120000);
    if (runs % 2) throw new Error(`flaky: run ${runs} fails, the next passes`);
  });
});
