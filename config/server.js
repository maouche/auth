const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// .env
dotenv.config({ path: '.env.local' });
dotenv.config();

// App init
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/assets", express.static("public"));
app.use(cors());

app.listen(process.env.PORT, () =>
    console.log("listing to port " + process.env.PORT)
);

module.exports = app;
