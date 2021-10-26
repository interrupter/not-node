const notPath = require('not-path');

function isFunc(func){
  return typeof func === 'function';
}

function isAsync(func){
  return func.constructor.name === 'AsyncFunction';
}

let ADDITIONAL = {};

module.exports.init = (val)=>{
  if(typeof val === 'object'){
    ADDITIONAL = {...val};
  }
};

function select(stepPath){
  const res = notPath.get(':' + stepPath, ADDITIONAL);
  if(typeof res === 'object'){
    return res;
  }else{
    return {};
  }
}

module.exports.run = async (path, params)=>{
  if(!ADDITIONAL){return;}
  const proc = select(path);
  if(isFunc(proc)){
    if(isAsync(proc)){
      return await proc(params);
    }else{
      return proc(params);
    }
  }
};
