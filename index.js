const app = require("./config/server");
const routesAuth = require("./route/auth");

// ADD ROUTES
app.use("/api/v1", routesAuth);

console.log(process.env.ACCESS_TOKEN_SECRET)