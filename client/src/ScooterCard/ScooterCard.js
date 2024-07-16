import './ScooterCard.css'
import '../App.css'
import WishlistButton from '../WishlistButton/WishlistButton.js';
import BuyButton from '../BuyButton/BuyButton.js';
import React from 'react';

function ScooterCard({ scooter }) {
    const [wishlisted, setWishlisted] = React.useState(scooter.wishlisted);

    return (
        <div className="scooter-card">
            <a href={`/scooter/${scooter.id}`} className="scooter-link">
                <img src={scooter.preview} alt={scooter.name} />
                <div className="scooter-details">
                    <div><h2>{scooter.name}</h2></div>
                    <div><p>€{scooter.price}</p></div>
                </div>
            </a>
            <div className="scooter-secondary">
                <div className="scooter-owner">
                    <img src={scooter.profilePic} alt={scooter.owner_name} className='profile-pic' />
                    <div><p>{scooter.owner_name}</p></div>
                </div>
                <div className="scooter-buttons">
                    { wishlisted !== undefined && 
                        WishlistButton({ wishlisted: wishlisted, clickFunction: async () => {
                            await fetch("http://localhost:5001/api/wishlist", {
                                method: wishlisted ? 'DELETE' : 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ scooterId: scooter.id }),
                            })
                            .then((data) => {
                                console.log(data);
                                setWishlisted(!wishlisted);
                            });
                        }})
                    }

                    <BuyButton clickFunction={async () => {
                        await fetch("http://localhost:5001/api/messages", {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ scooter: scooter }),
                        })
                        .then((data) => {
                            console.log(data);
                        });
                    }} />
                </div>
            </div>
        </div>
    );
}

export default ScooterCard;