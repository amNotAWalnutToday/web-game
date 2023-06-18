import { useState } from "react"
import { Link } from "react-router-dom"
import Phaser from "phaser";
import config from "../phaser-components/phaser-config";
import Game from "../phaser-components/game";

const gamescreen = new Phaser.Game(config);
gamescreen.scene.add('game', Game, true, { x: 400, y: 300 });

export default function Homepage() {
    return(
        <>
            <main className="page" >
                <Link to={'/local-area'}>
                    Local Map
                </Link>
            </main>
        </>
    )
}