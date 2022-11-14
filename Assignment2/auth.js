const express = require("express");
const { handleErr } = require("./errorHandler.js");
const { asyncWrapper } = require("./asyncWrapper.js");
const dotenv = require("dotenv");
dotenv.config();
const pokeUser = require("./pokeUser.js");
const tokenList = require("./tokenList");
const { connectDB } = require("./connectDB.js");
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
} = require("./errors.js");

const app = express();

const start = asyncWrapper(async () => {
  await connectDB();

  app.listen(process.env.authPORT, (err) => {
    if (err) throw new PokemonDbError(err);
    else console.log(`AUTH Server is running on port: ${process.env.authPORT}`);
  });
});
start();

app.use(express.json());

const bcrypt = require("bcrypt");
app.post(
  "/register",
  asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userWithHashedPassword = { ...req.body, password: hashedPassword };

    const user = await pokeUser.create(userWithHashedPassword);
    res.send(user);
  })
);

const jwt = require("jsonwebtoken");
app.post(
  "/login",
  asyncWrapper(async (req, res) => {
    const { username, password } = req.body;
    const user = await pokeUser.findOne({ username });
    if (!user) {
      throw new PokemonBadRequest("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new PokemonBadRequest("Password is incorrect");
    }
    // Create and assign a token
    if (user.token) {
      console.log(user.token);
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      console.log(token);
      await pokeUser.findOneAndUpdate({ _id: user._id }, { token: token });
      await tokenList.create({ token: token, blocked: false });
    }

    res.send("logged in sucessfully");
  })
);

app.use(handleErr);
