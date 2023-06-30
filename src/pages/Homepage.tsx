import { useState, useEffect, useRef } from "react";
import Phaser from "phaser";
import config from "../phaser-components/phaser-config";
import Loading from "../phaser-components/scenes/loading";
import data from '../../data.json';

function addGame() {
    const gamescreen = new Phaser.Game(config);
    gamescreen.scene.add('loading', Loading, true, { x: 400, y: 300 });
}


export default function Homepage() {
    const [showGame, setShowGame] = useState(false);
    useEffect(() => {
        if(showGame) addGame();
    }, [showGame]);
    useEffect(() => {
        if(window.location.href === data.location) setShowGame(true);
    }, []);
    const usernameref = useRef<HTMLInputElement>(null);
    const passwordref = useRef<HTMLInputElement>(null);

    const checkPass = (username: string, password: string) => {
        if(showGame) return;
        let isUser = false;
        for(const user of data.users) {
            if(user.username.toLowerCase() === username
            && user.password.toLowerCase() === password) isUser = true;
        }
        if(isUser) {
            setShowGame(true);
        } else {
            setShowGame(false);
        }
    }

    const clickHandle = () => {
        if(!usernameref && !passwordref) return;
        if(usernameref.current && passwordref.current) {
            checkPass(
                usernameref.current.value.toLowerCase(), 
                passwordref.current.value.toLowerCase()
            );
        }
    }

    return(
        <>
            <main className="page" >
                {!showGame
                && 
                <form method='GET'  className="flex-col" onKeyDown={(e) => {
                    if(e.key === 'Enter') clickHandle();
                }}>
                    <legend>Login</legend>
                    <div>
                        <label htmlFor="username">Username</label>
                        <input
                            ref={usernameref}
                            id="username"
                            type="text"
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            ref={passwordref}
                            id="password"
                            type="password"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={clickHandle}
                    >
                        Login
                    </button>
                </form>
                }
            </main>
        </>
    )
}