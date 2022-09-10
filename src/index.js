import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongo from "mongodb";
import connect from "./db.js";
import authentification from "./authentification.js";
import mongoose from "mongoose";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

//Posts
app.post("/posts", [authentification.verify], async (req, res) => {
  let data = req.body;

  let time = new Date().getTime();
  data.postedAt = new Date(time).toISOString().substring(0, 10);

  delete data._id;

  if (!data.naslov || !data.opis || !data.materijali || !data.alati) {
    res.json({
      status: "Faild",
      reason: "Incomplete post",
    });
    return;
  }

  let db = await connect();
  let result = await db.collection("Posts").insertOne(data);

  if (result) {
    res.json(result);
  } else {
    res.json({ status: "Faild" });
  }
});

app.get("/posts", [authentification.verify], async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("Posts").find();
  let resaults = await cursor.toArray();

  res.send(resaults);
});

app.get("/posts/:id", [authentification.verify], async (req, res) => {
  let id = req.params.id;
  let db = await connect();

  let results = await db
    .collection("Posts")
    .findOne({ _id: mongo.ObjectId(id) });

  res.json(results);
});

app.patch("/posts/:id", [authentification.verify], async (req, res) => {
  let data = req.body;
  let id = req.params.id;

  delete data._id;

  let db = await connect();

  let result = await db
    .collection("Posts")
    .updateOne({ _id: mongo.ObjectId(id) }, { $set: data });

  if (result && result.modifiedCount == 1) {
    let doc = await db.collection("Posts").findOne({ _id: mongo.ObjectId(id) });
    res.json(doc);
  } else {
    res.json({ status: "Faild" });
  }
});

app.delete("/posts/:id", [authentification.verify], async (req, res) => {
  let data = req.body;
  let id = req.params.id;

  delete data._id;

  let db = await connect();

  let result = await db
    .collection("Posts")
    .deleteOne({ _id: mongo.ObjectId(id) }, { $set: data });

  if (result && result.deletedCount == 1) {
    res.json({ status: "Deleted" });
  } else {
    res.json({ status: "Faild" });
  }
});

//Comments
app.post("/posts/:id/comments", [authentification.verify], async (req, res) => {
  let data = req.body;
  let id = req.params.id;

  data.postId = mongo.ObjectId(id);

  let time = new Date().getTime();
  data.postedAt = new Date(time).toISOString().substring(0, 10);

  delete data._id;

  if (!data.comment) {
    res.json({
      status: "Faild",
      reason: "Incomplete comment",
    });
    return;
  }

  let db = await connect();

  let result = await db.collection("Comments").insertOne(data);

  if (result) {
    res.json(result);
  } else {
    res.json({ status: "Faild" });
  }
});

app.get("/comments/:postId", [authentification.verify], async (req, res) => {
  let id = req.params.postId;

  let data = mongo.ObjectId(id);

  let db = await connect();

  let cursor = await db.collection("Comments").find({ postId: data });
  let results = await cursor.toArray();

  res.json(results);
});

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

app.get("/users", [authentification.verify], async (req, res) => {
  let db = await connect();

  let cursor = await db.collection("Users").find();
  let resaults = await cursor.toArray();

  res.send(resaults);
});

app.get("/users/:id", [authentification.verify], async (req, res) => {
  let id = req.params.id;
  let db = await connect();

  let results = await db
    .collection("Users")
    .findOne({ _id: mongo.ObjectId(id) });

  res.json(results);
});

//Login
app.get("/secret", [authentification.verify], async (req, res) => {
  res.status(200).send("Nemoj nikom reci tajnu, shhh " + req.jwt.username);
});
app.post("/auth", async (req, res) => {
  let data = req.body;

  try {
    let result = await authentification.authenticateUser(
      data.email,
      data.password,
      data.username
    );
    res.json(result);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
