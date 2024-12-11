let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let responce = await a.text();
  let div = document.createElement("div");
  div.innerHTML = responce;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = " ";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>
                            <img src="svg/music.svg" alt="music">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Nayan</div>
                            </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                <img src="svg/play.svg" alt="play">
                            </div></li>`;
  }
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svg/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  // Fetch all songs
  let response = await fetch(`/songs/`);
  let htmlContent = await response.text();

  // Parse the response to extract anchor tags
  let div = document.createElement("div");
  div.innerHTML = htmlContent;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  // Loop through the anchor tags
  for (let index = 0; index < array.length; index++) {
    const anchor = array[index];

    // Check if the anchor href contains "/songs"
    if (anchor.href.includes("/songs")) {
      let folder = anchor.href.split("/").slice(-2)[0];

      // Fetch info.json for the current folder
      let folderResponse = await fetch(
        `/songs/${folder}/info.json`
      );
      let folderInfo = await folderResponse.json();

      // Add a new card to the container
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <div class="icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 128 128"
                width="64"
                height="64"
                class="play-icon"
              >
                <circle cx="64" cy="64" r="64" fill="lightgreen" />
                <path d="M48 32l40 32-40 32V32z" fill="black" />
              </svg>
            </div>
          </div>
          <img src="/songs/${folder}/cover.png" alt="Album Cover" />
          <h2>${folderInfo.title}</h2>
          <p>${folderInfo.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs")
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    });
  });
}

async function main() {
  await getSongs("songs/default");
  playMusic(songs[0], true);

  displayAlbums();
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatTime(
      currentSong.currentTime
    )} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]); // Go to the last song
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]); // Go to the first song
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target, e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume >0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
    });

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("svg/volume.svg")) {
      e.target.src = e.target.src.replace("svg/volume.svg", "svg/mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("svg/mute.svg", "svg/volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
