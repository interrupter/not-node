/** @module Model/Versioning */

const diff = require("deep-diff").diff;

const TECH_FIELDS = [
    "_id",
    "__version",
    "__versions",
    "__v",
    "__latest",
    "__closed",
];

function toObject(obj) {
    return obj.toObject ? obj.toObject({ minimize: false }) : obj;
}

const {
    VersioningExceptionNoPreviousVersions,
    VersioningExceptionSameOldData,
} = require("./exceptions.js");

class ModelVersioning {
    static versionsHistoryExists(data) {
        return Array.isArray(data.__versions) && data.__versions.length > 0;
    }

    static extractVersionNumber(data) {
        return typeof data.__version !== "undefined" && data.__version !== null
            ? data.__version
            : 0;
    }

    static getLatestVersionId(data) {
        return data.__versions[0];
    }

    static addVersionToHistory(doc, version) {
        if (!ModelVersioning.versionsHistoryExists(doc)) {
            doc.__versions = [];
        }
        doc.__versions.unshift(version._id); //первая в массиве последняя [3,2,1,0]
        doc.markModified("__versions");
    }

    static stripTechData(a) {
        TECH_FIELDS.forEach((f) => {
            delete a[f];
        });
        return a;
    }

    static jsonCopy(a) {
        return JSON.parse(JSON.stringify(toObject(a)));
    }

    static isThisDocsDifferent(a, b) {
        a = ModelVersioning.stripTechData(a);
        b = ModelVersioning.stripTechData(b);
        const plainA = ModelVersioning.jsonCopy(a);
        const plainB = ModelVersioning.jsonCopy(b);
        const diffLog = diff(plainA, plainB);
        return typeof diffLog !== "undefined";
    }

    /**
     * Compares latest version in __versions list in data with data
     * @param {import('mongoose').Model}  ModelConstructor   model of data
     * @param {Object}         data        data to save
     * @return {Promise<boolean>}                   if data differs from latest version
     */
    static async isNew(ModelConstructor, data) {
        let latestId = ModelVersioning.getLatestVersionId(data);
        let previous = await ModelConstructor.findOne({ _id: latestId });
        if (typeof previous !== "undefined" && previous !== null) {
            return ModelVersioning.isThisDocsDifferent(
                data,
                toObject(previous)
            );
        } else {
            throw new VersioningExceptionNoPreviousVersions();
        }
    }

    /**
     * Saves current version to versions archive, updates current version versioning tags
     * @param {import('mongoose').Types.ObjectId}      id             current version _id (just saved version)
     * @param {Object}      data             data to save
     * @param {import('mongoose').Model} ModelConstructor      model to use
     * @return {Promise<import('mongoose').Document>}   current version with updated versioning tags
     */
    static async saveVersion(id, data, ModelConstructor) {
        let preservedVersionNumber = ModelVersioning.extractVersionNumber(data),
            preservedVersionsList = [...data.__versions]; //making copy
        let different = await ModelVersioning.isNew(ModelConstructor, data);
        if (different) {
            //it's not latest version, it's archived copy
            delete data.__latest;
            //saves to archive with preserved data
            let versionDoc = new ModelConstructor(data);
            versionDoc.__version = preservedVersionNumber;
            versionDoc.__versions = preservedVersionsList;
            await versionDoc.save();
            //updating history
            let originalDoc = await ModelConstructor.findOne({ _id: id });
            originalDoc.__version = preservedVersionNumber + 1;
            ModelVersioning.addVersionToHistory(originalDoc, versionDoc);
            return await originalDoc.save();
        }
        throw new VersioningExceptionSameOldData();
    }

    /**
     * Saves first version. Run AFTER doing .save() on document.
     * @param {import('mongoose').Types.ObjectId}      id             current version _id (just saved version)
     * @param {Object}      data             data to save
     * @param {import('mongoose').Model} ModelConstructor      model to use
     * @return {Promise<import('mongoose').Document>}   current version with updated versions tags
     */
    static async saveFirstVersion(id, data, ModelConstructor) {
        //it's not latest version, it's archived copy
        delete data.__latest;
        //saves to archive
        let versionDoc = new ModelConstructor(data);
        await versionDoc.save();
        //retrieving original

        //const findById = getFunc(thisModel,'findById');
        let originalDoc = await ModelConstructor.findOne({ _id: id });
        //first version
        originalDoc.__version = 1;
        //adding to history
        ModelVersioning.addVersionToHistory(originalDoc, versionDoc);
        return await originalDoc.save();
    }

    /**
     * Save document
     * if document is new - creates document
     * if it's updated document - updates document and versioning history
     * @param {import('mongoose').Model} doc document to save
     * @return {Promise<import('mongoose').Document>}   current version with updated versions tags
     */
    static saveDiff(ModelConstructor, doc) {
        let data = toObject(doc),
            id = data._id;
        delete data._id;
        if (ModelVersioning.versionsHistoryExists(data)) {
            return ModelVersioning.saveVersion(id, data, ModelConstructor);
        } else {
            return ModelVersioning.saveFirstVersion(id, data, ModelConstructor);
        }
    }

    /**
     * Idea is that you first save or update your doc
     * then you run Doc.version(_id_of_just_saved_doc)
     * and it will create archived copy of current document,
     * add _id of copy to list of document.__versions
     * and increment __version number
     **/
    static async version(id) {
        const ModelConstructor = this;
        const original = await ModelConstructor.findOne({ _id: id });
        return await ModelVersioning.saveDiff(ModelConstructor, original);
    }
}

module.exports = ModelVersioning;
