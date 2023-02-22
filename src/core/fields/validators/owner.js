module.exports = [
    {
        validator(val, { validator }) {
            if (typeof val === "string") {
                return validator.isMongoId(val);
            } else {
                return (
                    val &&
                    typeof val === "object" &&
                    val.constructor.name === "ObjectId"
                );
            }
        },
        message: "not-node:owner_is_not_valid",
    },
];
