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
  PokemonBadPassword,
  PokemonNotUser,
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

let userType;

const bcrypt = require("bcrypt");
app.post(
  "/register",
  asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body;
    userType = username;
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
    if (user == null) {
      throw new PokemonNotUser("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new PokemonBadPassword("Password is incorrect");
    }
    // Create and assign a token
    if (user.token) {
      console.log(user.token);
      await tokenList.findOneAndUpdate(
        { token: user.token },
        { blocked: false }
      );
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      console.log(token);
      ////
      res.cookie("cookie", token);
      await pokeUser.findOneAndUpdate({ _id: user._id }, { token: token });
      if (userType == "Admin") {
        await tokenList.create({
          token: token,
          blocked: false,
          userType: "Admin",
        });
      } else {
        await tokenList.create({
          token: token,
          blocked: false,
          userType: "User",
        });
      }
    }
    res.send("logged in sucessfully");
  })
);

app.post(
  "/logout",
  asyncWrapper(async (req, res) => {
    const token = req.query["token"];
    const tokenDB = await tokenList.findOneAndUpdate(
      { token: token },
      { blocked: true }
    );
    if (tokenDB) {
      res.send("logout in sucessfully");
    } else {
      res.send("User/Token not found failed to log out");
    }
  })
);

app.use(handleErr);
