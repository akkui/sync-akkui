var XMLHttpRequest = require("xhr2");
const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const server_stats = {
  requests: {
    total_per_hour: 0,
    add_music: 0,
    remove_music: 0,
    join_room: 0,
    room_status: 0,
    create_room: 0,
    server_stats: 0
  }
};

function requestsStats(where) {
  server_stats.requests.total_per_hour = server_stats.requests.total_per_hour + 1
  server_stats.requests[`${where}`] = server_stats.requests[`${where}`] + 1
}

setInterval(function () {
  server_stats.requests = {
    total_per_hour: 0,
    add_music: 0,
    remove_music: 0,
    join_room: 0,
    room_status: 0,
    create_room: 0,
    server_stats: 0
  }
}, 60000 * 60);

const server = {
  room: {
    global: {
      sync: false,
      songs: {
        array: [],
        object: {},
      },
      playing: {
        id: "kvO_nHnvPtQ",
        time: 0,
        duration: 0,
      },
      moderators: "",
    },
  },
};

function sync(roomID) {
  const getRoom = server.room[`${roomID}`];
  if (getRoom.sync === false) {
    getRoom.sync = true;
    setInterval(function () {
      getRoom.playing.time = getRoom.playing.time + 1;
      if (getRoom.playing.time > getRoom.playing.duration - 1) {
        getRoom.playing.time = 0;
        const roomNextSong = getRoom.songs.array[0];
        if (roomNextSong) {
          const nextSong_obj = getRoom.songs.object[`${roomNextSong}`];
          getRoom.songs.array.shift();
          getRoom.playing.id = roomNextSong;
          getRoom.playing.duration = nextSong_obj.duration;
        } else {
          getRoom.playing.id = "kvO_nHnvPtQ";
          getRoom.playing.duration = 1;
        }
      }
    }, 1000);
  }
}

app.post("/add_music", (req, res) => {
  requestsStats("add_music");
  const data = JSON.parse(req.body.json_string);
  if (!server.room[`${data.room.toLowerCase()}`])
    return res.send({
      status: 400,
      message: "Ocorreu um erro, aperte CTRL + F5.",
      color: "red",
    });

  const roomName = data.room.toLowerCase();
  let url = data.music_url;

  const regex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  if (regex.test(url)) {
    url = url
      .replace("https", "http")
      .replace("http://", "")
      .replace("www.", "")
      .replace("youtube.com/", "")
      .replace("youtu.be/", "")
      .replace("watch?v=", "");
    resultado = null;
    var getJSON = function (url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "json";
      xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
          callback(null, xhr.response);
        } else {
          callback(status, xhr.response);
        }
      };
      xhr.send();
    };

    getJSON(
      `https://www.googleapis.com/youtube/v3/videos?id=${url}&part=contentDetails&key=${process.env.youtubeAPI}`,
      async function (err, data) {
        let duration = data.items[0].contentDetails.duration;
        duration = duration.replace("PT", "").replace("M", "M|");
        if (duration.substring(duration.length - 1, duration.length) === "S") {
          divisor = 0;
          function loop() {
            if (
              duration.substring(
                duration.length - divisor,
                duration.length - divisor + 1
              ) === "|"
            ) {
              minutes = Number(
                duration.substring(0, duration.length - divisor - 1)
              );
              seconds = Number(
                duration.substring(
                  duration.length - divisor + 1,
                  duration.length - 1
                )
              );
              resultado = seconds + minutes * 60;
            } else {
              if (divisor > 4) {
                duration = duration.replace("S", "");
                resultado = Number(duration);
              } else {
                divisor = divisor + 1;
                loop();
              }
            }
          }
          loop();
        } else {
          duration = duration.replace("M|", "");
          resultado = Number(duration) * 60;
        }

        if (resultado < 360) {
          if (server.room[`${roomName}`].playing.id === "kvO_nHnvPtQ") {
            server.room[`${roomName}`].playing.id = url;
            server.room[`${roomName}`].playing.time = 0;
            server.room[`${roomName}`].playing.duration = resultado;
          } else {
            server.room[`${roomName}`].songs.array.push(`${url}`);
            server.room[`${roomName}`].songs.object[`${url}`] = {
              duration: resultado,
            };
          }

          sync(roomName);
          return res.send({
            status: 200,
            message: "A música foi adicionada a lista com sucesso.",
            color: "green",
          });
        } else {
          return res.send({
            status: 400,
            message: "O vídeo não pode ter mais do que 6 Minutos.",
            color: "red",
          });
        }
      }
    );
  } else {
    return res.send({ status: 400, message: "Link inválido.", color: "red" });
  }
});

app.post("/remove_music", (req, res) => {
  requestsStats("remove_music");
  const data = JSON.parse(req.body.json_string);
  if (!server.room[`${data.room.toLowerCase()}`])
    return res.send({
      status: 400,
      message: "Ocorreu um erro, aperte CTRL + F5.",
      color: "red",
    });

  const roomName = data.room.toLowerCase();
  let url = data.music_url;
  if (roomName === "global")
    return res.send({
      status: 400,
      message: "Essa função não pode ser performado no chat global.",
      color: "red",
    });
  if (
    Number(server.room[`${roomName}`].moderators) === Number(data.browser_id)
  ) {
    const regex =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
    if (regex.test(url)) {
      url = url
        .replace("https", "http")
        .replace("http://", "")
        .replace("www.", "")
        .replace("youtube.com/", "")
        .replace("youtu.be/", "")
        .replace("watch?v=", "");

      if (server.room[`${roomName}`].songs.array.includes(url)) {
        const getValueInArray = server.room[`${roomName}`].songs.array.indexOf(
          `${url}`
        );
        server.room[`${roomName}`].songs.array.splice(getValueInArray, 1);

        return res.send({
          status: 200,
          message: "Vídeo removido com sucsso.",
          color: "green",
        });
      } else {
        return res.send({
          status: 400,
          message: "Esse vídeo não esta na lista de reprodução.",
          color: "red",
        });
      }
    } else {
      return res.send({ status: 400, message: "Link inválido.", color: "red" });
    }
  } else {
    return res.send({
      status: 400,
      message: "Permissões insuficientes.",
      color: "red",
    });
  }
});

app.post("/join_room", (req, res) => {
  requestsStats("join_room");
  const data = JSON.parse(req.body.json_string);
  if (!server.room[`${data.room.toLowerCase()}`])
    return res.send({ status: 400, message: "Essa sala não existe." });

  let checkMod = 0;
  if (
    Number(server.room[`${data.room.toLowerCase()}`].moderators) === Number(data.browser_id)
  )
    checkMod = 1;
  return res.send({ status: 200, moderator: checkMod });
});

app.post("/room_status", (req, res) => {
  requestsStats("room_status");
  const data = JSON.parse(req.body.json_string);
  if (!server.room[`${data.room.toLowerCase()}`])
    return res.send({ status: 400 });
  return res.send({
    status: 200,
    room: {
      queue: server.room[`${data.room.toLowerCase()}`].songs.array,
      playing: {
        id: server.room[`${data.room.toLowerCase()}`].playing.id,
        time: server.room[`${data.room.toLowerCase()}`].playing.time,
        duration: server.room[`${data.room.toLowerCase()}`].playing.duration,
      },
    },
  });
});

app.post("/create_room", (req, res) => {
  requestsStats("create_room");
  const data = JSON.parse(req.body.json_string);
  if (server.room[`${data.room.toLowerCase()}`])
    return res.send({ status: 400, message: "Esse nome já está em uso." });
  if ((null, undefined, "", " ").includes(`${data.room.toLowerCase()}`))
    return res.send({ status: 400, message: "Nome inválido." });
  if (data.room.length < 5)
    return res.send({
      status: 400,
      message: "O nome necessita possuir mais do que 5 caracteres.",
    });

  server.room[`${data.room}`] = {
    sync: false,
    songs: {
      array: [],
      object: {},
    },
    playing: {
      id: "kvO_nHnvPtQ",
      time: 0,
      duration: 0,
    },
    moderators: Number(data.browser_id),
  };

  return res.send({ status: 200 });
});

app.get("/", (req, res) => {
  requestsStats("server_stats");
  return res.send(`<b>Total de REQUESTs por Hora:</b> ${server_stats.requests.total_per_hour}<br><br><b>REQUESTs por Categoria</b><br><b>add_music:</b> ${server_stats.requests.add_music}<br><b>remove_music:</b> ${server_stats.requests.remove_music}<br><b>join_room:</b> ${server_stats.requests.join_room}<br><b>room_status:</b> ${server_stats.requests.room_status}<br><b>create_room:</b> ${server_stats.requests.create_room}<br><b>server_stats:</b> ${server_stats.requests.server_stats}`);
});

app.listen(3000, function (err) {
  console.log("Server started with sucessfully");
});
