const InitEnv = require("../../src/init/lib/env");

function getFromLib(vals, path, def) {
    if (Object.prototype.hasOwnProperty.call(vals, path)) {
        return vals[path];
    } else {
        return def;
    }
}

module.exports = ({ expect }) => {
    describe("Envs", () => {
        describe("getProxyPort", () => {
            it("proxy:port - number", () => {
                const config = {
                    get(path) {
                        return path === "proxy:port" ? 8080 : null;
                    },
                };
                const port = InitEnv.getProxyPort(config);
                expect(port).to.be.equal(8080);
            });

            it("port - string", () => {
                const config = {
                    get(path) {
                        return path === "port" ? "80" : null;
                    },
                };
                const port = InitEnv.getProxyPort(config);
                expect(port).to.be.equal(80);
            });
        });

        describe("getFullServerName", () => {
            it("proxy:secure - true, proxy:port - 8080", () => {
                const vals = {
                    "proxy:secure": true,
                    "proxy:port": 8080,
                    host: "hostname",
                };

                const config = {
                    get(path) {
                        return getFromLib(vals, path, null);
                    },
                };
                const address = InitEnv.getFullServerName(config);
                expect(address).to.be.equal("https://hostname:8080");
            });

            it("proxy:secure - false, proxy:port - 80", () => {
                const vals = {
                    "proxy:secure": false,
                    "proxy:port": 80,
                    host: "hostname",
                };

                const config = {
                    get(path) {
                        return getFromLib(vals, path, null);
                    },
                };
                const address = InitEnv.getFullServerName(config);
                expect(address).to.be.equal("http://hostname");
            });
        });

        describe("run", () => {
            it("path:ws - empty", async () => {
                const vals = {
                    "proxy:secure": true,
                    "proxy:port": 8080,
                    host: "hostname",
                    "path:ws": undefined,
                };
                const master = {
                    getAbsolutePath(str) {
                        return str + "_fake_absolute";
                    },
                    setEnv() {},
                };
                const options = {
                    pathToApp: "pathToApp__fake",
                    pathToNPM: "pathToNPM__fake",
                };
                const config = {
                    get(path) {
                        return getFromLib(vals, path, null);
                    },
                    set() {},
                };
                await new InitEnv().run({
                    master,
                    options,
                    config,
                    emit: require("../fakes").createFakeEmit(),
                });
            });

            it("path:ws - not empty", async () => {
                const vals = {
                    "proxy:secure": true,
                    "proxy:port": 8080,
                    host: "hostname",
                    "path:ws": "some_path",
                };
                const master = {
                    getAbsolutePath(str) {
                        return str + "_fake_absolute";
                    },
                    setEnv() {},
                };
                const options = {
                    pathToApp: "pathToApp__fake",
                    pathToNPM: "pathToNPM__fake",
                };
                const config = {
                    get(path) {
                        return getFromLib(vals, path, null);
                    },
                    set() {},
                };
                await new InitEnv().run({
                    master,
                    options,
                    config,
                    emit: require("../fakes").createFakeEmit(),
                });
            });
        });
    });
};
