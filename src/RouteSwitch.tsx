import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';

export default function RouteSwitch() {
    return (
        <Router basename='web-game'>
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