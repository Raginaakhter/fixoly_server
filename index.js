const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const jwt =require('jsonwebtoken')

const cookieParser = require('cookie-parser'); 
const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://fixoly-ec876.web.app',
    'https://fixoly-ec876.firebaseapp.com'

  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ki3pnna.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// ekhane token verifyy korbe medam bucchen , 
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token; 
  console.log('middleware:',token);
  if (!token) {
    return res.status(401).send({ message: 'Unauthorized Acecess' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('err');
      return res.status(401).send({ message: 'Invalid Token' });
    }

    console.log('if token in the value',decoded);
        req.user = decoded;
    next();

  });
};
// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).send({ message: 'Unauthorized' });
//   }

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(403).send({ message: 'Invalid Token' });
//     }
//     req.user = decoded;
//     next();
//   });
// };


// middleware......................................................


const logger = async(req,res,next )=>{
console.log("called :",req.host,req.originalUrl);
next()
}










// ..............................................................
// cookie option

const cookieoption = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'?true:false, 
        sameSite: process.env.NODE_ENV === 'production'?'none' : 'strict',
      }






async function run() {
  try {
    // await client.connect();

    
    const serviceCollection = client.db("Mobile-Repair");
    const userCollection = serviceCollection.collection("Services");
    const bookingCollection = client.db("bookings").collection("bookingData");
    const database = client.db("usersDB");
    const usersCollection = database.collection("users");


    app.post('/jwt',logger, async (req, res) => {
      const user = req.body;
      console.log("User for JWT:", user);

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

     
      res.cookie('token', token,cookieoption,{...cookieoption,maxAge:0}).send({ success: true, token }); 
    });






    // --- Services API ---
    app.get('/Services',logger, async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/Services/:id',logger, async (req, res) => {
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
    app.get('/users',logger, async (req, res) => {
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

    // --- Bookings API (Protected) ---
    app.get('/bookings', verifyToken, async (req, res) => {
      console.log("Booking requested for:", req.query.email);
      console.log('user in the valid token',req.user);
      console.log("token tok",req.cookies.token);
      let query = {};

      if(req.query?.email !==req.query.email){
        return res.status(403).send({message:'Forbeden Access'})
      }
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // Delete Booking
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Update Booking
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

    // Create Booking
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log("New booking:", booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    // MongoDB connection check
    // await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } finally {
    // await client.close(); // don't close in dev
  }
}
run().catch(console.dir);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('📡 Server is running');
});

app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
});