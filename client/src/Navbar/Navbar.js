import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import { useState } from 'react';
// import { useCookies } from 'react-cookie';
import './Navbar.css';
import '../App.css';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); 
    useEffect(() => {
        async function getLoggedIn() {
            fetch("http://localhost:5001/api/user", {
                method: 'GET',
                credentials: 'include',
            })
            .then((response) => response.json())
            .then((data) => {
                // console.log(data);
                setIsLoggedIn(data.id !== undefined);
            });
        }
        getLoggedIn();
    }, []);
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-title">eCommerce Motorini</Link>
            </div>
            { isLoggedIn ?
                <div className="navbar-right">
                    <Link to="/search" className="link">Search</Link>
                    <Link to="/sell" className="link">Sell</Link>
                    <Link to="/wishlist" className="link">Wishlist</Link>
                    <Link to="/messages" className="link">Messages</Link>
                    <Link to="/profile" className="link">Profile</Link>
                    <button onClick={logout} className="button">Log out</button>
                </div>
                :
                <div className="navbar-right">
                    <Link to="/search" className="link">Search</Link>
                    <button onClick={login} className="button">Log in / Sign up</button>
                </div>
            }
        </nav>
    );
}

export default Navbar;
export { getIsLoggedIn }

function login() {
    window.location.href = '/login';
}

async function logout() {
    console.log(document.cookie);
    const logout = await fetch("http://localhost:5001/api/logout", {
        method: 'POST',
        credentials: 'include',
    })
    console.log(logout);
    window.location.href = '/';
}

async function getIsLoggedIn() {
    fetch("http://localhost:5001/api/user", {
        method: 'GET',
        credentials: 'include',
    })
    .then((response) => response.json())
    .then((data) => {
        return data.id !== undefined;
    });
}