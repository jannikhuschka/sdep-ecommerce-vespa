import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import '../App.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-title">eCommerce Motorini</Link>
            </div>
            <div className="navbar-right">
                <Link to="/search" className="link">Search</Link>
                <Link to="/sell" className="link">Sell</Link>
                <Link to="/profile" className="link">Profile</Link>
                <Link to="/login" className="button">Log in / Sign up</Link>
            </div>
        </nav>
    );
}

export default Navbar;
