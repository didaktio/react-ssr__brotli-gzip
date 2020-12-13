import express from 'express';
import fs from 'fs';
import { renderToString } from 'react-dom/server';
import { App } from './src/App';


// Use port set in environment, else default to 8080.
const PORT = process.env.PORT || 8080;


// Create an Express app,
express()

   // Alter request for .js files by appending .br/.gz, which will send the compressed file instead of the original.
   // Critically, this code comes before anything is served (eg static files).
   .get(/^.*\.(js|css)$/, (req, res, next) => {
      if (req.header('Accept-Encoding')?.includes('br')) {
         req.url = req.url + '.br';
         res.set('Content-Encoding', 'br');
      }
      else if (req.header('Accept-Encoding')?.includes('gzip')) {
         req.url = req.url + '.gz';
         res.set('Content-Encoding', 'gzip');
      }
      res.set('Content-Type', `${req.originalUrl.endsWith('.css') ? 'text/css' : 'application/javascript'}; charset=UTF-8`);
      next();
   })

   // Serve static files in the directory from which the server file is run.
   .use(express.static(__dirname))

   // Match all paths with a wildcard (*).
   .get('**', async (req, res) => {

      // Set (conditional) caching for optimal performance.
      if (req.query?.noCache !== 'true') res.set('Cache-Control', 'public, max-age=31536000');

      // Await the index file, then replace the HTML wherein react would typically render the app with
      // the rendered HTML. React's renderToString is crucial here: https://reactjs.org/docs/react-dom-server.html
      res.send(
         (await readIndexFile('index.html'))
            .replace('<div id="root"></div>', `<div id="root">${renderToString(<App />)}</div>`));
   })

   // Expose the app.
   .listen(PORT, () => console.log(`App listening on http://localhost:${PORT}`));


// Create a function for reading the index.html file. The usual fs.readFile is wrapped in a promise which
// resolves with the file found at the provided path.
const readIndexFile = (path: string): Promise<string> => new Promise(async (resolve, reject) =>
   fs.readFile(path, 'utf8', (error, data) => error ? reject(error) : resolve(data)));