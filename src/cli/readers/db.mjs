import collectMongooseOptions from "./db/mongoose.mjs";
import collectRedisOptions from "./db/redis.mjs";
import collectIORedisOptions from "./db/ioredis.mjs";

async function collectData(inquirer) {
    return {
        mongoose: await collectMongooseOptions(inquirer),
        redis: await collectRedisOptions(inquirer),
        ioredis: await collectIORedisOptions(inquirer),
    };
}

export default (inquirer) => {
    return inquirer
        .prompt([
            {
                type: "confirm",
                name: "enabled",
                message: "Add DB connections options",
                default: true,
            },
        ])
        .then(({ enabled }) => {
            if (enabled) {
                return collectData(inquirer);
            } else {
                return false;
            }
        });
};
