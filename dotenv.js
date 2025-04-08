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
    const envContent = fs.readFileSync(envPath, 'utf8');
    return parse(envContent);
  }

  const env = load();
  for (const key in env) {
    process.env[key] = env[key];
  }
  console.log(env);
})();
