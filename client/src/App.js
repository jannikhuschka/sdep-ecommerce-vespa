import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HomePage from './HomePage/HomePage';
import SearchPage from './SearchPage/SearchPage';
import SellPage from './SellPage/SellPage';
import ProfilePage from './ProfilePage/ProfilePage';
import LoginPage from './LoginPage/LoginPage';
import Navbar from './Navbar/Navbar';

function App() {
    return (
        <Router>
            <div>
                <Navbar />
                {/* <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/search">Search</Link>
                        </li>
                    </ul>
                </nav> */}

                <Routes>
                    <Route path="/" exact element={<HomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/sell" element={<SellPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
