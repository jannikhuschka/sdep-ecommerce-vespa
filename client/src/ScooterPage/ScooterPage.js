import './ScooterPage.css';
import '../App.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

function ScooterPage() {
    const { id } = useParams();
    const [scooter, setScooter] = useState({});

    useEffect(() => {
        const fetchScooter = async () => {
            try {
                const axiosInstance = axios.create({
                    baseURL: 'http://localhost:5001',
                    withCredentials: true,
                });
                // console.log('Fetching scooter with id:', id);
                const scooter = (await axiosInstance.get(`/api/scooter/${id}`)).data;
                setScooter(scooter);
            } catch (error) {
                console.error('Error fetching scooter:', error);
            }
        };

        fetchScooter();
    }, []);

    return (
        <div>
            <h1>{scooter.name}</h1>
            <div className='scooter-main'>
                {/* <img src={scooter.preview} className='scooter-preview' alt='scooter-preview' /> */}
                <Carousel infiniteLoop showStatus={false} showIndicators={false} className='carousel' >
                    {scooter.images && scooter.images.map((image, index) => (
                        <div key={index}>
                            <img src={image} alt='scooter' />
                        </div>
                    ))}
                </Carousel>
                <div className='scooter-details-all'>
                    <p>Exact model: {scooter.model}</p>
                    <p>Detailed description: {scooter.description}</p>
                    <p>Price: {scooter.price}€</p>
                    <p>Year: {scooter.year}</p>
                    <p>Power: {scooter.power} cc</p>
                    <p>Owner: {scooter.owner_name}</p>
                </div>
            </div>
        </div>
    );
}

export default ScooterPage;