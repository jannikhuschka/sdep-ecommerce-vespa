import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './HomePage.css';
import { existsCookie } from '../Navbar/Navbar';
import { getIsLoggedIn } from '../Navbar/Navbar';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const updateLoggedIn = async() => {
        const loggedIn = await getIsLoggedIn();
        setIsLoggedIn(loggedIn);
    }
    updateLoggedIn();

    return (
        <div className="container">
            <h1>eCommerce Motorini</h1>
            <div className="centered">
                <p>Find the perfect scooter for you, today</p>
            </div>
            <Link to="/search" className="button">Start searching</Link>

            <img src="https://m.media-amazon.com/images/I/61Dvr5NyixL._AC_UF1000,1000_QL80_.jpg" />

            <div className="centered">
                <p>Sell the perfect scooter for others, tomorrow</p>
            </div>
            <Link to={isLoggedIn ? "/sell" : "/login"} className="button">Start selling</Link>
        </div>
    );
}

export default HomePage;
