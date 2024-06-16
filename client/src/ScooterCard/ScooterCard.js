import './ScooterCard.css'

function ScooterCard({ scooter }) {
    return (
        <div className="scooter-card">
            <img src={scooter.image_url} alt={scooter.name} />
            <h2>{scooter.name}</h2>
            <p>{scooter.description}</p>
            <p>€{scooter.price}</p>
        </div>
    );
}

export default ScooterCard;