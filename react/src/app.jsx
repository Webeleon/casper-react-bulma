import React from 'react';
import ReactDOM from 'react-dom';

import './app.scss';
import { Navbar } from "./components/Navbar.jsx";

const navbarDomContainer = document.querySelector('#navbar');
ReactDOM.render(
    (<Navbar />),
    navbarDomContainer
);
