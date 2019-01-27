const path = require('path');
const {exec} = require('child_process');
const xdgBasedir = require('xdg-basedir');
const express = require('express');

const app = express();
app.use(express.static('dist'));

const ircodesPath = path.resolve(xdgBasedir.config, 'remopi', 'ircodes.json');
const ircodes = require(ircodesPath);
const commands = require(path.resolve(xdgBasedir.config, 'remopi', 'commands.json'));
const devices = Object.keys(ircodes).concat(Object.keys(commands));

app.get('/availables', (req, res) => {
  res.status(200).send(devices);
});

app.get('/api/:device/:action', (req, res) => {
  if (Object.keys(ircodes).includes(`${req.params.device}:${req.params.action}`)) {
    exec(`${path.resolve(process.env.HOME, 'bin', 'irrp.py')} --play --gpio 17 --file ${ircodesPath} ${req.params.device}:${req.params.action}`);
  } else if (Object.keys(commands).includes(`${req.params.device}:${req.params.action}`)) {
    exec(commands[`${req.params.device}:${req.params.action}`]);
  } else {
    res.status(400).end();
  }

  res.status(200).end();
});

if (process.env.NODE_ENV !== 'production') {
  const bundler = new (require('parcel-bundler'))('./src/index.html');
  app.use(bundler.middleware());
}

app.listen(process.env.PORT || 42897);
