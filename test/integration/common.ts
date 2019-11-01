import started, { stop } from '../../src/index';

before(async () => {
  await started;
});

after(async () => {
  await stop();
});
