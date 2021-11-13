const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0hj4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    console.log("conneckt todad");
    const database = client.db("carLeader");
    const carCollection = database.collection("services");
    const ordersCollection = database.collection("orders");
    const reviewCollection = database.collection("review");
    const contactCollection = database.collection("contact");
    const usersCollection = database.collection("users");

    //post api for services insert
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    //post api for services add a car product
    app.post("/services", async (req, res) => {
      const services = req.body;
      const result = await carCollection.insertOne(services);
      res.json(result);
    });
    //post api for contact from
    app.post("/contact", async (req, res) => {
      const contact = req.body;
      const result = await contactCollection.insertOne(contact);
      res.json(result);
    });
    //post api for email password
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await usersCollection.insertOne(users);
      res.json(result);
    });

    //GET API for show data home
    app.get("/services", async (req, res) => {
      const cursor = carCollection.find({}).limit(6);
      const services = await cursor.toArray();
      res.send(services);
    });
    //GET API for show data explore
    app.get("/explore", async (req, res) => {
      const cursor = carCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    //GET API for show data review
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    //GET API for show data manageProduct
    app.get("/manageProduct", async (req, res) => {
      const cursor = carCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });

    // GET Single Service id
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log("getting specific service", id);
      const query = { _id: ObjectId(id) };
      const service = await carCollection.findOne(query);
      res.json(service);
    });

    // Add Orders API
    app.post("/placeorder", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    //GET API for show data carOrders
    app.get("/carOrders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const carOrders = await cursor.toArray();
      res.send(carOrders);
    });

    // cancel an order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    //admin
    app.put('users/admin', async (req,res) =>{
      const user = req.body;
      console.log('put admin', user);
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })
    // admin test
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //update status
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running my car leader");
});
app.listen(port, () => {
  console.log("listening on port", port);
});
