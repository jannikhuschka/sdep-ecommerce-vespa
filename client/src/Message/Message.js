import './Message.css';

function Message({ message, isOwnScooter }) {
    const switchButton = (messageState, isOwnScooter) => {
        switch (messageState) {
            case 'offer':
                if (!isOwnScooter) return;
                return (
                    <div className='message-button'>
                        <button className='button' onClick={handleAccept}>Accept</button>
                        <button className='button decline-button' onClick={handleDecline}>Decline</button>
                    </div>
                );
            case 'accept-owner':
                if (isOwnScooter) return;
                return (
                    <div className='message-button'>
                        <button className='button' onClick={handleComplete}>Complete</button>
                    </div>
                );
            case 'accept-both':
                if (!isOwnScooter) return;
                return (
                    <div className='message-button'>
                        <button className='button' onClick={handleDelete}>Delete</button>
                    </div>
                );
            case 'rejected':
                if (isOwnScooter) return;
                return (
                    <div className='message-button'>
                        <button className='button' onClick={handleDelete}>Delete</button>
                    </div>
                );
            default:
                return;
        }
    }

    return (
        <div className="message">
            {/* <div className="message-title">{message.kind}</div> */}
            <div className="message-date">{getTimeFromNow(message.timestamp)}</div>
            <div className="message-text">{isOwnScooter ? message.message_seller : message.message_buyer}</div>
            {switchButton(message.state, isOwnScooter)}
        </div>
    );

    function getTimeFromNow(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diff = now - then;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days} days ago`;
        } else if (hours > 0) {
            return `${hours} hours ago`;
        } else if (minutes > 0) {
            return `${minutes} minutes ago`;
        } else {
            return `${seconds} seconds ago`;
        }
    }

    function updateMessageState(newState) {
        console.log('Update state to', newState);
        fetch(`http://localhost:5001/api/messages/${message.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ state: newState }),
        })
            // .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function handleAccept() {
        updateMessageState('accept-owner');
    }

    function handleDecline() {
        updateMessageState('rejected');
    }

    function handleComplete() {
        updateMessageState('accept-both');
    }

    function handleDelete() {
        console.log('Delete');
        fetch('http://localhost:5001/api/messages/' + message.id, {
            method: 'DELETE',
        })
            // .then(response => response.json())
            .then(response => {
                console.log('Success:', response.text());
                window.location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

export default Message;