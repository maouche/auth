const app = require("./config/server");
const routesAuth = require("./route/auth");

// ADD ROUTES
app.use("/api/v1", routesAuth);