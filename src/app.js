require("dotenv").config();
const express = require("express");
const { connect } = require("./db/connection");
const authRouter = require("./routes/auth");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  connect()
    .then(() =>
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`)),
    )
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = app;
