module.exports = {
    apps: [{
      name: "external-account-manager", // Give your app a name
      script: "app.js", // Or whatever your main entry point file is
      instances: "max", // Or a specific number
      exec_mode: "cluster", // or "fork" depending on your needs
      env: {
        NODE_ENV: "production", // Set environment variables
      },
    }],
  };
  