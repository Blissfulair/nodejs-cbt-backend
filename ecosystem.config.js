module.exports = {
    apps : [
        {
          name: "server",
          script: "./app.js",
          instances: 2,
          exec_mode: "cluster",
          watch: true,
          increment_var : 'PORT',
          env: {
              "PORT": 5000,
          }
        }
    ]
  }