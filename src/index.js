require("dotenv").config();

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

  stream.on("tweet", async function (tweet) {
    if (tweet.user.id !== MONARK_UID) return;

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
