
const emit = require('./additional').run;
const Log = require('not-log')(module, 'not-node//init');

module.exports = class InitExpress{

  static requestLogging({/*config, options, */master}){
    master.getServer().use((req, res, next) => {
      Log.log(req.ip, req.method, req.url);
      return next();
    });
  }

  async run({options, config, master}) {
    Log.info('Init express app...');
    await emit('express.pre', {options, config, master});
    //express
    const express = require('express');
    master.setServer(express());
    InitExpress.requestLogging({options, config, master});
    await emit('express.post', {options, config, master});
  }

};
