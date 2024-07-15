import '../App.css';
import './BuyButton.css';
import React from 'react';
import { Link } from 'react-router-dom';

function BuyButton({ clickFunction }) {
    return (
        <Link to="#" onClick={clickFunction} className="buy-button">
            <img className='buy' src={'http://localhost:5001/images/icons/shopping-cart.png'} alt="Buy" />
        </Link>
    );
}

export default BuyButton;