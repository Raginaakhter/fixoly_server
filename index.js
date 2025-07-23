const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ki3pnna.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    // Database & Collections
    const serviceCollection = client.db("Mobile-Repair");
    const userCollection = serviceCollection.collection("Services");

    const bookingCollection = client.db("bookings").collection("bookingData");
    const database = client.db("usersDB");
    const usersCollection = database.collection("users");

    // --- Services API ---
    app.get('/Services', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/Services/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      if (!result) {
        return res.status(404).send({ error: "Service not found" });
      }

      res.send(result);
    });

    // --- Users API ---
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log("new user:", user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      console.log("Deleting user:", id);
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // --- Bookings API ---
    app.get('/bookings', async (req, res) => {
      console.log("Booking requested for:", req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }; 
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });


// Delete

app.delete("/bookings/:id",async(req ,res)=>{
    const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bookingCollection.deleteOne(query);
  res.send(result);

});

// put

app.patch("/bookings/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: "confirmed"
    }
  };

  const result = await bookingCollection.updateOne(filter, updateDoc);
  res.send(result);
});



    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log("New booking:", booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // MongoDB connection check
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
    // await client.close(); // don't close in dev
  }
}
run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
  res.send('📡 Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});
