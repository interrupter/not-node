/** @module Lib */
const Log = require("not-log")(module, "lib");
const { objHas } = require("./common");
const fs = require("fs"),
    os = require("os"),
    fse = require("fs-extra"),
    rmdir = require("rmdir"),
    git = require("simple-git"),
    ejs = require("ejs"),
    path = require("path"),
    nconf = require("nconf"),
    repos = require("./repos.js"),
    shell = require("./shell.helpers.js");

module.exports.getRepo = function (name) {
    return objHas(repos, name) ? repos[name] : false;
};

module.exports.mkTmpDir = function () {
    return fs.mkdtempSync(path.join(os.tmpdir(), "not-node-"));
};

module.exports.cloneRepo = function (repo, dir) {
    return new Promise((resolve, reject) => {
        Log.log("Cloning ", repo.url, " into ", dir);
        git()
            .silent(false)
            .clone(repo.url, dir, ["--depth", 1])
            .exec((err) => {
                if (err) {
                    reject(err);
                } else {
                    Log.log("done");
                    resolve();
                }
            });
    });
};

module.exports.clearRepo = async (repo, parentDir) => {
    Log.log("Clearing ", parentDir, " ...");
    if (repo.clear) {
        if (repo.clear.dirs || repo.clear.files) {
            let counter =
                (repo.clear.dirs ? repo.clear.dirs.length : 0) +
                (repo.clear.files ? repo.clear.files.length : 0);
            for (let dir of repo.clear.dirs) {
                Log.log("removing ", dir);
                rmdir(path.join(parentDir, dir), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        counter--;
                        if (!counter) {
                            Log.log("done");
                            resolve();
                        }
                    }
                });
            }
            for (let file of repo.clear.files) {
                Log.log("removing ", file);
                fs.exists(path.join(parentDir, file), (exists) => {
                    if (exists) {
                        fs.unlink(path.join(parentDir, file), (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                counter--;
                                if (!counter) {
                                    Log.log("done");
                                    resolve();
                                }
                            }
                        });
                    } else {
                        counter--;
                        if (!counter) {
                            Log.log("done");
                            resolve();
                        }
                    }
                });
            }
        } else {
            return;
        }
    } else {
        return;
    }
};

module.exports.moveCleanClone = async (repo, from, to) => {
    const items = await fs.promises.readdir(from);
    if (to.charAt(to.length - 1) === "/") {
        to = to.substring(0, to.length - 1);
    }
    let counter = items.length;
    for (let i = 0; i < items.length; i++) {
        Log.log(
            "moving",
            path.join(from, items[i]),
            " >> ",
            path.join(to, items[i])
        );
        await fse.move(path.join(from, items[i]), path.join(to, items[i]), {
            overwrite: true,
        });
        counter--;
        if (counter === 0) {
            return;
        }
    }
};

module.exports.execShell = function (repo, dir) {
    Log.log("exec shell");
    return new Promise((resolve, reject) => {
        // execute multiple commands in series
        if (repo.exec) {
            if (repo.exec.after && repo.exec.after.length) {
                Log.log("exec commands", process.cwd());
                let cmds = repo.exec.after.map((item) => {
                    return (
                        path.join(dir, item) +
                        " " +
                        path.join(process.cwd(), dir)
                    );
                });
                Log.log(cmds.join("\n"));
                shell.series(cmds, function (err) {
                    if (err) {
                        Log.log(err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
};

module.exports.cloneRoutine = function (repo, to) {
    return new Promise((resolve, reject) => {
        let tmpDir = module.exports.mkTmpDir();
        module.exports
            .cloneRepo(repo, tmpDir)
            .then(() => module.exports.clearRepo(repo, tmpDir))
            .then(() => fse.ensureDir(path.join(to, repo.dir)))
            .then(() =>
                module.exports.moveCleanClone(
                    repo,
                    tmpDir,
                    path.join(to, repo.dir)
                )
            )
            .then(() => module.exports.execShell(repo, path.join(to, repo.dir)))
            .then(resolve)
            .catch(reject);
    });
};

module.exports.cloneParents = function (repo, to) {
    Log.log("Cloning parents...");
    return new Promise((resolve, reject) => {
        if (repos && repo && repo.extends && repo.extends.length > 0) {
            let counter = repo.extends.length;
            for (let dep of repo.extends) {
                Log.log("Cloning parent", repos[dep].url);
                module.exports
                    .cloneRoutine(repos[dep], to)
                    .then(() => {
                        counter--;
                        if (!counter) {
                            resolve();
                        }
                    })
                    .catch(reject);
            }
        } else {
            resolve();
        }
    });
};

module.exports.rootCloneRoutine = function (repo, to) {
    Log.log("Clone root project", repo.url, "to", to);
    return new Promise((resolve, reject) => {
        let tmpDir = module.exports.mkTmpDir();
        Log.log("tmp dir", tmpDir);
        fse.ensureDir(path.join(to, repo.dir))
            .then(() => fse.emptyDir(path.join(to, repo.dir)))
            .then(() =>
                module.exports.cloneParents(repo, path.join(to, repo.dir))
            )
            .then(() => module.exports.cloneRepo(repo, tmpDir))
            .then(() =>
                module.exports.moveCleanClone(
                    repo,
                    tmpDir,
                    path.join(to, repo.dir)
                )
            )
            .then(() => module.exports.execShell(repo, path.join(to, repo.dir)))
            .then(resolve)
            .catch(reject);
    });
};

module.exports.renderScript = function (input, options, dest) {
    return new Promise((resolve, reject) => {
        let js = ejs.renderFile(input, options, (err, res) => {
            if (err) {
                reject(err);
            } else {
                fs.writeFile(dest, res, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

module.exports.getConfReader = function (pathToConfig) {
    nconf.argv().env("__").file({
        file: pathToConfig,
    });
    return nconf;
};

/**
 *  Joins many files in one
 *  @param   {string}  target    result file path
 *  @param   {array}    sources   list of source files
 *  @param  {splitter}  splitter  file splitter
 */
module.exports.joinToFile = function (target, sources, splitter = "\n") {
    return new Promise((resolve, reject) => {
        try {
            fse.ensureFileSync(target);
            let data = [];
            for (let t in sources) {
                let file = fs.readFileSync(sources[t]);
                if (process.NODE_ENV !== "production") {
                    data.push("<!-- start:  " + sources[t] + " -->");
                }
                data.push(file);
                if (process.NODE_ENV !== "production") {
                    data.push("<!-- end:  " + sources[t] + " -->");
                }
            }
            fse.outputFileSync(target, data.join(splitter));
            resolve();
        } catch (e) {
            resject(e);
        }
    });
};
