import React from 'react';
import axios from 'axios';
import '../App.css';
import './SellPage.css';
import InputField from '../InputField/InputField';

function SellPage() {
    return (
        <div class="container">
            <h1>Sell scooters</h1>
            <InputField id="name" name="Name" />
            <InputField id="description" name="Detailed Description" />
            <InputField id="year" name="Year" type="number" />
            <InputField id="model" name="Exact Model" />
            <InputField id="power" name="Power (cc)" type="number" />
            <InputField id="price" name="Price (€)" type="number" />
            <button onClick={sell} className="button">Upload Offer</button>
        </div>
    );
}

export default SellPage;

function sell() {
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const year = document.getElementById('year').value;
    const model = document.getElementById('model').value;
    const power = document.getElementById('power').value;
    const price = document.getElementById('price').value;
    console.log("Selling scooter");
    // DB Access to add scooter
    const addScooter = async () => {
        try {
            const axiosInstance = axios.create({
                baseURL: 'http://localhost:5001',
            });
            const response = axiosInstance.post('/api/products', { name, description, year, model, power, price });
            console.log(response);
        } catch (error) {
            console.error('Error adding scooter:', error);
        }
    }
    addScooter();
}