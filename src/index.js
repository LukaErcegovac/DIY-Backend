import express from "express";
import cors from "cors";
import mongo from "mongodb";
import connect from "./db.js";
import autentification from "./authentification.js";
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

<<<<<<< Updated upstream
app.post("/", (req, res) => {
  console.log("Objava", req.body);
  res.send();
=======
//Dodavanje
//Registracija
app.post("/:users", async (req, res) => {
  let user = req.body;

  let id;

  try {
    id = await authentification.authenticateUser(user);
  } catch (error) {
    res.status(500).json({ error: error.massage });
  }

  res.json({ id: id });
  res.json(user);
>>>>>>> Stashed changes
});

//Login
app.post("/:auth", async (req, res) => {
  let user = req.body;

  try {
    let result = await autentification.authenticateUser(
      user.username,
      user.password
    );
    res.json(result);
  } catch (error) {
    res.status(403).json({ error: error.massage });
  }

  res.json(user);
});
app.get("/:tajna", (req, res) => {
  console.log(req.headers);

<<<<<<< Updated upstream
app.patch("/:id", (req, res) => {
  console.log("Description", req.params.id, req.body);
  res.send();
=======
  res.send({ massage: "Ovo je tajna" });
>>>>>>> Stashed changes
});

//Promjena

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
