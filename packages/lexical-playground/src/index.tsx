/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './setupEnv';
import './index.css';

import * as React from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Category from './Category';
import logo from './images/logo.svg';
import Lesson from './Lesson';
import FirebaseProvider from './providers/firebase/FirebaseProvider'
import Quiz from './Quiz';

// Handle runtime errors
const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get('vite-error-overlay');
  if (!ErrorOverlay) {
    return;
  }
  const overlay = new ErrorOverlay(err);
  const body = document.body;
  if (body !== null) {
    body.appendChild(overlay);
  }
};

window.addEventListener('error', showErrorOverlay);
window.addEventListener('unhandledrejection', ({reason}) =>
  showErrorOverlay(reason),
);
const Container = () => {

  // React.useEffect(() => {
  //   const elems = document.querySelectorAll('.sidenav');
  //   const [instance] = M.Sidenav.init(elems);
  //   // const instance = M.Sidenav.getInstance(elem);
  //   instance.open()
  // }, [])
return (<FirebaseProvider>
<BrowserRouter>
<header>
        <a href="https://lexical.dev" target="_blank" rel="noopener">
          <img src={logo} alt="Lexical Logo" />
        </a>
      </header>


{/* <ul id="slide-out" className="sidenav">
<li><div className="user-view">
<div className="background">
  <img src="images/office.jpg" />
</div>
<a href="#user"><img className="circle" src="images/yuna.jpg" /></a>
<a href="#name"><span className="white-text name">John Doe</span></a>
<a href="#email"><span className="white-text email">jdoe@example.com</span></a>
</div></li>
<li><a href="#!"><i className="material-icons">cloud</i>First Link With Icon</a></li>
<li><a href="#!">Second Link</a></li>
<li><div className="divider" /></li>
<li><a className="subheader">Subheader</a></li>
<li><a className="waves-effect" href="#!">Third Link With Waves</a></li>
</ul>
<a href="#" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a> */}
      <Routes>
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/category" element={<Category />} />
  <Route path="/" element={<Lesson />} />
</Routes>
</BrowserRouter>
</FirebaseProvider>)
}
createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
   <Container />
  </React.StrictMode>,
);
