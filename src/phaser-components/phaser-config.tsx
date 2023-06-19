import Phaser from 'phaser';

export const height = 480;
export const width = 600;

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#333',
    width: 600,
    height: 480,
    antialias: true,
    physics: {
        default: 'arcade',
        arcade: {
            fps: 144,
            gravity: { y: 0 },
            debug: false,
        }
    },
};

export default config;
