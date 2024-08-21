const { HttpExceptionForbidden } = require("../exceptions/http");

module.exports = ({ getLogic, before, after }) => {
    class notGenericRoute {
        static restrictRootAccess = false;
        static rootAsUser = false;

        static exceptionOnRootAccess = HttpExceptionForbidden;
        static exceptionParamsPacker = (prepared) => {
            return [{ params: prepared }];
        };

        static before() {
            return before(...arguments);
        }

        static after() {
            return after(...arguments);
        }

        static async _create(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().createOwn(prepared);
            } else {
                return await getLogic().create(prepared);
            }
        }

        static async create(req, res, next, prepared) {
            return await getLogic().createOwn(prepared);
        }

        static async _get(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().getOwn(prepared);
            } else {
                return await getLogic().get(prepared);
            }
        }

        static async get(req, res, next, prepared) {
            return await getLogic().getOwn(prepared);
        }

        static async _getByID(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().getByIDOwn(prepared);
            } else {
                return await getLogic().getByID(prepared);
            }
        }

        static async getByID(req, res, next, prepared) {
            return await getLogic().getByIDOwn(prepared);
        }

        static async _getRaw(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().getOwnRaw(prepared);
            } else {
                return await getLogic().getRaw(prepared);
            }
        }

        static async getRaw(req, res, next, prepared) {
            return await getLogic().getOwnRaw(prepared);
        }

        static async _update(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().updateOwn(prepared);
            } else {
                return await getLogic().update(prepared);
            }
        }

        static async update(req, res, next, prepared) {
            return await getLogic().updateOwn(prepared);
        }

        static async _listAll(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().listAllOwn(prepared);
            } else {
                return await getLogic().listAll(prepared);
            }
        }

        static async listAll(req, res, next, prepared) {
            return await getLogic().listAllOwn(prepared);
        }

        static async _listAndCount(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().listAndCountOwn(prepared);
            } else {
                return await getLogic().listAndCount(prepared);
            }
        }

        static async listAndCount(req, res, next, prepared) {
            return await getLogic().listAndCountOwn(prepared);
        }

        static async _list(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().listOwn(prepared);
            } else {
                return await getLogic().list(prepared);
            }
        }

        static async list(req, res, next, prepared) {
            return await getLogic().listOwn(prepared);
        }

        static async _count(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().countOwn(prepared);
            } else {
                return await getLogic().count(prepared);
            }
        }

        static async count(req, res, next, prepared) {
            return await getLogic().countOwn(prepared);
        }

        static async _delete(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic().deleteOwn(prepared);
            } else {
                return await getLogic().delete(prepared);
            }
        }

        static async delete(req, res, next, prepared) {
            return await getLogic().deleteOwn(prepared);
        }
    }

    return notGenericRoute;
};
