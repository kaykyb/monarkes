const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const pathJoin = (p) => path.join(__dirname, p);

const generate = async (text) => {
  const dir = fs.readdirSync(pathJoin("./monark_images"));
  const imgCount = dir.length;

  const FONT_32 = await Jimp.loadFont(pathJoin("./fonts/georgia_32_white.fnt"));
  const FONT_16 = await Jimp.loadFont(pathJoin("./fonts/georgia_16_white.fnt"));

  const selectedImage = Math.floor(Math.random() * imgCount) + 1;

  const FONT = text.length > 140 ? FONT_16 : FONT_32;

  const monark = await Jimp.read(
    pathJoin(`./monark_images/${selectedImage}.png`)
  );
  const base = await Jimp.read(pathJoin("./base.png"));

  const textHeight = Jimp.measureTextHeight(FONT, text, 320);
  const y = (315 - textHeight) / 2;

  const withText = base.print(FONT, 24, y, { text }, 320, 315);
  const withMonark = withText.composite(
    monark.grayscale().color([{ apply: "green", params: [30] }]),
    370,
    0
  );

  const result = await withMonark.getBufferAsync(Jimp.MIME_PNG);
  return result;
};

module.exports = {
  generate: generate,
};
