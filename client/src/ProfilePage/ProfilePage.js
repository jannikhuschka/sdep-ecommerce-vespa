import React from 'react';
// import { Link } from 'react-router-dom';
import '../App.css';
import './ProfilePage.css';
import axios from 'axios';

function ProfilePage() {
    const [image, setImage] = React.useState({preview: '', raw: ''});

    const handlePhotoChange = (e) => {
        if (e.target.files.length) {
          setImage({
            preview: URL.createObjectURL(e.target.files[0]),
            raw: e.target.files[0],
          });
        }
    };

    const submit = async () => {
        let formData = new FormData();
            await formData.append('profile-pic', image.raw);
            // fetch('http://localhost:5001/api/profile-picture', {
            //     method: 'POST',
            //     body: formData,
            // });
            const axiosInstance = axios.create({
                baseURL: 'http://localhost:5001',
                withCredentials: true,
            });
            await axiosInstance
              .post(`/api/profile-picture`, formData , {
                headers: {
                  'enctype': 'multipart/form-data',
                },
              })
              .then((res) => {
                console.log(res.data);
              });
    }

    return (
        <div className="container">
            <h1>Profile</h1>
            <input name="image" type="file" id="upload-button" className='button' style={{ display: 'none' }} onChange={handlePhotoChange} />
            <label htmlFor="upload-button">
                {image.preview ? (
                    <img
                    src={image.preview}
                    alt="dummy"
                    width="300"
                    height="300"
                    className="my-10 mx-5"
                    />
                ) : (
                    <>
                    <p className="text-white text-1xl text-left w-full text-left button">
                        Upload Image
                    </p>
                    {/* <div className={style.wrapper} /> */}
                    </>
                )}
            </label>

            <button type="button" onClick={submit} className="button">Submit</button>
        </div>
    );
}

export default ProfilePage;
