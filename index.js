require('dotenv').config(); // Sort out env vars
const AWS = require("aws-sdk");
const fs = require("fs");
const moment = require("moment");

// const DIR = "/home/pi/motion";
const DIR = "/Users/ollyfg/Desktop";

async function cleanup() {
  console.log("fn.cleanup");
  try {
    const videoFiles = fs.readdirSync(`${DIR}/videos`);
    const toDelete = videoFiles.filter(filename => {
      const time = moment(filename, "YYYY-MM-DDTHH:mm:ss[.mp4]").toISOString();
      return time < moment().subtract(24, "hours").toISOString();
    });
    toDelete.forEach(filename => {
      fs.unlinkSync(`${DIR}/videos/${filename}`);
    });
    console.log("fn.cleanup.success");
  } catch (error) {
    console.log("fn.cleanup.error", error);
    throw error;
  }
}

async function upload(path) {
  console.log("fn.upload", path);
  try {
    const filename = path.split("/").slice(-1)[0];
    const S3 = new AWS.S3();
    await S3.putObject({
      Body: fs.readFileSync(path),
      Bucket: "ollyfg-securitypi",
      Key: `videos/${filename}`,
      ContentType: "video/mp4"
    }).promise();
    console.log("fn.upload.success", filename);
  } catch (error) {
    console.log("fn.upload.error", error);
    throw error;
  }
}

async function run() {
  console.log("fn.run");
  try {
    await upload(process.argv.slice(-1)[0]);
    await cleanup();
    console.log("fn.run.success");
  } catch (error) {
    console.log("fn.run.error", error);
    throw error;
  }
}

run();
