function getBrowserID() {
  let browser_user_id = Math.floor(Math.random() * 9999999999999999);
  if (localStorage.getItem("browser_id")) {
    browser_user_id = localStorage.getItem("browser_id");
  } else {
    localStorage.setItem("browser_id", browser_user_id);
  }

  return browser_user_id;
}

let data = {
  browser_id: getBrowserID(),
  room: {
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
  },
};

function setCurrentlySong(type, currently) {
  if (type === "on") {
    if (currently !== "kvO_nHnvPtQ") {
      document.getElementById("player").style.visibility = "visible";
      document.getElementById("emptyPlayer").style.visibility = "hidden";
    }
  }

  if (type === "off") {
    document.getElementById("player").style.visibility = "hidden";
    document.getElementById("emptyPlayer").style.visibility = "visible";
  }
}

function updateQueueList() {
  setInterval(function () {
    let sendTo = document.getElementById("roomCreateID").value;
    if (document.getElementById("roomCreateID").value === "")
      sendTo = document.getElementById("roomId").value;

    $.post("https://server-lovellyrosie-party.glitch.me/room_status", {
      json_string: JSON.stringify({
        room: sendTo,
      }),
    }).always(function (output) {
      if (output.room.queue !== undefined) {
        let loopV = 0;
        function loop() {
          if (loopV !== 5) {
            var newfr = document.getElementById(`_${loopV}`);
            if (output.room.queue[loopV] !== undefined) {
              if ((newfr.src).replace("https://www.youtube.com/embed/", "") !== output.room.queue[loopV]) {
                newfr.setAttribute(
                  "src",
                  `https://www.youtube.com/embed/${output.room.queue[loopV]}`
                );
              }
            } else {
              newfr.setAttribute("src", ``);
            }
            loopV = loopV + 1;
            loop();
          }
        }
        loop();
      }
    });
  }, 5000);
}

function removeMusic() {
  const regex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  if (regex.test(document.getElementById("link_musica").value)) {
    let sendTo = document.getElementById("roomCreateID").value;
    if (document.getElementById("roomCreateID").value === "")
      sendTo = document.getElementById("roomId").value;

    $.post("https://server-lovellyrosie-party.glitch.me/remove_music", {
      json_string: JSON.stringify({
        room: sendTo,
        music_url: document.getElementById("link_musica").value,
        browser_id: data.browser_id,
      }),
    }).always(function (output) {
      document.getElementById("message_insideRoom").innerText = output.message;
      document.getElementById("message_insideRoom").style.color = output.color;
      setTimeout(() => {
        document.getElementById("message_insideRoom").innerText = null;
      }, 2500);
    });
  } else {
    document.getElementById("message_insideRoom").innerText = "Link inválido.";
    document.getElementById("message_insideRoom").style.color = "red";
    setTimeout(() => {
      document.getElementById("message_insideRoom").innerText = null;
    }, 2500);
  }
}

function addMusic() {
  const regex =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  if (regex.test(document.getElementById("link_musica").value)) {
    let sendTo = document.getElementById("roomCreateID").value;
    if (document.getElementById("roomCreateID").value === "")
      sendTo = document.getElementById("roomId").value;

    $.post("https://server-lovellyrosie-party.glitch.me/add_music", {
      json_string: JSON.stringify({
        room: sendTo,
        music_url: document.getElementById("link_musica").value,
      }),
    }).always(function (output) {
      document.getElementById("message_insideRoom").innerText = output.message;
      document.getElementById("message_insideRoom").style.color = output.color;
      setTimeout(() => {
        document.getElementById("message_insideRoom").innerText = null;
      }, 2500);
    });
  } else {
    document.getElementById("message_insideRoom").innerText = "Link inválido.";
    document.getElementById("message_insideRoom").style.color = "red";
    setTimeout(() => {
      document.getElementById("message_insideRoom").innerText = null;
    }, 2500);
  }
}

function joinRoom() {
  let sendTo = document.getElementById("roomCreateID").value;
  if (document.getElementById("roomCreateID").value === "")
    sendTo = document.getElementById("roomId").value;

  $.post("https://server-lovellyrosie-party.glitch.me/join_room", {
    json_string: JSON.stringify({
      room: sendTo,
      browser_id: data.browser_id,
    }),
  }).always(function (output) {
    if (output.status === 200) {
      if (output.moderator === 1)
        document.getElementById("removeMusicButton").style.visibility =
          "visible";
      document.getElementById("leave_room").style.display = "block";
      document.getElementById("sync_button").style.display = "block";
      document.getElementById("setRoom").style.display = "none";
      document.getElementById("insideRoom").style.display = "block";
      updateQueueList();
    } else {
      document.getElementById("mensagem_setRoom").innerText = output.message;
    }
  });
}

function roomCreate() {
  $.post("https://server-lovellyrosie-party.glitch.me/create_room", {
    json_string: JSON.stringify({
      room: document.getElementById("roomCreateID").value,
      browser_id: data.browser_id,
    }),
  }).always(function (output) {
    if (output.status === 200) {
      setTimeout(() => {
        joinRoom();
      }, 1000);
    } else {
      document.getElementById("mensagem_setRoom").innerText = output.message;
    }
  });
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "260",
    width: "600",
    events: {
      onReady: function () {
        document
          .getElementById("leave_room")
          .addEventListener("click", function () {
            location.reload();
          });

        document
          .getElementById("sync_button")
          .addEventListener("click", function () {
            let sendTo = document.getElementById("roomCreateID").value;
            if (document.getElementById("roomCreateID").value === "")
              sendTo = document.getElementById("roomId").value;
            $.post("https://server-lovellyrosie-party.glitch.me/room_status", {
              json_string: JSON.stringify({
                room: sendTo,
              }),
            }).always(function (output) {
              player.playVideo();
              player.seekTo(Number(output.room.playing.duration) - 1);
            });
          });

        function startPlayer() {
          player.loadVideoById({
            videoId: "kvO_nHnvPtQ",
            startSeconds: 0,
          });
        }

        document
          .getElementById("playerStart")
          .addEventListener("click", function () {
            startPlayer();
          });

        document
          .getElementById("roomCreateButton")
          .addEventListener("click", function () {
            startPlayer();
          });
      },
      onStateChange: function (event) {
        if (event.data === 0) {
          let sendTo = document.getElementById("roomCreateID").value;
          if (document.getElementById("roomCreateID").value === "")
            sendTo = document.getElementById("roomId").value;
          setCurrentlySong("off");

          vLoop = 4;
          function loop() {
            if (vLoop !== -1) {
              document.getElementById(`_${vLoop}`).setAttribute("src", "");
              vLoop = vLoop - 1;
              loop();
            }
          }
          loop();

          $.post("https://server-lovellyrosie-party.glitch.me/room_status", {
            json_string: JSON.stringify({
              room: sendTo,
            }),
          }).always(function (output) {
            setCurrentlySong("on", output.room.playing.id);
            player.loadVideoById({
              videoId: output.room.playing.id,
              startSeconds: output.room.playing.time,
            });
          });
        }
      },
    },
  });
}
