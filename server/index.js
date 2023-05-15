import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import { findMovies } from "./controllers/findMovie.js";
import { findPerson } from "./controllers/findPerson.js";
import { getMovie } from "./controllers/getMovie.js";
import { getPerson } from "./controllers/getPerson.js";
import { getUserData } from "./controllers/getUserData.js";
import { saveMovies } from "./controllers/saveMovie.js";
import { SavePerson } from "./controllers/savePerson.js";
import { suggestionUser } from "./controllers/suggestionUser.js";
import { getUser } from "./controllers/user.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

const pusher = new Pusher({
  appId:"1601213",
  key:"73bd39f2e41b50545f9b",
  secret:"88b40128a79b799ec52f",
  cluster: "classy-dawn-907",
  useTLS: true,
});

app.use(express.json());
app.use(cors());

const connection_Url = process.env.MONGODB_URL;

mongoose
  .connect(connection_Url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => console.log(err));

mongoose.connection.once("open", () => {
  console.log("Db CONNECTED");

  const changeStream = mongoose.connection.collection("movie-data").watch();
  changeStream.on("change", (change) => {
    pusher.trigger("movie-data", "new-movieData", {
      change: change,
    });
  });

  const changePerson = mongoose.connection.collection("person-data").watch();
  changePerson.on("change", (change) => {
    pusher.trigger("person-data", "new-personData", {
      change: change,
    });
  });
});

app.get("/", (req, res) => res.status(200).send("Movflix Build"));

app.post("/user", getUser);
app.get("/user/:id", getUserData);
app.get("/movie/:id", getMovie);
app.post("/save/movie", saveMovies);
app.post("/find/movie", findMovies);
app.get("/person/:id", getPerson);
app.post("/save/person", SavePerson);
app.post("/find/person", findPerson);
app.get("/suggestion/:id", suggestionUser);

app.listen(port, () => console.log(`listen on localhost:${port}`));
