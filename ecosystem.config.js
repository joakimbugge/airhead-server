module.exports = {
  apps: [{
    name: 'app',
    script: 'dist/src/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80,
    },
  }],
  deploy: {
    production: {
      user: process.env.DROPLET_USER,
      host: process.env.DROPLET_IP,
      ref: 'origin/master',
      repo: 'git@github.com:joakimbugge/airhead-server.git',
      path: '/root/apps',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
