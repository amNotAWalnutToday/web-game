import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AreaView from './pages/AreaView';

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
                <Route
                    path='/local-area'
                    element={
                        <AreaView 
                        
                        />
                    }
                />
            </Routes>
        </Router>
    )
}