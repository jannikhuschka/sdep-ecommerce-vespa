import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import './HomePage.css';

function HomePage() {
    return (
        <div class="container">
            <h1>eCommerce Motorini</h1>
            <div class="centered">
                <p>Find the perfect scooter for you, today</p>
            </div>
            <Link to="/search" className="button">Start searching</Link>

            <img src="https://m.media-amazon.com/images/I/61Dvr5NyixL._AC_UF1000,1000_QL80_.jpg" />

            <h1>The biggest scooter marketplace</h1>
            <div class="centered">
                <p>Sell the perfect scooter for others, tomorrow</p>
            </div>
            <Link to="/sell" className="button">Start selling</Link>
        </div>
    );
}

export default HomePage;
