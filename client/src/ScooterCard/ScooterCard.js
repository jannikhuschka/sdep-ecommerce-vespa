import './ScooterCard.css'
import '../App.css'
import WishlistButton from '../WishlistButton/WishlistButton.js';
import React from 'react';

function ScooterCard({ scooter }) {
    const [wishlisted, setWishlisted] = React.useState(scooter.wishlisted);

    return (
        <div className="scooter-card">
            <img src={scooter.preview} alt={scooter.name} />
            <div className="scooter-details">
                <div><h2>{scooter.name}</h2></div>
                <div><p>€{scooter.price}</p></div>
            </div>
            {/* <p>{scooter.description}</p> */}
            <div className="scooter-secondary">
                <div className="scooter-owner">
                    <img src={scooter.profilePic} alt={scooter.owner_name} className='profile-pic' />
                    <div><p>{scooter.owner_name}</p></div>
                </div>
                <div className="scooter-buttons">
                    { wishlisted !== undefined && 
                        // <div><p>{scooter.wishlisted ? '-' : '+'}</p></div>
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
                </div>
            </div>
        </div>
    );
}

export default ScooterCard;