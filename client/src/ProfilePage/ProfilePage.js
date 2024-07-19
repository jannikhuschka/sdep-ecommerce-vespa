import React, { useEffect } from 'react';
// import { Link } from 'react-router-dom';
import '../App.css';
import './ProfilePage.css';
import InputField from '../InputField/InputField';
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

    const getUserData = async () => {
        const axiosInstance = axios.create({
            baseURL: 'http://localhost:5001',
            withCredentials: true,
        });
        const userData = (await axiosInstance.get(`/api/user`, { withCredentials: true })).data;
        console.log(userData);
        document.getElementById('name').value = userData.name;
        document.getElementById('email').value = userData.email;
        setImage({preview: `http://localhost:5001/images/profile/${userData.id}.png`, raw: ''});
    }

    const submit = async () => {
        let formData = new FormData();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        await formData.append('name', name);
        await formData.append('email', email);
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
          }, { withCredentials: true })
          .then((res) => {
            console.log(res.data);
            document.location.reload();
          });
    }

    useEffect(() => {
      getUserData();
    }, []);

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

            <InputField id="name" name="Name" />
            <InputField id="email" name="Email" />

            <button type="button" onClick={submit} className="button">Submit</button>
        </div>
    );
}

export default ProfilePage;
