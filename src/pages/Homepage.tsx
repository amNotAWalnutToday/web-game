import { useState } from "react"
import { Link } from "react-router-dom"
import Phaser from "phaser";
import config from "../phaser-components/phaser-config";
import Loading from "../phaser-components/scenes/loading";

const gamescreen = new Phaser.Game(config);
gamescreen.scene.add('loading', Loading, true, { x: 400, y: 300 });

export default function Homepage() {
    return(
        <>
            <main className="page" >
            </main>
        </>
    )
}