const express = require("express");
var cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
app.use(cors());

const port = process.env.PORT || 5000;
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r3udp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run(req, res) {
  try {
    await client.connect();
    console.log("data connected");
    const database = client.db("Tourism");
    const dataCollection = database.collection("Places");
    const userCollection = client.db("UsersData").collection("Data");
    // add Service
    app.post("/addPlace", async (req, res) => {
      console.log(req.body);
      const result = await dataCollection.insertOne(req.body);
      res.json(result);
    });
    // add UsersData
    app.post("/addUserData", async (req, res) => {
      // console.log(req.body);
      const result = await userCollection.insertOne(req.body);
      console.log(result);
      res.json(result);
    });
    //find service
    app.get("/places", async (req, res) => {
      try {
        const cursor = dataCollection.find({});
        const sampleEvents = await cursor.toArray();
        res.send(sampleEvents);
      } catch (err) {
        res.json(err);
      }
    });
    //find Data
    app.get("/users", async (req, res) => {
      try {
        const cursor = userCollection.find({});
        const sampleEvents = await cursor.toArray();
        res.send(sampleEvents);
      } catch (err) {
        res.json(err);
      }
    });

    app.get("/places/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await dataCollection.findOne(query);
      res.send(result);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    //UPDATE API
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "approved",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);

      console.log(result);
      res.json(result);
    });

    // delete event
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      console.log("Del user", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
