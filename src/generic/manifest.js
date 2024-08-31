const ACTION_SIGNATURES = require("../auth/const").ACTION_SIGNATURES;

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

module.exports = (MODULE_NAME, modelName, FIELDS = [], actions = {}) => {
    return {
        model: modelName,
        url: "/api/:modelName",
        fields: FIELDS,
        actions: {
            //ключи это название действий
            create: {
                method: "PUT",
                actionSignature: ACTION_SIGNATURES.CREATE,
                data: ["data"],
                rules: [
                    {
                        root: true,
                    },
                ],
                title: `${MODULE_NAME}:${modelName}_form_create_title`,
            },
            update: {
                method: "POST",
                actionSignature: ACTION_SIGNATURES.UPDATE,
                //добавка к url'у, вид такой :record[название поля без кавычек]
                postFix: POST_FIX_RECORD_ID,
                data: ["data"],
                //должен быть авторизован или нет
                formData: true,
                //должен быть суперпользователем или нет
                rules: [
                    {
                        root: true,
                    },
                ],
                title: `${MODULE_NAME}:${modelName}_form_update_title`,
            },
            list: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                data: ["pager", "sorter", "filter"],
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
                data: ["pager", "sorter", "filter", "searcher", "return"],
                rules: [
                    {
                        root: true,
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
                title: `${MODULE_NAME}:${modelName}_form_details_title`,
            },
            getByID: {
                method: "GET",
                actionSignature: ACTION_SIGNATURES.READ,
                postFix: `/:record[${modelName}ID]/:actionName`,
                rules: [
                    {
                        root: true,
                    },
                    {
                        auth: false,
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
};
