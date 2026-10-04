const { spawn } = await import('child_process');
const { fileURLToPath } = await import('url');
const { dirname, resolve } = await import('path');

export function launchWebDashboard(): void {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const webDir = resolve(__dirname, '../../web');

  console.log('\n  cloak › starting local companion dashboard on http://localhost:3000 ...\n');

  const proc = spawn('npx', ['vite', '--port', '3000', '--open'], {
    cwd: webDir,
    stdio: 'inherit',
    shell: true
  });

  proc.on('error', (err) => {
    console.error(`  ✖ Failed to start dashboard: ${err.message}`);
  });
}
