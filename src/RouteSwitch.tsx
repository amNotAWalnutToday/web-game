import { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';

export default function RouteSwitch() {
    return (
        <Router>
            <Routes>
                <Route
                    path='/'
                    element={
                        <Homepage
                    
                        />
                    }
                />
            </Routes>
        </Router>
    )
}