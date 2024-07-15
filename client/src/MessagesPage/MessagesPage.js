import React, { useState, useEffect } from 'react';
import './MessagesPage.css';
import '../App.css';
import axios from 'axios';
import Message from '../Message/Message';
// import ScooterCard from '../ScooterCard/ScooterCard.js';

function MessagesPage() {
    const [messagesByScooter, setMessages] = useState([]);

    const fetchMessages = async () => {
        try {
            const axiosInstance = axios.create({
                baseURL: 'http://localhost:5001',
                withCredentials: true,
            });
            var messagesByScooter = (await axiosInstance.get('/api/messages')).data;
            console.log(messagesByScooter);
            setMessages(messagesByScooter);
        } catch (error) {
            console.error('Error fetching scooters:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div>
            <h1>Messages</h1>
            <div className='messages'>
                {messagesByScooter.map(scooter => (
                    <div className='scooter' key={scooter.id}>
                        <h2>{scooter.name}</h2>
                        <div className='scooter-messages'>
                            {scooter.messages.map(message => (
                                <Message message={message} isOwnScooter={scooter.isOwnScooter} key={message.id} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MessagesPage;

