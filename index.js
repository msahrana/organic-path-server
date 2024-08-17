const express = require("express");
const cors = require("cors");
const {MongoClient, ServerApiVersion} = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crgl3kb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const dataCollection = client.db("organicDB").collection("allData");

    app.get("/all-data", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const search = req.query.search;
      let query = {
        product_name: {$regex: search, $options: "i"},
      };
      if (filter) query.category = filter;
      let options = {};
      if (sort) options = {sort: {price: sort === "asc" ? 1 : -1}};
      const result = await dataCollection
        .find(query, options)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get("/data-count", async (req, res) => {
      const filter = req.query.filter;
      const search = req.query.search;
      let query = {
        product_name: {$regex: search, $options: "i"},
      };
      if (filter) query.category = filter;
      const count = await dataCollection.countDocuments(query);
      res.send({count});
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Organic Path server is running");
});

app.listen(port, () => {
  console.log(`Organic Path server is running on port: ${port}`);
});
