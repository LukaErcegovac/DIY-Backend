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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
