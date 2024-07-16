import React, { useState, useEffect } from 'react';
import './WishlistPage.css';
import '../App.css';
import axios from 'axios';
import ScooterCard from '../ScooterCard/ScooterCard.js';

function WishlistPage() {
    const [scooters, setScooters] = useState([]);

    const fetchScooters = async () => {
        try {
            const axiosInstance = axios.create({
                baseURL: 'http://localhost:5001',
                withCredentials: true,
            });
            var wishlistScooters = (await axiosInstance.get('/api/wishlist')).data;
            for (var i = 0; i < wishlistScooters.length; i++) {
                wishlistScooters[i].wishlisted = true;
            }
            // console.log(wishlistScooters);
            setScooters(wishlistScooters);
        } catch (error) {
            console.error('Error fetching scooters:', error);
        }
    };

    useEffect(() => {
        fetchScooters();
    }, []);

    return (
        <div id="wishlist">
            <h1>Wishlist</h1>
            <div id="scooters" className="scooters">
                {scooters.map(scooter => (
                    <ScooterCard scooter={scooter} key={scooter.id} />
                ))}
            </div>
        </div>
    );
}

export default WishlistPage;

