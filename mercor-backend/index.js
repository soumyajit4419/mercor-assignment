const express = require("express");
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");

const API_KEY = process.env.API_KEY;
const configuration = new Configuration({
  apiKey: API_KEY,
});

const openai = new OpenAIApi(configuration);

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json({ status: 200, message: "Server is up and running" });
});

app.post("/getGTPText", async (req, res) => {
  const msg = req.body.message;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      messages: msg,
    });
    console.log(response.data, "my data");
    return res.json({ status: 200, value: response.data });
  } catch (err) {
    console.log(err.response.data);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
});

const port = 3500;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
