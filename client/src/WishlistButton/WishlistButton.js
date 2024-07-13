import './WishlistButton.css';
import '../App.css';
import React from 'react';
import { Link } from 'react-router-dom';

function WishlistButton({ wishlisted, clickFunction }) {
    return (
        <Link to="#" onClick={clickFunction} className="wishlist-button">
            <img className='wishlist' src={wishlisted ? 'http://localhost:5001/images/icons/wishlist-remove.png' : 'http://localhost:5001/images/icons/wishlist-add.png'} alt="Wishlist" />
        </Link>
    );
}

export default WishlistButton;


function test() {
    console.log("B");
}