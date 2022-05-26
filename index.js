const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

app = express();
port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// verifyJWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

//for connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xmqki.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//home of server
app.get("/", (req, res) => {
  res.send("your invo||DB server is ready for service");
});

// JWT Verify Function
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

//async function run
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("warehouse").collection("products");
    const sectionCollection = client.db("warehouse").collection("data");
    const itemsCollection = client.db("warehouse").collection("items");
    console.log("db connected");

    // use get and load all data by DB
    app.get("/products", async (req, res) => {
      let query;
      if (req.query.email) {
        const email = req.query.email;
        query = { email };
        const result = await itemsCollection.find(query).toArray();
        res.send(result);
      } else {
        query = {};
        const result = await itemsCollection.find(query).toArray();
        res.send(result);
      }
    });

    app.get("/data", async (req, res) => {
      const data = await sectionCollection.find({}).toArray();
      res.send(data);
    });
    app.put("/products/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateQuantity = {
        $set: {
          quantity: data.newQuantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateQuantity,
        options
      );
      res.send(result);
    });
    //  let get api for single id
    app.get("/products/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    // delete a product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    // Post api
    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productCollection.insertOne(newProducts);
      res.send(result);
    });
    //Update user or decrees by 1 when click delevery
    app.get("/user", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      } else {
        return res.status(403).send({ message: "Forbidden Access!" });
      }
    });

    // AUTH - GET JWT
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
    //--------
  } finally {
  }
}
//call run function (important)
run().catch(console.dir);

//listen data (important)
app.listen(port, () => {
  console.log("in sha allah it is work", port);
});
