/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const Redis = require("ioredis");
const CoinAPI = require("../CoinAPI");

class RedisBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
  }

  connect() {
    this.client = new Redis(7379);
    return this.client;
  }

  async disconnect() {
    return this.client.disconnect();
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const values = [];
    Object.entries(data.bpi).forEach((entry) => {
      values.push(entry[1]);
      values.push(entry[0]);
    });

    return this.client.zadd("maxcoin:values", values);
  }

  async getMax() {
    return this.client.zrange("maxcoin:values", -1, -1, "WITHSCORES");
  }

  async max() {
    console.info("Connection to MongoDB ");
    console.time("mongodb-connect");

    try {
      const client = this.connect();
      if (client) {
        console.log("Connected to Redis!");
        const insertResults = await this.insert();
        console.log(`inserResults: ${insertResults}`);

        console.info("Querying Redis");
        console.time("Redis-find");
        const result = await this.getMax();
        console.timeEnd("Redis-find");
        return result;
      }
    } catch (error) {
      console.error("Error connecting to Redis:", error);
      return { error: "Error connecting to Redis" };
    } finally {
      await this.disconnect();
      console.timeEnd("Redis-connect");
    }
  }
}

module.exports = RedisBackend;
