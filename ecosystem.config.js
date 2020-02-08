module.exports = {
  apps: [{
    name: 'app',
    script: 'dist/main.js',
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
      user: 'root',
      host: '157.230.122.90',
      ref: 'origin/pm2-deploy',
      repo: 'git@github.com:joakimbugge/airhead-server.git',
      path: '/root/apps',
      ssh_options: 'StrictHostKeyChecking=no',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
