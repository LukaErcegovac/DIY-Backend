import mongo from "mongodb";
import connect from "./db.js";
import bcrypt from "bcrypt";
import e from "express";

(async () => {
  let db = await connect();
  await db.collection("Users").createIndex({ username: 1 }, { unique: true });
})();

export default {
  async registerUser(userData) {
    let db = await connect();

    let doc = {
      username: userData.username,
      password: await bcrypt.hash(userData.password, 8),
      grad: userData.grad,
      datum_rodjenja: userData.datum_rodjenja,
    };

    try {
      let result = await db.collection("Users").insertOne(doc);
      if (result && result.insertedId) {
        return result.insertedId;
      }
    } catch (error) {
      if (error.name == "MongoError" && error.code == 11000) {
        throw new Error("Korisnik postoji!");
      }
    }
  },

  async authenticateUser(username, password) {
    let db = await connect();
    let user = await db.collection("Users").findOne({ username: username });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      delete user.password;
      let token = jwt.sign(user, "tajna", {
        algorithm: "HS512",
        expiresIn: "1 week",
      });
      return {
        token,
        username: user.username,
      };
    } else {
      throw new Error("Cannot authenticate!");
    }
  },
};
