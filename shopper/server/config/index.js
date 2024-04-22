const pkg = require("../../package.json");

module.exports = {
  applicationName: pkg.name,
  mongodb: {
    url: "mongodb://localhost:27017/shopper",
  },
  redis: {
    port: 7379,
    client: null,
  },
};
