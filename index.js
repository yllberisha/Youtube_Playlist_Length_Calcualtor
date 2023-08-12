const express = require("express");
require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const { getTime } = require("./src/getTime");
const { getData } = require("./src/getData");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index", { error: "", totalVideos: "", videoLen: "" });
});

app.post("/", async (req, res) => {
  var url = req.body.url;
  if (
    url.length < 38 ||
    url.slice(0, 38) !== "https://www.youtube.com/playlist?list="
  ) {
    res.render("index", {
      error: "Enter correct URL",
      totalVideos: "",
      videoLen: "",
    });
    return;
  }

  const ID = url.slice(38, url.length);

  try {
    let [totalV, Videos] = await getData(ID);

    // Extract start and end parameters from the request body
    let start = parseInt(req.body.start);
    let end = parseInt(req.body.end);

    if (isNaN(start) || isNaN(end) || start < 1 || end > totalV) {
      start = 1;
      end = totalV;
    }

    // Calculate Time and render the template
    let Time = await getTime(Videos, start - 1, end - 1);
    if (!Time) {
      res.render("index", {
        error: "Something went wrong!!!",
        totalVideos: "",
        videoLen: "",
      });
      return;
    }

    res.render("index", {
      error: "",
      totalVideos: totalV,
      videoLen: Time,
    });
  } catch (error) {
    console.error("Error fetching playlist data:", error);
    res.render("index", {
      error: "Error fetching playlist data. Please try again later.",
      totalVideos: "",
      videoLen: "",
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Listening on port " + process.env.PORT);
});
