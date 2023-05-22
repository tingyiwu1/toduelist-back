"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var express_1 = __importDefault(require("express"));
var index_1 = require("../index");
var util_1 = require("../util");
var router = express_1["default"].Router();
router.get("/allGroups", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var groups, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.prisma.group.findMany({
                    where: {
                        users: {
                            some: {
                                userId: res.locals.user.id
                            }
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        timeZone: true,
                        joinCode: true,
                        users: { include: { user: true } }
                    }
                })];
            case 1:
                groups = _a.sent();
                result = groups.map(function (group) {
                    return __assign(__assign({}, group), { users: group.users.map(function (user) { return user.user; }) });
                });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/getGroupByJoinCode", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var joinCode, group;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                joinCode = req.body.joinCode;
                return [4 /*yield*/, index_1.prisma.group.findUnique({
                        where: {
                            joinCode: joinCode
                        },
                        select: {
                            id: true,
                            name: true,
                            timeZone: true,
                            joinCode: true
                        }
                    })];
            case 1:
                group = _a.sent();
                res.json(group);
                return [2 /*return*/];
        }
    });
}); });
router.post("/createGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, timeZone, group;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, timeZone = _a.timeZone;
                return [4 /*yield*/, index_1.prisma.group.create({
                        data: {
                            name: name,
                            timeZone: timeZone,
                            joinCode: (0, util_1.randString)(10),
                            users: {
                                create: {
                                    userId: res.locals.user.id
                                }
                            }
                        },
                        select: {
                            id: true,
                            name: true,
                            timeZone: true,
                            joinCode: true
                        }
                    })];
            case 1:
                group = _b.sent();
                res.json(group);
                return [2 /*return*/];
        }
    });
}); });
router.post("/joinGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var joinCode, group, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                joinCode = req.body.joinCode;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, index_1.prisma.group.update({
                        where: {
                            joinCode: joinCode
                        },
                        data: {
                            users: {
                                create: {
                                    userId: res.locals.user.id
                                }
                            }
                        },
                        select: {
                            id: true,
                            name: true,
                            timeZone: true,
                            joinCode: true
                        }
                    })];
            case 2:
                group = _a.sent();
                res.json(group);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                if (e_1 instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    e_1.code === "P2002") {
                    res.json(null);
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/leaveGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, usergroup, num_users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, index_1.prisma.userGroup["delete"]({
                        where: {
                            userId_groupId: {
                                userId: res.locals.user.id,
                                groupId: id
                            }
                        }
                    })];
            case 1:
                usergroup = _a.sent();
                return [4 /*yield*/, index_1.prisma.userGroup.count({
                        where: {
                            groupId: id
                        }
                    })];
            case 2:
                num_users = _a.sent();
                if (!(num_users == 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, index_1.prisma.group["delete"]({
                        where: {
                            id: id
                        }
                    })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                res.json(usergroup);
                return [2 /*return*/];
        }
    });
}); });
router.post("/editGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, name, timeZone, group, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, id = _a.id, name = _a.name, timeZone = _a.timeZone;
                return [4 /*yield*/, index_1.prisma.group.update({
                        where: {
                            id: id
                        },
                        data: {
                            name: name,
                            timeZone: timeZone
                        },
                        select: {
                            id: true,
                            name: true,
                            timeZone: true,
                            joinCode: true,
                            users: { include: { user: true } }
                        }
                    })];
            case 1:
                group = _b.sent();
                result = __assign(__assign({}, group), { users: group.users.map(function (user) { return user.user; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/addGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, groupId, usergroupgoal;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, goalId = _a.goalId, groupId = _a.groupId;
                return [4 /*yield*/, index_1.prisma.userGroupGoal.create({
                        data: {
                            userId: res.locals.user.id,
                            groupId: groupId,
                            goalId: goalId
                        }
                    })];
            case 1:
                usergroupgoal = _b.sent();
                res.json(usergroupgoal);
                return [2 /*return*/];
        }
    });
}); });
router.post("/removeGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, groupId, usergroupgoal;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, goalId = _a.goalId, groupId = _a.groupId;
                return [4 /*yield*/, index_1.prisma.userGroupGoal["delete"]({
                        where: {
                            groupId_goalId: {
                                groupId: groupId,
                                goalId: goalId
                            }
                        }
                    })];
            case 1:
                usergroupgoal = _b.sent();
                res.json(usergroupgoal);
                return [2 /*return*/];
        }
    });
}); });
router.post("/leaderboard", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var groupId, group, userGroupGoals, userScores, _i, _a, user, dayStart, _b, userGroupGoals_1, userGroupGoal, _c, _d, commit, leaderboard;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                groupId = req.body.groupId;
                return [4 /*yield*/, index_1.prisma.group.findUniqueOrThrow({
                        where: {
                            id: groupId
                        },
                        include: {
                            users: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    })];
            case 1:
                group = _f.sent();
                return [4 /*yield*/, index_1.prisma.userGroupGoal.findMany({
                        where: {
                            groupId: groupId
                        },
                        include: {
                            goal: {
                                include: {
                                    commits: true
                                }
                            }
                        }
                    })];
            case 2:
                userGroupGoals = _f.sent();
                userScores = {};
                for (_i = 0, _a = group.users; _i < _a.length; _i++) {
                    user = _a[_i];
                    userScores[user.userId] = 0;
                }
                dayStart = startOfDay(new Date(), group.timeZone);
                for (_b = 0, userGroupGoals_1 = userGroupGoals; _b < userGroupGoals_1.length; _b++) {
                    userGroupGoal = userGroupGoals_1[_b];
                    for (_c = 0, _d = userGroupGoal.goal.commits; _c < _d.length; _c++) {
                        commit = _d[_c];
                        if (commit.createdAt >= dayStart)
                            userScores[userGroupGoal.userId] += (_e = commit.hours) !== null && _e !== void 0 ? _e : 0;
                    }
                }
                leaderboard = group.users
                    .map(function (userGroup) { return ({
                    user: userGroup.user,
                    score: Math.round(userScores[userGroup.userId] * 10) / 10
                }); })
                    .sort(function (a, b) { return b.score - a.score; });
                res.json(leaderboard);
                return [2 /*return*/];
        }
    });
}); });
function startOfDay(date, timeZone) {
    var formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: timeZone
    });
    var _a = formatter
        .format(date)
        .split(":")
        .map(function (x) { return parseInt(x); }), hourOffset = _a[0], minuteOffset = _a[1], secondOffset = _a[2]; // "12:34:56" -> [12, 34, 56]
    var d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours() - hourOffset, date.getUTCMinutes() - minuteOffset, date.getUTCSeconds() - secondOffset));
    return d;
}
exports["default"] = router;
//# sourceMappingURL=groups.js.map