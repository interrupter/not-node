/** @module Model/Versioning */

const diff = require('deep-diff').diff;

const TECH_FIELDS = ['_id', '__version', '__versions', '__v', '__latest', '__closed'];

const ERR_NO_PREVIOUS_VERSIONS = 'No previous version!';
const ERR_SAME_OLD_DATA = 'Same old data';

class ModelVersioning{

  static versionsHistoryExists(data){
    return Array.isArray(data.__versions) && (data.__versions.length > 0);
  }

  static extractVersionNumber(data){
    return (typeof data.__version !== 'undefined' && data.__version !== null) ? data.__version : 0;
  }

  static getLatestVersionId(data){
    return data.__versions[0];
  }

  static addVersionToHistory(doc, version){
    if (!ModelVersioning.versionsHistoryExists(doc)) {
      doc.__versions = [];
    }
    doc.__versions.unshift(version._id); //первая в массиве последняя [3,2,1,0]
    return doc.save();
  }

  static stripTechData(a) {
    TECH_FIELDS.forEach((f)=>{
      delete a[f];
    });
    return a;
  }

  static isThisDocsDifferent(a, b) {
    a = ModelVersioning.stripTechData(a);
    b = ModelVersioning.stripTechData(b);
    let diffLog = diff(a, b);
    return (typeof diffLog !== 'undefined');
  }

  /**
  * Compares latest version in __versions list in data with data
  * @param {MongooseModel}  thisModel   model of data
  * @param {Object}         data        data to save
  * @return {boolean}                   if data differs from latest version
  */
  static async isNew(thisModel, data) {
    let latestId = ModelVersioning.getLatestVersionId(data);
    let previous = await thisModel.findById(latestId);
    if (typeof previous !== 'undefined' && previous !== null) {
      return ModelVersioning.isThisDocsDifferent(data, previous.toObject());
    } else {
      throw new Error(ERR_NO_PREVIOUS_VERSIONS);
    }
  }

  /**
  * Saves current version to versions archive, updates current version versioning tags
  * @param {ObjectId}      id             current version _id (just saved version)
  * @param {Object}      data             data to save
  * @param {MongooseModel} thisModel      model to use
  * @return {Promise<MongooseDocument>}   current version with updated versioning tags
  */
  static async saveVersion(id, data, thisModel){
    let preservedVersionNumber = ModelVersioning.extractVersionNumber(data),
      preservedVersionsList = [...data.__versions];//making copy
    let different = await ModelVersioning.isNew(thisModel, data);
    if (different) {
      //it's not latest version, it's archived copy
      delete data.__latest;
      //saves to archive with preserved data
      let versionDoc = new thisModel(data);
      versionDoc.__version = preservedVersionNumber;
      versionDoc.__versions = preservedVersionsList;
      await versionDoc.save();
      //updating history
      let originalDoc = await thisModel.findById(id).exec();
      originalDoc.__version = preservedVersionNumber + 1;
      return await ModelVersioning.addVersionToHistory(originalDoc, versionDoc);
    }
    throw new Error(ERR_SAME_OLD_DATA);
  }

  /**
  * Saves first version. Run AFTER doing .save() on document.
  * @param {ObjectId}      id             current version _id (just saved version)
  * @param {Object}      data             data to save
  * @param {MongooseModel} thisModel      model to use
  * @return {Promise<MongooseDocument>}   current version with updated versions tags
  */
  static async saveFirstVersion(id, data, thisModel){
    //it's not latest version, it's archived copy
    delete data.__latest;
    //saves to archive
    let versionDoc = new thisModel(data);
    await versionDoc.save();
    //retrieving original
    let originalDoc = await thisModel.findById(id).exec();
    //first version
    originalDoc.__version = 1;
    //adding to history
    return await ModelVersioning.addVersionToHistory(originalDoc, versionDoc);
  }

  /**
  * Save document
  * if document is new - creates document
  * if it's updated document - updates document and versioning history
  * @param {MongooseModel} doc document to save
  * @return {Promise<MongooseDocument>}   current version with updated versions tags
  */
  static saveDiff(doc){
    let data = doc.toObject(),
      id = data._id;
    delete data._id;
    if (ModelVersioning.versionsHistoryExists(data)) {
      return ModelVersioning.saveVersion(id, data, this);
    } else {
      return ModelVersioning.saveFirstVersion(id, data, this);
    }
  }

  /**
  * Idea is that you first save or update your doc
  * then you run Doc.version(_id_of_just_saved_doc)
  * and it will create archived copy of current document,
  * add _id of copy to list of document.__versions
  * and increment __version number
  **/
  static version(id){
    return this.findById(id).exec().then(ModelVersioning.saveDiff.bind(this));
  }

}

ModelVersioning.ERR_NO_PREVIOUS_VERSIONS = ERR_NO_PREVIOUS_VERSIONS;
ModelVersioning.ERR_SAME_OLD_DATA = ERR_SAME_OLD_DATA;

module.exports = ModelVersioning;
