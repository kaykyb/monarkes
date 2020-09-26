require("dotenv").config();
const express = require("express");

const monarkGenerator = require("./monark-generator");
const twit = require("twit");

const MONARK_UID = process.env.MONARK_UID;

const config = {
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.MONARK_ACCESS_TOKEN,
  access_token_secret: process.env.MONARK_ACCESS_SECRET,
};

const T = new twit(config);

async function start() {
  const stream = T.stream("statuses/filter", { follow: `${MONARK_UID}` });

  console.log("Stream iniciado para " + MONARK_UID);

  stream.on("tweet", async function (tweet) {
    console.log("Recebeu tweet de " + tweet.user.id);

    if (`${tweet.user.id}` !== `${MONARK_UID}`) return;
    if (tweet.retweeted_status) return;

    console.log("Vai enviar.");

    const txt = tweet.text;
    const monark = await monarkGenerator.generate(txt);

    const mediaData = await T.post("media/upload", {
      media_data: monark.toString("base64"),
    });

    var res = {
      status: `@${tweet.user.screen_name} ${txt}`,
      in_reply_to_status_id: tweet.id_str,
      media_ids: [mediaData.data.media_id_string],
    };

    await T.post("statuses/update", res);
  });
}

start();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("BOT OK");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
