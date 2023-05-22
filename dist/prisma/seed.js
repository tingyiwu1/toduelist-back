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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var nameBank_json_1 = __importDefault(require("./nameBank.json"));
var goalBank_json_1 = __importDefault(require("./goalBank.json"));
var commitBank_json_1 = __importDefault(require("./commitBank.json"));
var util_1 = require("../src/util");
var prisma = new client_1.PrismaClient();
// blame copilot for pyramid it works and im not rewriting it
function createUsers(n, numGoalsMin, numGoalsMax, numCommitsMin, numCommitsMax, completeChance) {
    return __awaiter(this, void 0, void 0, function () {
        var shuffled, selected;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shuffled = nameBank_json_1["default"].sort(function () { return 0.5 - Math.random(); });
                    selected = shuffled.slice(0, n);
                    return [4 /*yield*/, Promise.all(selected.map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var user;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, prisma.user.create({
                                            data: {
                                                name: name,
                                                email: "".concat(name.toLowerCase(), "@tdl.com"),
                                                goals: {
                                                    create: __spreadArray([], Array(Math.floor(Math.random() * (numGoalsMax - numGoalsMin + 1)) + numGoalsMin).fill(0).map(function () {
                                                        return {
                                                            description: goalBank_json_1["default"][Math.floor(Math.random() * goalBank_json_1["default"].length)],
                                                            completed: Math.random() < completeChance,
                                                            commits: {
                                                                create: __spreadArray([], Array(Math.floor(Math.random() * (numCommitsMax - numCommitsMin + 1)) + numCommitsMin).fill(0).map(function () {
                                                                    return {
                                                                        description: Math.random() < 0.5 ? undefined : commitBank_json_1["default"][Math.floor(Math.random() * commitBank_json_1["default"].length)],
                                                                        hours: Math.ceil((Math.random() * 200 / ((numCommitsMin + numCommitsMax) * (numGoalsMin + numGoalsMax))) * 10) / 10
                                                                    };
                                                                }), true)
                                                            }
                                                        };
                                                    }), true)
                                                }
                                            }
                                        })];
                                    case 1:
                                        user = _a.sent();
                                        console.log("Created user ".concat(user.name, " with id: ").concat(user.id));
                                        return [2 /*return*/, user];
                                }
                            });
                        }); }))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function createGroups(n, users, minSize, maxSize) {
    return __awaiter(this, void 0, void 0, function () {
        var groupSizes, groups;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    groupSizes = Array(n).fill(0).map(function () { return Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize; });
                    return [4 /*yield*/, Promise.all(groupSizes.map(function (size) { return __awaiter(_this, void 0, void 0, function () {
                            var shuffled, selected, group;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        shuffled = users.sort(function () { return 0.5 - Math.random(); });
                                        selected = shuffled.slice(0, size);
                                        return [4 /*yield*/, prisma.group.create({
                                                data: {
                                                    name: "".concat(selected.map(function (user) { return user.name.charAt(0); }).join('')),
                                                    joinCode: (0, util_1.randString)(8),
                                                    timeZone: 'America/Los_Angeles',
                                                    users: {
                                                        create: selected.map(function (user) { return ({ user: { connect: { id: user.id } } }); })
                                                    }
                                                },
                                                include: {
                                                    users: {
                                                        include: { user: { include: { goals: true } } }
                                                    }
                                                }
                                            })];
                                    case 1:
                                        group = _a.sent();
                                        console.log("Created group ".concat(group.name, " with id: ").concat(group.id));
                                        return [2 /*return*/, group];
                                }
                            });
                        }); }))];
                case 1:
                    groups = _a.sent();
                    return [2 /*return*/, groups];
            }
        });
    });
}
function addGoals(groups, minPercent, maxPercent) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(groups.map(function (group) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, Promise.all(group.users.map(function (usergroup) { return __awaiter(_this, void 0, void 0, function () {
                                        var goals, shuffled, selected;
                                        var _this = this;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    goals = __spreadArray([], usergroup.user.goals, true);
                                                    shuffled = goals.sort(function () { return 0.5 - Math.random(); });
                                                    selected = shuffled.slice(0, Math.floor(shuffled.length * (Math.random() * (maxPercent - minPercent)) + minPercent));
                                                    return [4 /*yield*/, Promise.all(selected.map(function (goal) { return __awaiter(_this, void 0, void 0, function () {
                                                            return __generator(this, function (_a) {
                                                                switch (_a.label) {
                                                                    case 0: return [4 /*yield*/, prisma.userGroupGoal.create({
                                                                            data: {
                                                                                userId: usergroup.user.id,
                                                                                groupId: group.id,
                                                                                goalId: goal.id
                                                                            }
                                                                        })];
                                                                    case 1:
                                                                        _a.sent();
                                                                        console.log("".concat(usergroup.user.name, " adds {").concat(goal.description, "} to ").concat(group.name));
                                                                        return [2 /*return*/];
                                                                }
                                                            });
                                                        }); }))];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }))];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var users, groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Start seeding ...");
                    return [4 /*yield*/, createUsers(26, 10, 30, 0, 8, 0.5)];
                case 1:
                    users = _a.sent();
                    return [4 /*yield*/, createGroups(20, users, 2, 15)];
                case 2:
                    groups = _a.sent();
                    return [4 /*yield*/, addGoals(groups, 0.5, 0.9)];
                case 3:
                    _a.sent();
                    console.log("Seeding finished.");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })["catch"](function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error(e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
//# sourceMappingURL=seed.js.map