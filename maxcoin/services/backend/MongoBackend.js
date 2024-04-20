/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-empty-function */
const { MongoClient } = require("mongodb");

const CoinAPI = require("../CoinAPI");

class MongoBackend {
  constructor() {
    this.coinAPI = new CoinAPI();
    this.mongoUrl = "mongodb://localhost:27017/maxcoin";
    this.client = null;
    this.collection = null;
  }

  async connect() {
    const mongoClient = new MongoClient(this.mongoUrl, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    this.client = await mongoClient.connect();
    this.collection = this.client.db("maxcoin").collection("values");
    return this.client; // Return the client for potential chaining
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }

  async insert() {
    const data = await this.coinAPI.fetch();
    const documents = [];
    Object.entries(data.bpi).forEach((entry) => {
      documents.push({
        date: entry[0],
        value: entry[1],
      });
    });
    return this.collection.insertMany(documents);
  }

  async getMax() {
    return this.collection.findOne({}, { sort: { value: -1 } });
  }

  async max() {
    console.info("Connection to MongoDB ");
    console.time("mongodb-connect");

    try {
      const client = await this.connect();
      if (client) {
        console.log("Connected to MongoDB!");
        const insertResults = await this.insert();
        console.log(`inserResults: ${insertResults.insertedCount}`);

        console.info("Querying mongoDB");
        console.time("mongo-find");
        const doc = await this.getMax();
        console.timeEnd("mongo-find");
        return {
          date: doc.date,
          value: doc.value,
        };
      }
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      return { error: "Error connecting to MongoDB" };
    } finally {
      await this.disconnect();
      console.timeEnd("mongodb-connect");
    }
  }
}

module.exports = MongoBackend;
