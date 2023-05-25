import { useState } from "react"
import { Link } from "react-router-dom"

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