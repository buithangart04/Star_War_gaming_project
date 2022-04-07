const SCREEN_WIDTH = 1500;
const SCREEN_HEIGHT = 1000;
const ROOM_WIDTH = 6000;
const ROOM_HEIGHT = 5000;
const FRAME_RATE = 50;
const CHARACTER_WEAPON_ANGLE = 45;
const ATTACK_SPEED = Math.PI/9; // cung quay dc trong 1 frame rate danh
const RANK = [
  {
    level: 0,
    vel: 5,
    exp: 25,
    width: 150,
    height: 150,
    weapon_w: 30,
    weapon_h: 130,
  },
  {
    level: 1,
    vel: 4,
    exp: 50,
    width: 250,
    height: 250,
    weapon_w: 50,
    weapon_h: 250,
  },
  {
    level: 2,
    vel: 3,
    exp: 100,
    width: 400,
    height: 400,
    weapon_w: 80,
    weapon_h: 400,
  },
];
module.exports = {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  ROOM_WIDTH,
  ROOM_HEIGHT,
  RANK,
  FRAME_RATE,
  CHARACTER_WEAPON_ANGLE,
  ATTACK_SPEED,
};
