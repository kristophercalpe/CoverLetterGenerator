(function() {
  const fs = require('fs');
  const path = require('path');
  const process = require('process');

  const DOTENV_PATTERN = /^([a-zA-Z0-9_]+)\s*=\s*(.*)$/;

  function parse(src) {
    const result = {};
    const lines = src.split('\n');
    lines.forEach(function(line) {
      const match = line.match(DOTENV_PATTERN);
      if (match) {
        const key = match[1];
        const value = match[2];
        result[key] = value;
      }
    });
    return result;
  }

  function load() {
    const envPath = path.resolve(process.cwd(), '.env');
    
    // Check if the .env file exists and log it
    if (!fs.existsSync(envPath)) {
      console.error('.env file not found at the root of the project.');
      process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    return parse(envContent);
  }

  const env = load();
  console.log('Loaded .env variables:', env);  // Logs the parsed environment variables

  // Assign the environment variables to process.env
  for (const key in env) {
    process.env[key] = env[key];
  }
})();
