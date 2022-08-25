import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongo from "mongodb";
import connect from "./db.js";
import authentification from "./authentification.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("Posts").find();
  let resaults = await cursor.toArray();

  console.log(resaults);
  res.send(resaults);
});

app.post("/", (req, res) => {
  console.log("Objava", req.body);
  res.send();
});

//Dodavanje
//Registracija
app.post("/users", async (req, res) => {
  let data = req.body;
  let id;

  try {
    id = await authentification.registerUser(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  res.json({ id: id });
});

//Login
app.get("/secret", [authentification.verify], async (req, res) => {
  res.status(200).send("Nemoj nikom reci tajnu, shhh " + req.jwt.username);
});
app.post("/auth", async (req, res) => {
  let data = req.body;

  try {
    let result = await authentification.authenticateUser(
      data.username,
      data.password
    );
    res.json(result);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

//Promjena

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
