import Phaser from 'phaser';

const dpr = window.devicePixelRatio;
const height = window.innerHeight * dpr;
const width = window.innerWidth * dpr;

function getScreen() {
    return { width, height };
}

getScreen();

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#333',
    mode: Phaser.Scale.NONE,
    width: getScreen().width,
    height: getScreen().height,
    antialias: true,
    physics: {
        default: 'arcade',
        arcade: {
            fps: 144,
            gravity: { y: 0 },
            debug: false,
        }
    },
    zoom: 1,
    scale: {
        mode: Phaser.Scale.NONE,
        width,
        height,
    },
};

export default config;
