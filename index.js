const config = require("./config.json");
process.env.DASHBOARD = config.enviromentUrl;
process.env.DASHBOARD_REDIRECT =
  process.argv[2] === "dev"
    ? config.enviromentRedirectUrl.dev
    : config.enviromentRedirectUrl.production;
const cookies = require("cookies");
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const middleware = require("./modules/middleware");
const credentials = require("./credentials.json");

const authRoutes = require("./routes/auth-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const serverRoutes = require("./routes/servers-routes");
const adminRoutes = require("./routes/admin-routes");
const apiRoutes = require("./routes/api-routes");

const app = express();

require("./bot").start();

mongoose.connect(
  credentials.mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) =>
    error
      ? console.log("Failed to connect to database")
      : console.log("Connected to database")
);
mongoose.set("useFindAndModify", false);
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(methodOverride("_method"));
app.use(cookies.express("a", "b", "c"));

app.use(express.static(`${__dirname}/assets`));
app.locals.basedir = `${__dirname}/assets`;

app.use(
  "/",
  middleware.updateUser,
  serverRoutes,
  apiRoutes,
  authRoutes,
  middleware.validateUser,
  middleware.updateGuilds,
  dashboardRoutes,
  middleware.validateUser,
  adminRoutes
);
app.all("*", (req, res) => res.render("404"));

const port = process.env.PORT || config.port || 3000;
app.listen(port, () =>
  console.log(
    `Server is live on port ${port}, using ${process.env.DASHBOARD_REDIRECT} as redirect`
  )
);
