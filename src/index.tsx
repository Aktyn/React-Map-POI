import * as React from 'react';
import { render } from 'react-dom';

// import '@fortawesome/fontawesome-free/js/all';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
// import '@fortawesome/fontawesome-free/js/regular'
// import '@fortawesome/fontawesome-free/js/brands'

import './styles/main.scss';
import './styles/common.scss';

import App from "./app";

render(<App />, document.getElementById('root'));