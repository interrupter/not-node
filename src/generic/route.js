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
                return await getLogic(prepared).createOwn(prepared);
            } else {
                return await getLogic(prepared).create(prepared);
            }
        }

        static async create(req, res, next, prepared) {
            return await getLogic(prepared).createOwn(prepared);
        }

        static async _get(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).getOwn(prepared);
            } else {
                return await getLogic(prepared).get(prepared);
            }
        }

        static async get(req, res, next, prepared) {
            return await getLogic(prepared).getOwn(prepared);
        }

        static async _getByID(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).getByIDOwn(prepared);
            } else {
                return await getLogic(prepared).getByID(prepared);
            }
        }

        static async getByID(req, res, next, prepared) {
            return await getLogic(prepared).getByIDOwn(prepared);
        }

        static async _getRaw(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).getRawOwn(prepared);
            } else {
                return await getLogic(prepared).getRaw(prepared);
            }
        }

        static async getRaw(req, res, next, prepared) {
            return await getLogic(prepared).getRawOwn(prepared);
        }

        static async _update(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).updateOwn(prepared);
            } else {
                return await getLogic(prepared).update(prepared);
            }
        }

        static async update(req, res, next, prepared) {
            return await getLogic(prepared).updateOwn(prepared);
        }

        static async _listAll(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).listAllOwn(prepared);
            } else {
                return await getLogic(prepared).listAll(prepared);
            }
        }

        static async listAll(req, res, next, prepared) {
            return await getLogic(prepared).listAllOwn(prepared);
        }

        static async _listAndCount(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).listAndCountOwn(prepared);
            } else {
                return await getLogic(prepared).listAndCount(prepared);
            }
        }

        static async listAndCount(req, res, next, prepared) {
            return await getLogic(prepared).listAndCountOwn(prepared);
        }

        static async _list(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).listOwn(prepared);
            } else {
                return await getLogic(prepared).list(prepared);
            }
        }

        static async list(req, res, next, prepared) {
            return await getLogic(prepared).listOwn(prepared);
        }

        static async _count(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).countOwn(prepared);
            } else {
                return await getLogic(prepared).count(prepared);
            }
        }

        static async count(req, res, next, prepared) {
            return await getLogic(prepared).countOwn(prepared);
        }

        static async _delete(req, res, next, prepared) {
            if (this.restrictRootAccess) {
                throw new this.exceptionOnRootAccess(
                    ...this.exceptionParamsPacker(prepared)
                );
            }
            if (this.rootAsUser) {
                return await getLogic(prepared).deleteOwn(prepared);
            } else {
                return await getLogic(prepared).delete(prepared);
            }
        }

        static async delete(req, res, next, prepared) {
            return await getLogic(prepared).deleteOwn(prepared);
        }
    }

    return notGenericRoute;
};
