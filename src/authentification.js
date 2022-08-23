import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

(async () => {
  let db = await connect();
  await db.collection("Users").createIndex({ username: 1 }, { unique: true });
})();

export default {
  async registerUser(userData) {
    let db = await connect();

    let pod = {
      username: userData.username,
      password: await bcrypt.hash(userData.password, 2),
      grad: userData.grad,
      godina_rodjenja: userData.godina_rodjenja,
    };

    try {
      let resaults = await db.collection("Users").insertOne(pod);
      if (resaults && resaults.insertedId) {
        return resaults.insertedId;
      }
    } catch (error) {
      if (error.name == "MongoError" && error.code == 11000) {
        throw new Error("Korisnik postoji");
      }
    }
  },

  async authenticateUser(username, password) {
    let db = await connect();
    let data = await db.collection("Users").findOne({ username: username });

    if (
      data &&
      data.password &&
      (await bcrypt.compare(password, data.password))
    ) {
      delete data.password;
      let token = jwt.sign(data, process.env.jwt_secret, {
        algorithm: "HS512",
        expiresIn: "1 week",
      });

      return { token, username: data.username };
    } else {
      throw new Error("Nope");
    }
  },

  verify(req, res, next) {
    if (req.headers["authorization"]) {
      try {
        let authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send();
        } else {
          let token = authorization[1];

          req.jwt = jwt.verify(authorization[1], process.env.jwt_secret);
          return next();
        }
      } catch (err) {
        return res.status(401).send();
      }
    } else {
      return res.status(401).send();
    }
  },
};
