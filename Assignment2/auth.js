const express = require("express");
const { handleErr } = require("./errorHandler.js");
const { asyncWrapper } = require("./asyncWrapper.js");
const dotenv = require("dotenv");
dotenv.config();
const pokeUser = require("./pokeUser.js");
const { connectDB } = require("./connectDB.js");

const app = express();

const start = asyncWrapper(async () => {
  await connectDB();

  app.listen(process.env.authPORT, (err) => {
    if (err) throw new PokemonDbError(err);
    else
      console.log(
        `Phew! Server is running on port: ${process.env.authServerPORT}`
      );
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

    const user = await userModel.create(userWithHashedPassword);
    res.send(user);
  })
);

const jwt = require("jsonwebtoken");
app.post(
  "/login",
  asyncWrapper(async (req, res) => {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) {
      throw new PokemonBadRequest("User not found");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new PokemonBadRequest("Password is incorrect");
    }
    // Create and assign a token
    // Create and assign a token
    if (user.token) {
      console.log(user.token);
    } else {
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
      await userModel.findOneAndUpdate({ _id: user._id }, { token: token });
    }

    res.send("logged in sucessfully");
  })
);

app.use(handleErr);
