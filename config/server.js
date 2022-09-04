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

// CORS
if ( process.env.ENV === "dev") {
    app.use(cors());
} else {
    app.use(
        cors({
            credentials: true,
            origin: process.env.URL_UI,
        })
    );
}

app.listen(process.env.PORT, () =>
    console.log("listing to port " + process.env.PORT)
);

module.exports = app;
