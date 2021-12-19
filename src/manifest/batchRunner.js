/**
 * Search and register notModule resouces
 * @class
 **/
module.exports  = class BatchRunner{
  #processors = [];
  constructor(processors){
    this.setProcessors(processors);
  }

  setProcessors(list = []){
    this.#processors = [...list];
  }

  resetProcessors(){
    this.setProcessors();
  }

  /**
  * Searching for content of module and registering it.
  * @static
  * @param {Object}      input
  * @param {notModule}   input.nModule
  * @return {boolean}                       true - executed, false - no paths
  **/
  exec({nModule}) {
    if (!nModule.module.paths) {return false;}
    //starting from simpliest forms and moving upwards
    this.#processors.forEach(processor => new processor({nModule}));
    return true;
  }

};
