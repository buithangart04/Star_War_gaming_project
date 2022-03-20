

const SCREEN_WIDTH = 1500;
const SCREEN_HEIGHT = 1000;
const  ROOM_WIDTH = 6000;
const  ROOM_HEIGHT = 5000;
const FRAME_RATE = 50;

const RANK = [
    {
        level:0,
        vel:4,
        exp:10,
        width:150,
        height: 150,
        weapon_w: 30,
        weapon_h: 130
    },
    {
        level:1,
        vel:3,
        exp:30,
        width:200,
        height: 200,
        weapon_w: 40,
        weapon_h:200
    },
    {
        level:2,
        vel:2,
        exp:100,
        width:300,
        height: 300,
        weapon_w: 50,
        weapon_h: 300
    }

];
module.exports = {SCREEN_WIDTH,SCREEN_HEIGHT,ROOM_WIDTH,ROOM_HEIGHT,RANK,FRAME_RATE}