Last week a client come to me and ask for a custom npm package with a standardized react component he can use in his three sites. No issue, I build the thing and start the integration. 
* main website: ok
* documentation site: ok
* ghost blog: ...
The problems start with the blog...
Ghost blog theming is mainly editing handlebar files, zipping them, and uploading them to the blog.

## [First let's install](https://ghost.org/docs/install/local/)
The company behind ghost blog provides a sass solution for blogging, this means you won't be able to find how to install a local version easily but it is indeed quite easy.

```bash
npm install ghost-cli@latest -g
# create a local copy and start
mkdir someLocalBlogFolder
cd someLocalBlogFolder
ghost install local
ghost start
```
You can now connect to [http://localhost:2368/ghost/#/site](http://localhost:2368/ghost/#/site) and set up a user.

And voila, first step done. We have a local copy!
*little voice*: that's not what you had to do! none will pay for a local install!

## [Clone a Casper theme](https://github.com/TryGhost/Casper) 

Ok, to gain a little time we'll clone and edit the Casper theme which is the default ghost theme.
```bash
git clone git@github.com:TryGhost/Casper.git customCasper
cd customCasper
```

## Create a navbar using [Bulma](https://bulma.io/)

Let's install the basic libraries:
```bash
npm i -D react react-dom bulma
```
We will build our react app in a folder called `react`
```bash
mkdir react
```
Inside the react folder, we will create the react app entry point `react/src/app.jsx`.
```jsx
import React from 'react';
import ReactDOM from 'react-dom';

import './app.scss';
import { NavbarContainer } from "./containers/NavbarContainer.jsx";

const navbarDomContainer = document.querySelector('#navbar');
ReactDOM.render(
    (<NavbarContainer />),
    navbarDomContainer
);
```

## add main sass styling file `react/src/app.scss`
Ok, technically we can just import bulma sass in the `app.jsx` file, but this way we will have an entry point to edit (if we want).
```sass
@charset "utf-8";

@import "bulma/bulma";

div#navbar {
    z-index: 10000
}
```

## create the navbar component `react/src/components/Navbar.jsx`
I know this is just the basic [Bulma navbar example](https://bulma.io/documentation/components/navbar/#basic-navbar), it does not include the js to handle the burger menu (it will be covered in another post)
```jsx
import React from 'react';

export const Navbar = () => (
    <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
            <a className="navbar-item" href="https://bulma.io">
                <img src="https://bulma.io/images/bulma-logo.png" width="112" height="28" />
            </a>

            <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false"
               data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>


        <div id="navbarBasicExample" className="navbar-menu">
            <div className="navbar-start">
                <a className="navbar-item">
                    Home
                </a>

                <a className="navbar-item">
                    Documentation
                </a>

                <div className="navbar-item has-dropdown is-hoverable">
                    <a className="navbar-link">
                        More
                    </a>

                    <div className="navbar-dropdown">
                        <a className="navbar-item">
                            About
                        </a>
                        <a className="navbar-item">
                            Jobs
                        </a>
                        <a className="navbar-item">
                            Contact
                        </a>
                        <hr className="navbar-divider" />
                        <a className="navbar-item">
                            Report an issue
                        </a>
                    </div>
                </div>
            </div>

            <div className="navbar-end">
                <div className="navbar-item">
                    <div className="buttons">
                        <a className="button is-primary">
                            <strong>Sign up</strong>
                        </a>
                        <a className="button is-light">
                            Log in
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
);

```

## add an HTML tag with the id `navbar` in the main handlebar file `default.hbs`
```hbs
{<!-- more in the file --}

<body class="{{body_class}}">

{<!-- more in the file --}

    <div class="site-content">
        <div id="navbar"></div>    {{!-- This is the line you need to add. --}}
        {{!-- All the main content gets inserted here, index.hbs, post.hbs, etc --}}
        {{{body}}}
    </div>
    
{<!-- ... more in the file --}
```

## build system to bundle the react app

Install webpack tooling with all the loaders we will need.
```bash
npm i -D webpack webpack-cli @babel/core babel-loader @babel/preset-env @babel/preset-react node-sass style-loader css-loader sass-loader 
```

At the theme root, we need to add a webpack configuration `webpack.config.js` file just like this one:
```js
const path = require('path');

module.exports = {
    entry: {
        main: "./react/src/app.jsx",
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ],
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "assets/built"),
    },
};
```

Cool, we can now bundle the react app using webpack. 
*little voice: but when i run `npm run zip` the react app is not built...*
<a href="https://imgflip.com/i/3zvhue"><img src="https://i.imgflip.com/3zvhue.jpg" title="made at imgflip.com"/></a>

Ok then, we will need to install one last dependency.
```bash
npm i -D webpack-stream
```

Add a new `webpack` task in the file `gulpfile.js` and add the function to the build definition.
```js
// ... more gulpfile ...
const webpackStream = require('webpack-stream');

// ... more gulpfile ...

function webpack(done) {
    pump([
        src('assets/built'),
        webpackStream(require('./webpack.config.js')),
        dest('assets/built')
    ], handleError(done));
}

// ... more gulpfile ...
// add the 
const build = series(css, js, webpack);
// ... more gulpfile ...
```

Oh yeah! we can now build everything the "right way".
```bash
npm run zip
```

Wait a second... We wrote a react app, we built the app. 
Oh damned, we forgot to load the bundle in the main template. 
Let's add the bundle to the main template: `default.hbs`

```hbs
{{<!-- more handlebar template, close to the end of the body --}}

    <script src="{{asset "built/main.bundle.js"}}"></script>

{{<!-- more handlebar template, close to the end of the body --}}
```

Let's rebuild and upload the built theme in the blog...

And voila, look at your blog and you have a bulma navbar.

[Full sources in github](https://github.com/bassochette/casper-react-bulma)
