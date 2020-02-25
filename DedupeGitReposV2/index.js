"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var tl = require("azure-pipelines-task-lib/task");
var fs = require("fs");
var workFolder = "" + tl.getVariable("Agent.WorkFolder");
var repository = "" + tl.getVariable("Build.Repository.Id");
var repositoryType = "" + tl.getVariable("Build.Repository.Provider");
var sourceFolder = "" + tl.getVariable("Build.Repository.LocalPath");
var sharedGitFolderName = "g";
var agentDefaultSourceFolderName = "s";
var sharedGitFolderPath = tl.resolve(workFolder, sharedGitFolderName);
var configFileName = "DedupeGitReposConfig.json";
var configFilePath = tl.resolve(sharedGitFolderPath, configFileName);
var gitProviders = ["TfsGit", "Git", "GitHub"];
var useSymlink = false;
function writeConfig(config) {
    console.log("Writing configuration to " + configFilePath);
    if (!tl.exist(sharedGitFolderPath)) {
        tl.mkdirP(sharedGitFolderPath);
    }
    tl.writeFile(configFilePath, JSON.stringify(config));
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var config, repo, sharedRepoBuildFullPath, sharedRepoBuildSourceFolder, sharedRepoBuildSourceFullPath, migrate, sourceFolderIsLink, sourceFolderTarget, sourceFolderMappingPath, sourceFolderMapping;
        return __generator(this, function (_a) {
            try {
                tl.debug("workFolder: " + workFolder);
                tl.debug("repository: " + repository);
                tl.debug("sourceFolder: " + sourceFolder);
                tl.debug("sharedGitFolderPath: " + sharedGitFolderPath);
                tl.debug("configFilePath: " + configFilePath);
                if (sourceFolder.indexOf(sharedGitFolderPath) == 0) {
                    console.log(sourceFolder + " is already using deduplicated repo at " + sourceFolder);
                    return [2 /*return*/];
                }
                if (gitProviders.indexOf(repositoryType) == -1) {
                    tl.setResult(tl.TaskResult.Failed, "Unsupported repository type " + repositoryType + "; must be one of " + gitProviders.join(","));
                    return [2 /*return*/];
                }
                if (!tl.exist(configFilePath)) {
                    console.log("Creating configuration for this agent");
                    config = {
                        description: "Configuration for Dedupe Git Repositories custom build step",
                        lastFolderId: 1,
                        repos: [
                            {
                                repository: repository,
                                path: sharedGitFolderName + "/1"
                            }
                        ]
                    };
                    writeConfig(config);
                }
                else {
                    config = JSON.parse(fs.readFileSync(configFilePath, { encoding: "utf8" }).replace(/^\uFEFF/, ''));
                }
                repo = config.repos.find(function (r) { return r.repository == repository; });
                if (!repo) {
                    console.log("Configuring repository for deduplication");
                    config.lastFolderId++;
                    repo = {
                        repository: repository,
                        path: sharedGitFolderName + "/" + config.lastFolderId.toString()
                    };
                    config.repos.push(repo);
                    writeConfig(config);
                }
                sharedRepoBuildFullPath = tl.resolve(workFolder, repo.path);
                sharedRepoBuildSourceFolder = repo.path + "/" + agentDefaultSourceFolderName;
                sharedRepoBuildSourceFullPath = tl.resolve(workFolder, sharedRepoBuildSourceFolder);
                migrate = false;
                if (useSymlink) {
                    sourceFolderIsLink = fs.lstatSync(sourceFolder).isSymbolicLink();
                    sourceFolderTarget = sourceFolderIsLink ? fs.readlinkSync(sourceFolder, { encoding: "utf8" }) : "";
                    tl.debug("sourceFolderIsLink: " + sourceFolderIsLink);
                    tl.debug("sourceFolderTarget: " + sourceFolderTarget);
                    if (sourceFolderIsLink && sourceFolderTarget == sharedRepoBuildSourceFullPath) {
                        console.log("Build already symlinked to deduped repository at " + sharedRepoBuildSourceFullPath);
                    }
                    else {
                        migrate = true;
                    }
                }
                else {
                    sourceFolderMappingPath = tl.resolve(workFolder, "SourceRootMapping", tl.getVariable("System.CollectionId"), tl.getVariable("System.DefinitionId"), "SourceFolder.json");
                    sourceFolderMapping = JSON.parse(fs.readFileSync(sourceFolderMappingPath, { encoding: "utf8" }).replace(/^\uFEFF/, ''));
                    // Test for shared repo build directory, since sourceFolderMapping.agent_builddirectory is relative to _work.
                    if (sourceFolderMapping.agent_builddirectory == repo.path) {
                        console.log("SourceFolderMapping for agent_builddirectory already in place");
                    }
                    else {
                        console.log("Changing SourceFolderMapping for agent_builddirectory to point to " + repo.path);
                        sourceFolderMapping.agent_builddirectory = repo.path;
                        tl.writeFile(sourceFolderMappingPath, JSON.stringify(sourceFolderMapping));
                        migrate = true;
                    }
                    // Test for shared repo build source folder path, since sourceFolderMapping.build_sourcesdirectory is relative to _work/agent_builddirectory.
                    if (sourceFolderMapping.build_sourcesdirectory == sharedRepoBuildSourceFolder) {
                        console.log("SourceFolderMapping for build_sourcesdirectory already in place");
                    }
                    else {
                        console.log("Changing SourceFolderMapping for build_sourcesdirectory to point to " + sharedRepoBuildSourceFolder);
                        sourceFolderMapping.build_sourcesdirectory = sharedRepoBuildSourceFolder;
                        tl.writeFile(sourceFolderMappingPath, JSON.stringify(sourceFolderMapping));
                        migrate = true;
                    }
                }
                if (migrate) {
                    console.log("Migrating build to using a deduped repository at " + sharedRepoBuildSourceFullPath);
                    if (!tl.exist(sharedRepoBuildSourceFullPath)) {
                        if (!tl.exist(sharedGitFolderPath)) {
                            console.log("Creating shared directory " + sharedGitFolderPath + " for repositories");
                            tl.mkdirP(sharedGitFolderPath);
                        }
                        if (!tl.exist(sharedRepoBuildFullPath)) {
                            console.log("Creating shared build directory " + sharedRepoBuildFullPath + " for repo");
                            tl.mkdirP(sharedRepoBuildFullPath);
                        }
                        console.log("Moving repository to shared directory from " + sourceFolder);
                        tl.mv(sourceFolder, sharedRepoBuildSourceFullPath);
                    }
                    else {
                        console.log("Repository has already been deduped, removing source folder contents for build at " + sourceFolder);
                        try {
                            tl.rmRF(sourceFolder);
                        }
                        catch (err) {
                            console.log("Could not completely remove source folder at " + sourceFolder + ". Error: " + err.message);
                        }
                    }
                    if (useSymlink) {
                        console.log("Symlinking source folder at " + sourceFolder + " to deduped repository location at " + sharedRepoBuildSourceFullPath);
                        fs.symlinkSync(sharedRepoBuildSourceFullPath, sourceFolder, "dir");
                    }
                }
                console.log("Done");
            }
            catch (err) {
                tl.setResult(tl.TaskResult.Failed, err.message);
            }
            return [2 /*return*/];
        });
    });
}
run();
