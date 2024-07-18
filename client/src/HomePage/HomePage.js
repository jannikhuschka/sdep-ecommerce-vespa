import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './HomePage.css';
import { existsCookie } from '../Navbar/Navbar';

function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        async function getLoggedIn() {
            fetch("http://localhost:5001/api/user", {
                method: 'GET',
                credentials: 'include',
            })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                // console.log(data.id !== undefined);
                setIsLoggedIn(data.id !== undefined);
            });
        }
        getLoggedIn();
    }, []);

    return (
        <div className="container">
            <h1>eCommerce Motorini</h1>
            <div className="centered">
                <p>Find the perfect scooter for you, today</p>
            </div>
            <Link to="/search" className="button">Start searching</Link>

            <img src="https://m.media-amazon.com/images/I/61Dvr5NyixL._AC_UF1000,1000_QL80_.jpg" />

            <div className="centered">
                <p>Sell your scooter and reach clients on our extensive marketplace</p>
            </div>
            <Link to={isLoggedIn ? "/sell" : "/login"} className="button">Start selling</Link>
        </div>
    );
}

export default HomePage;