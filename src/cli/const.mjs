const DEFAULT_PRIMARY_ROLES_SET = ["root", "admin", "client", "user", "guest"];
export { DEFAULT_PRIMARY_ROLES_SET };

const DEFAULT_MODULES_SET = [
    "not-options",
    "not-filter",
    "not-notification",
    "not-locale",
    "not-inform",
    "not-inform-rule-tag",
    "not-inform-sink-email",
    "not-inform-sink-notification",
    "not-inform-sink-ws",
    "not-key",
    "not-ws",
    "not-store",
    "not-dbdump",
    "not-user",
    "not-error",
];
export { DEFAULT_MODULES_SET };

const DEFAULT_MODULE_LAYERS = [
    "fields",
    "models",
    "logics",
    "routes",
    "forms",
    "controllers",
    "locales",
];
export { DEFAULT_MODULE_LAYERS };

const DEFAULT_ENTITY_LAYERS = [
    "forms",
    "models",
    "logics",
    "routes",
    "controllers",
];
export { DEFAULT_ENTITY_LAYERS };

const DEFAULT_MODULE_ACTIONS = [
    "create",
    "delete",
    "get",
    "getRaw",
    "listAll",
    "listAndCount",
    "update",
];
export { DEFAULT_MODULE_ACTIONS };

const DEFAULT_MODULES_SET_ENABLED = [
    "not-options",
    "not-filter",
    "not-key",
    "not-ws",
    "not-dbdump",
    "not-user",
    "not-store",
    "not-error",
    "not-inform",
    "not-inform-rule-tag",
    "not-inform-sink-email",
    "not-inform-sink-ws",
];
export { DEFAULT_MODULES_SET_ENABLED };

const DEFAULT_NODE_API_URL = "https://appmon.ru/api/key/collect";
export { DEFAULT_NODE_API_URL };

function getDefaultPortByShift(port, shift) {
    if (port && !isNaN(parseInt(port))) {
        return parseInt(port) + shift;
    }
    return false;
}

export { getDefaultPortByShift };
