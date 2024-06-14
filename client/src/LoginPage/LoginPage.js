import React from 'react';
// import { Link } from 'react-router-dom';
import '../App.css';
import './LoginPage.css';
import InputField from '../InputField/InputField';
import { Link } from 'react-router-dom';

function LoginPage() {
    return (
        <div class="container">
            <h1>Log in / Sign up</h1>
            <div class="login-signup">
                <div class="login">
                    <h2>Log in</h2>
                    <InputField id="login-email" name="Email" />
                    <InputField id="login-password" name="Password" />
                    <Link to="/login" className="button">Log in</Link>
                </div>
                <div class="signup">
                    <h2>Sign up</h2>
                    <InputField id="signup-name" name="Name" />
                    <InputField id="signup-email" name="Email" />
                    <InputField id="signup-password" name="Password" />
                    <Link to="/login" className="button">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
