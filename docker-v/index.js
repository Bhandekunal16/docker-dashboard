const { createApp } = require("./app");
const { getConfig } = require("./config");

const config = getConfig();
const { app } = createApp({ config });

app.listen(config.server.port, config.server.host, () => {
  console.log(
    `Server running at http://${config.server.host}:${config.server.port}`,
  );
});
