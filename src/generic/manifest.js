const ACTION_SIGNATURES = require("../auth/const").ACTION_SIGNATURES;
const notManifestRouteResultFilter = require("../manifest/result.filter");
const { ACTION_DATA_TYPES } = require("../manifest/const.js");

const extraActionsBuilder = (
    MODULE_NAME,
    modelName,
    FIELDS,
    actionsBuilders = {}
) => {
    const actions = {};
    Object.keys(actionsBuilders).forEach((actionName) => {
        actions[actionName] = actionsBuilders[actionName](
            MODULE_NAME,
            modelName,
            FIELDS
        );
    });
    return actions;
};

const POST_FIX_RECORD_ID = "/:record[_id]";
const POST_FIX_ACTION_NAME = "/:actionName";

const DEFAULT_LOCALES_STRINGS = ["title", "description"];

const getFormActionLocaleString = (
    strName,
    MODULE_NAME,
    modelName,
    actionName,
    commonFormTitles = false
) => {
    return commonFormTitles
        ? `not-node:crud_${actionName}_action_form_${strName}`
        : `${MODULE_NAME}:${modelName}_form_${actionName}_${strName}`;
};

module.exports = (
    MODULE_NAME,
    modelName,
    FIELDS = [],
    actions = {},
    options = {}
) => {
    const resultManifest = {
        model: modelName,
        url: "/api/:modelName",
        fields: FIELDS,
        actions: {
            //ключи это название действий
            create: {
                method: "PUT",
                actionSignature: ACTION_SIGNATURES.CREATE,
                data: [ACTION_DATA_TYPES.DATA],
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            update: {
                method: "POST",
                actionSignature: ACTION_SIGNATURES.UPDATE,
                //добавка к url'у, вид такой :record[название поля без кавычек]
                postFix: POST_FIX_RECORD_ID,
                data: [ACTION_DATA_TYPES.DATA],
                //должен быть авторизован или нет
                formData: true,
                //должен быть суперпользователем или нет
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            list: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                data: [
                    ACTION_DATA_TYPES.PAGER,
                    ACTION_DATA_TYPES.SORTER,
                    ACTION_DATA_TYPES.FILTER,
                ],
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            listAndCount: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: POST_FIX_ACTION_NAME,
                data: [
                    ACTION_DATA_TYPES.PAGER,
                    ACTION_DATA_TYPES.SORTER,
                    ACTION_DATA_TYPES.FILTER,
                    ACTION_DATA_TYPES.SEARCH,
                    ACTION_DATA_TYPES.RETURN,
                ],
                rules: [
                    {
                        root: true,
                        [notManifestRouteResultFilter.PROP_NAME_RETURN_ROOT]:
                            "list",
                    },
                ],
            },
            listAll: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: "/:actionName",
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            count: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: POST_FIX_ACTION_NAME,
                data: ["filter"],
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            get: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: POST_FIX_RECORD_ID,
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            getByID: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: `/:record[${modelName}ID]/:actionName`,
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            getRaw: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: "/:record[_id]/:actionName",
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            delete: {
                method: "DELETE",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: POST_FIX_RECORD_ID,
                rules: [
                    {
                        root: true,
                    },
                ],
            },
            ...extraActionsBuilder(MODULE_NAME, modelName, FIELDS, actions),
        },
    };

    Object.keys(resultManifest.actions).forEach((actionName) => {
        const actionData = resultManifest.actions[actionName];
        const lst = options?.localesStrings ?? DEFAULT_LOCALES_STRINGS;
        lst.forEach((strName) => {
            if (!Object.hasOwn(actionData, strName)) {
                actionData[strName] = getFormActionLocaleString(
                    strName,
                    MODULE_NAME,
                    modelName,
                    actionName,
                    options?.commonFormTitles
                );
            }
        });
    });

    return resultManifest;
};
