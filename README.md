# React Clock (Brotli- and gzip-Compression with SSR)

A [Simple React Clock](https://github.com/didaktio/react-clock), utilising:
* [Server-Side Rendering](https://css-tricks.com/server-side-react-rendering/) (SSR)
* [Brotli](https://en.wikipedia.org/wiki/Brotli) Compression
* [gzip](https://en.wikipedia.org/wiki/Gzip) Compression
* Customised [Webpack](https://webpack.js.org/configuration/)
* [TypeScript](https://create-react-app.dev/docs/adding-typescript/) EVERYWHERE
* [Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/) ([done properly](https://stackoverflow.com/questions/55185601/webpack-process-env-undefined-using-defineplugin-and-dotenv/65264701#65264701)).
* [SCSS](https://sass-lang.com/) (Dart SASS)
* [Hooks](https://reactjs.org/docs/hooks-intro.html)
* ['State Lifting'](https://reactjs.org/docs/lifting-state-up.html)
* [Functional Components](https://reactjs.org/docs/components-and-props.html)
* BEM [(Block, Element, Modifier)](https://en.bem.info/methodology/quick-start/) approach
* [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
* Popovers
* Extending [Synthetic Event](https://reactjs.org/docs/events.html) to ensure solid typing
* Performance optimisations:
    - Memoization with `useMemo` (see buttons function in Clock component)
    - Event handler functions defined outside html to avoid re-rendering of same functions (see Clock component)
    - Single event listener for multiple target children, making use of JavaScript instead of browser overhead
     (see Buttons component in `Clock.tsx`)


You might compare the performance of this deployment with the [non-SSR](https://react-clock.didakt.io) or [non-compression]((https://react-clock-ssr.herokuapp.com)) deployment (using eg [Chrome Lighthouse](https://developers.google.com/web/tools/lighthouse), [WebPageTest](https://www.webpagetest.org), or just by inspecting the source files in Chrome DevTools). For the last: navigate to the Network tab in the dev tools, ensure `Disable cache` is checked, and reload the page. Now compare the size of `bundle.js` and `main.css` with that of the [non-SSR](https://react-clock-ssr.herokuapp.com) or [uncompressed SSR](https://react-clock-ssr.herokuapp.com) version, again with cache disabled.

**LIVE**: https://react-clock-ssr-brotgi.herokuapp.com\
Uncached: https://react-clock-ssr-brotgi.herokuapp.com/?noCache=true


## How it Works
1. App starts as a standard TypeScript React project created using `create-react-app`.
2. A server is created using [Express](https://expressjs.com/) in `server.tsx` (see file within for more about how the compressed files are served).
3. Webpack is used to compile the TypeScript into minified JavaScript. This is used in place of `react-scripts build`. Webpack's flexibility means there is no need for babel. `webpack.config.ts` tells webpack the following:
    - Find `.tsx`, `.scss`, and `.svg` imports, and include them in the compilation.
    - Use the loaders: [ts-loader](https://github.com/TypeStrong/ts-loader), [sass-loader](https://github.com/webpack-contrib/sass-loader), [css-loader](https://github.com/webpack-contrib/css-loader), and [url-loader](https://github.com/webpack-contrib/url-loader) (for SVG files).
    - Output all files to a directory named `server-build`.
    - Compress js, css, and html files with gzip.
    - Compress js, css, html, and svg files with brotli.
    - If the `SERVER` environment variable is present:
        * Set the entry point to the server at `server.tsx`.
        * Optimise the build for a node environment by setting the [target to node](https://webpack.js.org/concepts/targets/)
        and including [NodeExternals](https://www.npmjs.com/package/webpack-node-externals).
        * Name the output file as `index.js`.
    - If the `CLIENT` environment variable is present:
        * Set the entry point to the app entry file (`index.tsx`).
        * Name the output file as `bundle.js`.
    - `mode` is set to 'production' to ensure an build stripped of all but the necessary.
    - Optionally, Webpack will watch for changes if the WATCH environment variable is present.
4. Running `npm start` does the following:
    1. Copies everything from `public` directory to the `server-build` directory.
    2. Copies `server-index.html` to `server-build` and renames it to `index.html`.
    3. Compiles server code using webpack; outputs to `server-build/index.js`.
    4. Compiles app code using webpack; outputs to `server-build/bundle.js`.
    5. Moves into the `server-build` directory and runs [nodemon](https://www.npmjs.com/package/nodemon) to start a hot reload server.
    6. Source files are watched by webpack for changes; any change will trigger a recompile. Nodemon restarts the server on any changes to `index.js`, a file which webpack will overwrite on every compile. Reloading the page will load the new changes.

Compressed files are served depending on the headers included in the request. Most browsers support brotli, gzip,


#### React Scripts
For those who want to use `react-scripts` the following configurations are included:
* Custom config file `tsloader-config.json`, which is passed to ts-loader to override the [`noEmit:true` requirement](https://github.com/react-cosmos/react-cosmos/issues/998).
* Dedicated index html file for the server `server-index.html`. This is necessary because asset paths are automatically replaced by react-scripts. As part of every build it is copied into the build folder and renamed to `index.html`, for use by node. The other reason it is necessary is the script tags: react-script builds use multiple script tags; the server build has a **single** script tag.
* (Re)integrating react-scripts is simple:
    - Run `npm i react-scripts webpack@4.44.2`
    - For live development server: `npm run rs-start`
    - To create a production build: `npm run rs-build`

#### Getting Started
1) Clone or download the repo into a fresh folder on your machine with `git clone https://github.com/didaktio/react-clock.git`.
2) Run `npm install` from the project root to install dependencies.
3) Run `npm start` to start the development server or `npm run serve` to serve the application.
4) Kill the terminal to close the server. Alternatively hit `ctrl + C` several times to kill nodemon and both webpack watchers (you will have to wait for webpack ops to complete).
5) Edit/break/improve/add to the code, starting with the `App.tsx` file. Try some of the below TODOs.

#### Overkill Manual
* **Start**: Click the `Start` button.
* **Stop**: Click the `Stop` button.
* **Reset**: Click the `Reset`button.
* **Speed**: Click the React logo to open a popover from which you can select a different speed.
* **Format**: Click the time to open a popover from which you can select a different format.
* **Save**: No need; progress is saved automatically. You can close the tab, quit the browser, turn off your device &mdash; just navigate back and you'll be right where you left off!

#### TODO(?)
* Deploy to [Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true) (build directory is already configured for this)
* Countdowns
* Testing with [Cypress](https://www.cypress.io/)
* Option to change increment

### Troubleshooting
* Unusual TypeScript errors: ensure you're running the workspace version (ie the one coupled with your app). In VSCode, you can do this via the command palette: `CMD + p` &mdash;> `type '>'` &mdash;> `type 'typescript select version'` &mdash;> `select 'use workspace version'`.
* React (react-scripts) complains about webpack version: install the recommended version of webpack to the devDependencies (as of 11/12/2020, it is 4.44.2).
* Node complains of files not existing when running server app: ensure you're running the app from the `deployment` directory.
* Node/Webpack `... is not defined`: webpack watch uses cache which can be troublesome because. Run `npm cache clear -f` and retry.


###### Environment Info
Node: 14.15.1\
npm: 6.14.9\
Heroku CLI: 7.47.4