import express from "express";
import cors from "cors";
import { objave, objaveDetails } from "./store.js";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(objave);
});

app.get("/:id", (req, res) => {
  let id = req.params.id;
  console.log(id);
  let objava = objaveDetails.find((objava) => objava.id == id);
  res.send(objava);
});

app.post("/", (req, res) => {
  console.log("Objava", req.body);
  res.send();
});

app.put("/comment/:id", (req, res) => {
  console.log("Comment", req.params.id, req.body);
  res.send();
});

app.patch("/:id", (req, res) => {
  console.log("Description", req.params.id, req.body);
  res.send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
