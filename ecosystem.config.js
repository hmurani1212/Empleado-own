module.exports = {
  apps: [{
    name: 'empleado_V3',
    //Uncomment this if you want not to auto restart on changes.
    //script: 'index.js',

    //Uncomment this if you want to auto restart on changes.
    script: 'node_modules/nodemon/bin/nodemon.js',
    args: 'server.js', // replace with your entry point file
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    max_size: '1M',
    max_days: '0d',
    env: 
    {
      NODE_ENV: 'development',
      PORT: 4100    },
    exec_mode: 'fork',
    
    //Log settings
    merge_logs: true,
    log_type: 'text',
  }]
};
