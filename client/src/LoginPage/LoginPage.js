import React from 'react';
import '../App.css';
import './LoginPage.css';
import InputField from '../InputField/InputField';

function LoginPage() {
    return (
        <div className="container">
            <h1>Log in / Sign up</h1>
            <div className="login-signup">
                <div className="login">
                    <h2>Log in</h2>
                    <InputField id="login-email" name="Email" />
                    <InputField id="login-password" name="Password" type="password" />
                    <button onClick={login} className="button">Log in</button>
                </div>
                <div class="signup">
                    <h2>Sign up</h2>
                    <InputField id="signup-name" name="Name" />
                    <InputField id="signup-email" name="Email" />
                    <InputField id="signup-password" name="Password" type="password" />
                    <button onClick={signup} className="button">Sign up</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    console.log("Logging in user ", email, " with password (SECRET) ", password);
    // DB Access to check user and login if correct
}

function signup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    console.log("Signing up user ", name, " with email ", email, " and password (SECRET) ", password);
    // DB Access to add user if doesn't exist
}