import mongo from "mongodb";

const connection_string = "mongodb://localhost:27017";

const client = new mongo.MongoClient(connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = null;

export default () => {
  return new Promise((resolve, reject) => {
    if (db && client.connect()) {
      resolve(db);
    }

    client.connect((err) => {
      if (err) {
        reject("Došlo je do greške prilikom spajanja!" + err);
      } else {
        console.log("Uspješno spojanje na bazu!");
        db = client.db("DIY");
        resolve(db);
      }
    });
  });
};
