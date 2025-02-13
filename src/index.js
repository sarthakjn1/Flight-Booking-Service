const express = require('express');

const { ServerConfig, Logger } = require('./config/index.js');

const apiRoutes = require('./routes');

const app = express();

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started server on port ${ServerConfig.PORT}`);
});