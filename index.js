const expressEdge = require("express-edge");
const express = require("express");
const edge = require("edge.js");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");

// === CONTROLLERS ===

const createPostController = require("./controllers/createPost");
const mainPageController = require("./controllers/mainPage");
const savePostController = require("./controllers/savePost");
const editPostController = require("./controllers/editPost");
const saveEditPostController = require("./controllers/saveEditPost");
const getPostController = require("./controllers/getPost");
const deletePostController = require("./controllers/deletePost");
const createUserController = require("./controllers/createUser");
const saveUserController = require("./controllers/saveUser");
const loginController = require("./controllers/login");
const loginUserController = require("./controllers/loginUser");
const logoutController = require("./controllers/logout");

// =====================

const app = new express();

app.use(
  expressSession({
    secret: "secret",
  }),
);

mongoose
  .connect("mongodb://localhost:27017/node-blog", { useNewUrlParser: true })
  .then(() => "You are now connected to Mongo!")
  .catch((err) => console.error("Something went wrong", err));

const mongoStore = connectMongo(expressSession);

app.use(
  expressSession({
    secret: "secret",
    saveUninitialized: true,
    store: new mongoStore({
      mongooseConnection: mongoose.connection,
      saveUninitialized: true,
    }),
  }),
);

app.use(fileUpload());
app.use(express.static("public"));
app.use(expressEdge.engine);
app.set("views", __dirname + "/views");

app.use("*", (req, res, next) => {
  edge.global("auth", req.session.userId);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === MIDDLEWARE ===

const savePost = require("./middleware/savePost");
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require("./middleware/redirectIfAuthenticated");

// =====================

app.use("/posts/save", savePost);

app.get("/", mainPageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.get("/update/:id", auth, editPostController);
app.post("/edit/:id", auth, saveEditPostController);
app.post("/posts/save", auth, savePost, savePostController);
app.get("/delete/:id", auth, deletePostController);
app.get("/auth/login", redirectIfAuthenticated, loginController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, saveUserController);
app.get("/auth/logout", logoutController);

app.listen(4000, () => {
  console.log("App listening on port 4000");
});
