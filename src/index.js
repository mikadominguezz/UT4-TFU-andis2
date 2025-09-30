const cluster = require('cluster');
const os = require('os');

const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;

if (cluster.isMaster) {
  const workers = parseInt(process.env.WEB_CONCURRENCY) || 8;
  console.log(`Master pid=${process.pid} arrancando exactamente ${workers} workers`);
  console.log(`CPUs disponibles: ${os.cpus().length}, Workers configurados: ${workers}`);
  for (let i = 0; i < workers; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} murió (${signal || code}). Forking otro...`);
    cluster.fork();
  });
} else {
  const app = createApp();
  app.listen(PORT, () => console.log(`Worker pid=${process.pid} escuchando en ${PORT}`));
}
