const socket = io("http://localhost:3000", { transports: ["websocket"] });

let canvas, ctx;
let oldPlayerState = {};
let playerNumber;
let gameActive = false;
let background;
let main_idx = 1;
let listCharacterImage;

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
function newGame() {
  init();
  socket.emit("newGame");
}

function init() {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  const rect = canvas.getBoundingClientRect();
  background = initBG();
  paintBackGround();
  canvas.addEventListener("mousemove", (evt) => {
    socket.emit("mousemove", evt.clientX - rect.left, evt.clientY - rect.top);
  });
  gameActive = true;
}

function handleInit(_playerNumber) {
  playerNumber = _playerNumber;
}

function handleGameState(state) {
  if (!gameActive) {
    return;
  }
  state = JSON.parse(state);
  requestAnimationFrame(() => paintgame(state));
}
function paintgame(state) {
  let currPlayer = state.players[playerNumber];
  updateBackground(currPlayer);
  oldPlayerState = { ...currPlayer };
  state.players.forEach((player) => paintPlayer(player, currPlayer));
}

function updateBackground(currPlayer) {
  if (!oldPlayerState.x) {
    return;
  }
  const translation_x = currPlayer.x - oldPlayerState.x;
  const translation_y = currPlayer.y - oldPlayerState.y;
  background[main_idx] = {
    ...background[main_idx],
    x: background[main_idx].x - translation_x,
    y: background[main_idx].y - translation_y,
  };
  // case main back ground index vẫn nằm trong màn hình
  if (
    background[main_idx].x >= 0 &&
    background[main_idx].x <= SCREEN_WIDTH &&
    background[main_idx].y >= 0 &&
    background[main_idx].y <= SCREEN_HEIGHT
  ) {
    updateOtherBG(background[main_idx]);
  } else {
    // case thằng main bg đã out màn hình
    const getOtherBG = background.filter((e) => e.index != main_idx);
    // set lại vị trí cho thằng bg cùng hàng vs thằng main (lấy ngẫu nhiên thằng index 0 trong mảng)
    if (background[main_idx].x < 0) {
      background[getOtherBG[0].index] = {
        ...background[getOtherBG[0].index],
        x: background[main_idx].x + SCREEN_WIDTH,
        y: background[main_idx].y,
      };
    } else {
      background[getOtherBG[0].index] = {
        ...background[getOtherBG[0].index],
        x: background[main_idx].x - SCREEN_WIDTH,
        y: background[main_idx].y,
      };
    }
    // set lại vị trí cho thằng bg cùng cột vs thằng main (lấy ngẫu nhiên thằng index 1 trong mảng)
    if (background[main_idx].y < 0) {
      background[getOtherBG[1].index] = {
        ...background[getOtherBG[1].index],
        x: background[main_idx].x,
        y: background[main_idx].y + SCREEN_HEIGHT,
      };
    } else {
      background[getOtherBG[1].index] = {
        ...background[getOtherBG[1].index],
        x: background[main_idx].x,
        y: background[main_idx].y - SCREEN_HEIGHT,
      };
    }

    if (background[getOtherBG[1].index].x < 0) {
      background[getOtherBG[2].index] = {
        ...background[getOtherBG[2].index],
        x: background[getOtherBG[1].index].x + SCREEN_WIDTH,
        y: background[getOtherBG[1].index].y,
      };
    } else {
      background[getOtherBG[2].index] = {
        ...background[getOtherBG[2].index],
        x: background[getOtherBG[1].index].x - SCREEN_WIDTH,
        y: background[getOtherBG[1].index].y,
      };
    }
    updateOtherBG(foundMainBg());
  }
}
function foundMainBg() {
  background.forEach((e) => {
    if (e.x >= 0 && e.x <= SCREEN_WIDTH && e.y >= 0 && e.y <= SCREEN_HEIGHT) {
      main_idx = e.index;
      return e;
    }
  });
}

function updateOtherBG(main_bg) {
  const renderBg = background.filter((e) => e.index !== main_bg.index);
  background[renderBg[0].index] = {
    ...background[renderBg[0].index],
    x: main_bg.x - SCREEN_WIDTH,
    y: main_bg.y,
  };
  background[renderBg[1].index] = {
    ...background[renderBg[1].index],
    x: main_bg.x,
    y: main_bg.y - SCREEN_HEIGHT,
  };
  background[renderBg[2].index] = {
    ...background[renderBg[2].index],
    x: main_bg.x - SCREEN_WIDTH,
    y: main_bg.y - SCREEN_HEIGHT,
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackGround();
}

async function paintPlayer(player, currPlayer) {
  console.log(currPlayer.x, currPlayer.y);
  const prefix = getPrefixByLevel(player.rank.level);
  await drawImageRotate(ctx, {
    x: player.x - currPlayer.x + SCREEN_WIDTH / 2,
    y: player.y - currPlayer.y + SCREEN_HEIGHT / 2,
    width: player.rank.width,
    height: player.rank.height,
    weapon: {
      ... getWeaponPos(player,currPlayer),
      width: player.rank.weapon_w,
      height: player.rank.weapon_h,
    },
    angle: player.angle,
    prefix,
  });
}

function initBG() {
  return [
    {
      index: 0,
      img: "background_img1",
      x: -SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
    },
    {
      index: 1,
      img: "background_img2",
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT / 2,
    },
    {
      index: 2,
      img: "background_img3",
      x: -SCREEN_WIDTH / 2,
      y: -SCREEN_HEIGHT / 2,
    },
    {
      index: 3,
      img: "background_img4",
      x: SCREEN_WIDTH / 2,
      y: -SCREEN_HEIGHT / 2,
    },
  ];
}
function paintBackGround() {
  background.forEach((e) => {
    drawImage(ctx, e.img, {
      x: e.x,
      y: e.y,
      width: canvas.width,
      height: canvas.height,
    });
  });
}

// must call when click play
newGame();
