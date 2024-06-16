import React, { useState, useEffect, createElement } from 'react';
import axios from 'axios';
import './SearchPage.css';
import '../App.css';
import InputField from '../InputField/InputField';
import ScooterCard from '../ScooterCard/ScooterCard.js';
import ValueRangeSlider from '../RangeSlider/ValueRangeSlider.js';
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';

function SearchPage() {
    const [scooters, setScooters] = useState([]);
    var [globalPriceRange, setGlobalPriceRange] = useState([0, 50000]);
    var [priceRange, setPriceRange] = useState([0, 50000]);
    var [globalYearRange, setGlobalYearRange] = useState([1900, 2024]);
    var [yearRange, setYearRange] = useState([1900, 2024]);
    var [globalPowerRange, setGlobalPowerRange] = useState([0, 1000]);
    var [powerRange, setPowerRange] = useState([0, 1000]);

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
                setScooters(response.data);
            } catch (error) {
                console.error('Error fetching scooters:', error);
            }
        };

        const fetchExtremeValues = async ({attribute}) => {
            try {
                const axiosInstance = axios.create({
                    baseURL: 'http://localhost:5001',
                });
                const response = await axiosInstance.get('/api/products/extremeValues', {
                    params: { attribute: attribute },
                });
                console.log('Extreme Values for ' + attribute + ': ', response.data);
                return response.data;
            } catch (error) {
                console.error('Error fetching extreme value:', error);
            }
        }

        fetchScooters();
        fetchExtremeValues({attribute: 'price'}).then(value => {setGlobalPriceRange(value); return value}).then(value => {setPriceRange(value)});
        fetchExtremeValues({attribute: 'year'}).then(value => {setGlobalYearRange(value); return value}).then(value => {setYearRange(value)});
        fetchExtremeValues({attribute: 'power'}).then(value => {setGlobalPowerRange(value); return value}).then(value => {setPowerRange(value)});
    }, []);

    function search() {
        const axiosInstance = axios.create({
            baseURL: 'http://localhost:5001',
        });
        const search = document.getElementById('search').value;
        axiosInstance.get('/api/products/filtered', {
            params: {
                search: search,
                priceRange: priceRange,
                yearRange: yearRange,
                powerRange: powerRange,
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
                    {/* <div className="scooter-filter">
                        <p>Price Range: {priceRange[0]}€ to {priceRange[1]}€</p>
                        <RangeSlider min={globalPriceRange[0]} max={globalPriceRange[1]} value={priceRange} onInput={setPriceRange} />
                    </div>
                    <div className="scooter-filter">
                        <p>Year: {yearRange[0]} to {yearRange[1]}</p>
                        <RangeSlider min={globalYearRange[0]} max={globalYearRange[1]} value={yearRange} onInput={setYearRange} />
                    </div>
                    <div className="scooter-filter">
                        <p>Power: {powerRange[0]}cc to {powerRange[1]}cc</p>
                        <RangeSlider min={globalPowerRange[0]} max={globalPowerRange[1]} value={powerRange} onInput={setPowerRange} />
                    </div> */}
                    <ValueRangeSlider array={priceRange} setArrayFunction={setPriceRange} globalArray={globalPriceRange} name="Price" unit='€' />
                    <ValueRangeSlider array={yearRange} setArrayFunction={setYearRange} globalArray={globalYearRange} name="Year" />
                    <ValueRangeSlider array={powerRange} setArrayFunction={setPowerRange} globalArray={globalPowerRange} name="Power" unit='cc' />
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
