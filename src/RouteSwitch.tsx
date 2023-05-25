import { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/Homepage';
import AreaView from './pages/AreaView';

type UserSchema = {
    uid: string,
    units: any[],
}

interface UserContextInterface {
    user: UserSchema,
    setUser: React.Dispatch<React.SetStateAction<UserSchema>>,
}

const testUser = {
    uid: 'testme',
    units: [
        {
            owner: '',
            race: 'slime',
            location: [2, 2],
            hasArrived: true,
            spd: 3,
            memberNum: 1,
        }
    ]
}

export const UserContext = createContext({} as UserContextInterface);

export default function RouteSwitch() {
    const [user, setUser] = useState<UserSchema>({...testUser});

    return (
        <Router>
            <UserContext.Provider value={{user, setUser}}>
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
            </UserContext.Provider>
        </Router>
    )
}