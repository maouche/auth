const express = require("express");
const cors = require("cors");

// App init
const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/assets", express.static("public"));

app.use(
    cors({
        credentials: true,
        origin: process.env.URL_UI,
    })
);

app.listen(process.env.PORT, () =>
    console.log("listing to port " + process.env.PORT)
);

module.exports = app;
