import dotenv from "dotenv";
dotenv.config();
import express, { query } from "express";
import cors from "cors";
import mongo from "mongodb";
import connect from "./db.js";
import authentification from "./authentification.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 5000;

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
  let query = req.query;
  let selekcija = {};

  if (query._any) {
    let search = query._any;
    let terms = search.split(" ");

    let atributi = ["naslov", "postedBy"];

    selekcija = {
      $and: [],
    };

    terms.forEach((term) => {
      let or = {
        $or: [],
      };

      atributi.forEach((atribut) => {
        or.$or.push({ [atribut]: new RegExp(term) });
      });

      selekcija.$and.push(or);
    });
  }

  let cursor = await db.collection("Posts").find(selekcija);
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

  console.log(data);

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

  let response = await db
    .collection("Comments")
    .delete({ postId: mongo.ObjectId(id) }, { $set: data });

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
  data.follow = [];
  console.log(data);
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

app.put("/following", [authentification.verify], async (req, res) => {
  let updated = "";

  let db = await connect();

  let users = await db.collection("Users");

  let user_querry = {
    username: req.body.username,
  };

  let user_option = { projection: { _id: 0, follow: 1 } };

  let userfollowing = await users.findOne(user_querry, user_option);

  let new_user_querryId = { username: req.body.usertoFollow };
  let new_user_optionId = { projection: { _id: 1 } };
  let usertoFollowId = await users.findOne(
    new_user_querryId,
    new_user_optionId
  );

  let new_user_querryname = { username: req.body.usertoFollow };
  let new_user_optionname = { projection: { _id: 0, username: 1 } };
  let usertoFollowname = await users.findOne(
    new_user_querryname,
    new_user_optionname
  );

  if (userfollowing) {
    let count = 0;
    let usertoFollow_id = usertoFollowId._id.toString();
    let exist = 0;

    for (let i in userfollowing.follow) {
      if (userfollowing.follow[count].followingId == usertoFollow_id) {
        exist = 1;
        updated = "You alredy follow this person!";
      }
      count++;
    }

    if (usertoFollow_id && !exist) {
      let following = userfollowing.follow;
      following[count] = {
        followingId: usertoFollow_id,
        followingName: usertoFollowname.username,
      };

      const updateTable = {
        $set: {
          follow: following,
        },
      };

      const update = await users.updateOne(user_querry, updateTable);
      updated = "Ok";
    } else {
      console.log("Existing");
      updated = "Existing";
    }
  } else updated = "error";

  res.status(201);
  res.send(updated);
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
