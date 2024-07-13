import React from 'react';
import axios from 'axios';
import '../App.css';
import './SellPage.css';
import InputField from '../InputField/InputField';

function SellPage() {
    const [images, setImages] = React.useState([]);

    const handlePhotosChange = (e) => {
        if (e.target.files.length) {
          var array = [];
          for (let i = 0; i < e.target.files.length; i++) {
            array.push({
              preview: URL.createObjectURL(e.target.files[i]),
              raw: e.target.files[i],
            });
          }
          setImages(array);
        }
    };

    return (
        <div className="container">
            <h1>Sell scooters</h1>

            <input name="image" type="file" multiple={true} id="upload-button" className='button' style={{ display: 'none' }} onChange={handlePhotosChange} />
            <label htmlFor="upload-button">
                {images.length ? (
                    images.map ((image, index) => (
                        <img
                        key={index}
                        src={image.preview}
                        alt="dummy"
                        width="300"
                        height="300"
                        className="my-10 mx-5"
                        />
                    ))
                ) : (
                    <>
                    <p className="text-white text-1xl text-left w-full text-left button">
                        Upload Images
                    </p>
                    </>
                )}
            </label>

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
    const images = document.getElementById('upload-button').files;
    console.log(images);
    if (!name || !description || !year || !model || !power || !price || images.length == 0) {
        var alert = 'Please fill in all fields.\nThe following inputs are missing:\n';
        if (images.length == 0) alert += 'At least one image, ';
        if (!name) alert += 'Name, ';
        if (!description) alert += 'Description, ';
        if (!year) alert += 'Year, ';
        if (!model) alert += 'Model, ';
        if (!power) alert += 'Power, ';
        if (!price) alert += 'Price, ';
        alert = alert.slice(0, -2) + '.';
        window.alert(alert);
        return;
    }
    console.log("Selling scooter");
    // DB Access to add scooter
    const addScooter = async () => {
        try {
            const axiosInstance = axios.create({
                baseURL: 'http://localhost:5001',
                withCredentials: true,
            });
            const id = await axiosInstance.post('/api/products', { name, description, year, model, power, price })
              .then((res) => {
                console.log(res.data);
                return res.data.id;
              });

            var formData = new FormData();
            for (let i = 0; i < images.length; i++) {
                formData.append('scooter-pictures', images[i]);
            }

            await axiosInstance
              .post(`/api/products/${id}/images`, formData , {
                headers: {
                  'enctype': 'multipart/form-data',
                },
              })
              .then((res) => {
                console.log(res.data);
                window.document.location.href = '/search';
              });
        } catch (error) {
            console.error('Error adding scooter:', error);
        }
    }
    addScooter();
}