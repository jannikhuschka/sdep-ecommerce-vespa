import React from 'react';
import { Link, redirect } from 'react-router-dom';
import { useState } from 'react';
import { useCookies } from 'react-cookie';
import './Navbar.css';
import '../App.css';

function Navbar() {
    const isLoggedIn = existsCookie('authToken');
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-title">eCommerce Motorini</Link>
            </div>
            { isLoggedIn ?
                <div className="navbar-right">
                    <Link to="/search" className="link">Search</Link>
                    <Link to="/sell" className="link">Sell</Link>
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

function login() {
    window.location.href = '/login';
}

function logout() {
    console.log(document.cookie);
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
}

export function existsCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    const decoded = decodeURI(dc.substring(begin + prefix.length, end));
    return decoded != null;
} 