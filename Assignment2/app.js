const mongoose = require("mongoose");
const express = require("express");
const { connectDB } = require("./connectDB.js");
const { populatePokemons } = require("./populatePokemons.js");
const { getTypes } = require("./getTypes.js");
const { handleErr } = require("./errorHandler.js");
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonNoToken,
  PokemonNotAdmin,
} = require("./errors.js");
const cookieParser = require("cookie-parser");
const tokenList = require("./tokenList");

const { asyncWrapper } = require("./asyncWrapper.js");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
var pokeModel = null;

const start = asyncWrapper(async () => {
  await connectDB();
  const pokeSchema = await getTypes();
  pokeModel = await populatePokemons(pokeSchema);

  app.listen(process.env.appPORT, (err) => {
    if (err) throw new PokemonDbError(err);
    else console.log(`APP Server is running on port: ${process.env.appPORT}`);
  });
});
start();

app.use(express.json());
const jwt = require("jsonwebtoken");

const authUser = asyncWrapper(async (req, res, next) => {
  const token = req.query["token"];
  if (!token) {
    throw new PokemonNoToken("Access denied");
  }
  const tokenDB = await tokenList.findOne({ token: token });
  console.log(tokenDB);
  if (tokenDB.blocked) {
    throw new PokemonNoToken("Invalid token");
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET); // nothing happens if token is valid
    next();
  } catch (err) {
    throw new PokemonBadRequest("Invalid token");
  }
});
app.use(authUser);

app.get(
  "/api/v1/pokemons",
  asyncWrapper(async (req, res) => {
    if (!req.query["count"]) req.query["count"] = 10;
    if (!req.query["after"]) req.query["after"] = 0;
    // try {
    const docs = await pokeModel
      .find({})
      .sort({ id: 1 })
      .skip(req.query["after"])
      .limit(req.query["count"]);
    console.log(docs);
    res.json(docs);
    // } catch (err) { res.json(handleErr(err)) }
  })
);

app.get(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    // try {
    const { id } = req.params;
    const docs = await pokeModel.find({ id: id });
    if (docs.length != 0) res.json(docs);
    else res.json({ errMsg: "Pokemon not found" });
    // } catch (err) { res.json(handleErr(err)) }
  })
);

const authAdmin = asyncWrapper(async (req, res, next) => {
  const token = req.query["token"];
  const tokenDB = await tokenList.findOne({ token: token });
  if (tokenDB.userType === "Admin") {
    next();
  } else {
    throw new PokemonNotAdmin();
  }
});

app.use(authAdmin);
app.post(
  "/api/v1/pokemon/",
  asyncWrapper(async (req, res) => {
    // try {
    if (!req.body.id) throw new PokemonBadRequestMissingID();
    const poke = await pokeModel.find({ id: req.body.id });
    if (poke.length != 0) throw new PokemonDuplicateError();
    const pokeDoc = await pokeModel.create(req.body);
    res.json({
      msg: "Added Successfully",
    });
    // } catch (err) { res.json(handleErr(err)) }
  })
);

app.delete(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    // try {
    const docs = await pokeModel.findOneAndRemove({ id: req.params.id });
    if (docs)
      res.json({
        msg: "Deleted Successfully",
      });
    // res.json({ errMsg: "Pokemon not found" })
    else throw new PokemonNotFoundError("");
    // } catch (err) { res.json(handleErr(err)) }
  })
);

app.put(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    // try {
    const selection = { id: req.params.id };
    const update = req.body;
    const options = {
      new: true,
      runValidators: true,
      overwrite: true,
    };
    const doc = await pokeModel.findOneAndUpdate(selection, update, options);
    // console.log(docs);
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc,
      });
    } else {
      // res.json({ msg: "Not found", })
      throw new PokemonNotFoundError("");
    }
    // } catch (err) { res.json(handleErr(err)) }
  })
);

app.patch(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    // try {
    const selection = { id: req.params.id };
    const update = req.body;
    const options = {
      new: true,
      runValidators: true,
    };
    const doc = await pokeModel.findOneAndUpdate(selection, update, options);
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc,
      });
    } else {
      // res.json({  msg: "Not found" })
      throw new PokemonNotFoundError("");
    }
    // } catch (err) { res.json(handleErr(err)) }
  })
);

app.get("*", (req, res) => {
  // res.json({
  //   msg: "Improper route. Check API docs plz."
  // })
  throw new PokemonNoSuchRouteError("");
});

app.use(handleErr);
