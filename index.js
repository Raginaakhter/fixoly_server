const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ki3pnna.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

// newsection......................................................................................
const serviceCollection = client.db("Mobile-Repair");
    const userCollection = serviceCollection.collection("Services");

    const bookingCollection = client.db("bookings").collection("bookingData");


// Get
app.get('/Services',async(req,res)=>{
  const cursor =  userCollection.find()
  const result = await cursor.toArray();
  res.send(result);
})

// Services data get

// app.get('/Services/:id',async(req,res)=>{
//   const id = req.params.id;
//   const query = {_id: new ObjectId(id)}


// const options = {
//   projection:{service_id:1 ,title:1,price:1}
// };


//   const result = await serviceCollection.findOne(query,options);
//   res.send(result);
// })

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




    // newsection ............................................................................
const database = client.db("usersDB");
    const usersCollection = database.collection("users");


// Get
app.get('/users',async(req,res)=>{
  const cursor =  usersCollection.find()
  const result = await cursor.toArray();
  res.send(result);
})



// post..........
app.post('/users',async(req,res)=>{
const user =req.body;
console.log("new users",user);

 const result = await usersCollection.insertOne(user);
 res.send(result);
})

// Delete
app.delete('/users/:id',async(req,res)=>{
   const id = req.params.id;
   console.log("please delete from database",id);
   const query = {_id: new ObjectId ( id)}
   const result =await usersCollection.deleteOne(query);
   res.send(result);
}
 
)

// Bookings.........
app.post('/bookings',async(req,res)=>{
  const booking = req.body;
  console.log(booking);
  const result = await bookingCollection.insertOne(booking);
  res.send(result);


})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('i am comming')
})


app.listen(port,()=>{
    console.log(`Server is running ${port}`);
})