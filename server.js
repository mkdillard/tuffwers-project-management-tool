
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');

app = express();
app.use(bodyParser.json());
app.use(cors());

const historyOptions = {
    index: '/'
}

app.use(history(historyOptions));

// app.use(serveStatic(path.join(__dirname, 'dist')));

app.get('/index.html', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/*', express.static(path.join(__dirname, 'dist')));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Starting server on port ${port}`);
});