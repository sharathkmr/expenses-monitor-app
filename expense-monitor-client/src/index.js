import React from 'react';
import ReactDOM from 'react-dom'; // used to rend the dom with react components
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/jquery/dist/jquery.min.js';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import {NavBar} from './NavBar';

ReactDOM.render(<NavBar />, document.getElementById('root'));