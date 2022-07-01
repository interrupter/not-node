module.exports = ({ getLogic, before, after }) => {
    class notGenericRoute {
        static before() {
            return before(...arguments);
        }

        static after() {
            return after(...arguments);
        }

        static async _create(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().create(prepared);
        }

        static async create(req, res, next, prepared) {
            return await getLogic().createOwn(prepared);
        }

        static async _get(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().get(prepared);
        }

        static async get(req, res, next, prepared) {
            return await getLogic().getOwn(prepared);
        }

        static async _getRaw(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().getRaw(prepared);
        }

        static async getRaw(req, res, next, prepared) {
            return await getLogic().getOwnRaw(prepared);
        }

        static async _update(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().update(prepared);
        }

        static async update(req, res, next, prepared) {
            return await getLogic().updateOwn(prepared);
        }

        static async _listAll(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().listAll(prepared);
        }

        static async listAll(req, res, next, prepared) {
            return await getLogic().listAllOwn(prepared);
        }

        static async _listAndCount(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().listAndCount(prepared);
        }

        static async listAndCount(req, res, next, prepared) {
            return await getLogic().listAndCountOwn(prepared);
        }

        static async _delete(req, res, next, prepared) {
            prepared.root = true;
            return await getLogic().delete(prepared);
        }

        static async delete(req, res, next, prepared) {
            return await getLogic().deleteOwn(prepared);
        }
    }

    return notGenericRoute;
};
