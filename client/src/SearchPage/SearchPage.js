import React, { useState, useEffect, createElement } from 'react';
import axios from 'axios';
import './SearchPage.css';
import '../App.css';
import InputField from '../InputField/InputField';
import ScooterCard from '../ScooterCard/ScooterCard.js';
import ValueRangeSlider from '../RangeSlider/RangeSlider.js';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

function SearchPage() {
    const [scooters, setScooters] = useState([]);
    var [priceRange, setPriceRange] = useState([0, 1000]);

    function updatePriceRange(range) {
        console.log('Range:', range);
        // setPriceRange(range);
    }

    useEffect(() => {
        const fetchScooters = async () => {
            try {
                const axiosInstance = axios.create({
                    baseURL: 'http://localhost:5001',
                });
                const response = await axiosInstance.get('/api/products');
                console.log(response.data);
                setScooters(response.data);
            } catch (error) {
                console.error('Error fetching scooters:', error);
            }
        };

        fetchScooters();
    }, []);

    function search() {
        const axiosInstance = axios.create({
            baseURL: 'http://localhost:5001',
        });
        const search = document.getElementById('search').value;
        axiosInstance.get('/api/products', {
            params: {
                search: search,
                priceRange: priceRange,
            },
        }).then(response => {
            setScooters(response.data);
        }).catch(error => {
            console.error('Error searching scooters:', error);
        });
    }

    return (
        <div>
            <h1>Search Scooters</h1>
            <div className="search-container">
                <div className="search-sidebar">
                    <InputField id="search" name="Search" placeholder="" />
                    <div className="scooter-filter price-range">
                        <p>Price Range: {priceRange[0]}€ to {priceRange[1]}€</p>
                        <RangeSlider min={0} max={5000} value={priceRange} onInput={setPriceRange} />
                    </div>
                    <button onClick={search} className="button">Search & Apply Filters</button>
                </div>
                <div id="scooters" className="scooters">
                    {scooters.map(scooter => (
                        <ScooterCard scooter={scooter} />
                        // <div key={scooter.id} className="scooter-card">
                        //     <img src={scooter.image_url} alt={scooter.name} />
                        //     <h2>{scooter.name}</h2>
                        //     <p>{scooter.description}</p>
                        //     <p>€{scooter.price}</p>
                        // </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
