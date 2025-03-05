const express = require('express');

const { ServerConfig, Logger } = require('./config/index.js');

const apiRoutes = require('./routes');
const { scheduleCrons } = require('./utils/common/cron-jobs.js')


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started server on port ${ServerConfig.PORT}`);
    scheduleCrons();
});