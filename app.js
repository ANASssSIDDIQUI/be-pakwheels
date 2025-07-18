const pakwheelsRouter = require("./routes/pakwheelsRoutes");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: 'https://fe-pakwheels.vercel.app', // Replace with actual frontend URL
  methods: ['GET', 'POST'],
}));

const port = 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use("/", pakwheelsRouter);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => console.log(`Listening on port: ${port}`));
