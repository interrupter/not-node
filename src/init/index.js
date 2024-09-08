//
const os = require("os");
const path = require("path");
const logger = require("not-log");
const log = logger(module, "not-node:Init");

const Env = require("../env");
//
const ADDS = require("./additional");
//
const InitSequence = require("./sequence.js");
const STANDART_INIT_SEQUENCE = require("./sequence.standart.js");

/**
 *	@example <caption>Application initialization</caption>
 *
 * const sharp = require("sharp");
 * const InitIdentityTokens = require("not-user").InitIdentityTokens;
 *
 * const notNode = require("not-node"),
 *   Init = notNode.Init,
 *   path = require("path"),
 *   manifest = require("./../../project.manifest.json")
 *
 * const options = {
 *       pathToApp: path.join(__dirname),
 *      pathToNPM: path.join(__dirname, "../../node_modules"),
 *      routesPath: path.join(__dirname, "./routes"),
 *      indexRoute: require("./routes/site.js").index,
 *  };
 *  //fix error on some images
 *  sharp.simd(false);
 *  notNode.Env.set("extractVariants", 1);
 *  const additional = {
 *      pre({ initSequence }) {
 *          initSequence.remove("InitMonitoring");    //no resource usage monitoring needed, removing initializer by its class name
 *          initSequence.insert(InitIdentityTokens);  //initializing usage of identity tokens
 *      },
 *  };
 *  //starting everything
 *  await Init.run({ options, manifest, additional });
 *  //sending message to error reporting server that we restarted
 *  Init.notApp.reporter.report(new Error("server started"));
 **/
class Init {
    /**
     * @type {Object}
     *
     * @static
     * @memberof Init
     */
    static options = null;
    static manifest = false;
    /**
     * @type {Object}
     *
     * @static
     * @memberof Init
     */
    static config = null;
    static mongoose = false;
    /**
     * @type {import('../app.js')|null}
     *
     * @static
     * @memberof Init
     */
    static notApp = null;
    static server = false;
    static httpServer = false;
    static WSServer = false;
    static WSClient = false;

    static getAbsolutePath(subPath) {
        return path.resolve(Init.options.pathToApp, subPath);
    }

    static setManifest(manifest) {
        Init.manifest = manifest;
    }

    static getManifest() {
        return Init.manifest;
    }

    static setMongoose(val) {
        Init.mongoose = val;
    }

    static getMongoose() {
        return Init.mongoose;
    }

    static setServer(val) {
        Init.server = val;
        return Init;
    }

    static getServer() {
        return Init.server;
    }

    static setHTTPServer(val) {
        Init.httpServer = val;
        return Init;
    }

    static getHTTPServer() {
        return Init.httpServer;
    }

    static setEnv(key, val) {
        Env.set(key, val);
    }

    static getEnv(key) {
        return Env.get(key);
    }

    static getApp() {
        return Init.notApp;
    }

    static setApp(val) {
        Init.notApp = val;
        return Init;
    }

    static initConfig(config = false) {
        if (!config) {
            Init.config = require("not-config").createReader();
        } else {
            Init.config = config;
        }
        Init.setEnv("config", config);
    }

    static getConfig() {
        return Init.config;
    }

    static printOutManifest = () => {
        log?.debug("Manifest:");
        log?.debug(JSON.stringify(Init.notApp?.getManifest(), null, 4));
    };

    /**
     * Initalization of Application
     *
     * @param {Object} params hash with few possible object
     * @param {Object} params.config  nconf like reader {get:(key)=>any, set:(key, value)=>void}
     * @param {Object} params.options paths infrastructure options
     * @param {Object} params.manifest application manifest
     * @param {Object} params.additional pre/mid/post actions for every major step of initialization {stepName: {pre: async()=>void, post: async()=>void, [key: string]=> async()=>void}}
     **/

    static async run({ config, options, manifest, additional }) {
        try {
            log?.info("Kick start app..." + os.platform() + " " + os.arch());
            ADDS.init(additional);
            const initSequence = new InitSequence(STANDART_INIT_SEQUENCE);
            await ADDS.run("pre", {
                config,
                options,
                manifest,
                additional,
                initSequence, //giving a chance to change init sequence
                log,
            });
            //setting basic resources
            Init.options = options; // pathToApp, pathToNPM
            Init.setManifest(manifest);
            //adopting provided config store or initializing own
            Init.initConfig(config);
            //creating context for other init runners
            const context = {
                config: Init.getConfig(), //access to config
                options, //options
                master: Init, //this class
                emit: ADDS.run.bind(ADDS),
                log,
            };
            //running all prepared initalizers with current context
            await initSequence.run(context);
            await ADDS.run("post", {
                config,
                options,
                manifest,
                master: Init,
                log,
            });
            log?.info("Application initalization finished");
        } catch (e) {
            Init.throwError(e.message, 1);
        }
    }

    static throwError(errMsg = "Fatal error", errCode = 1) {
        log?.error(errMsg);
        log?.log(`Exit process...with code ${errCode}`);
        throw new Error(errMsg);
    }
}

module.exports.Init = Init;
