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
var express_1 = __importDefault(require("express"));
var index_1 = require("../index");
var router = express_1["default"].Router();
router.get("/allGoals", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goals, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.prisma.goal.findMany({
                    where: {
                        userId: res.locals.user.id
                    },
                    include: { commits: true, groups: true }
                })];
            case 1:
                goals = _a.sent();
                result = goals.map(function (goal) {
                    return __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.get("/goalQuery", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var goals, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, index_1.prisma.goal.findMany({
                    where: {
                        userId: res.locals.user.id
                    },
                    select: {
                        id: true,
                        description: true,
                        completed: true,
                        groups: { select: { groupId: true } }
                    }
                })];
            case 1:
                goals = _a.sent();
                result = goals.map(function (goal) {
                    return __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/getGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, goal, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, index_1.prisma.goal.findUnique({
                        where: {
                            id: id
                        },
                        include: {
                            commits: {
                                orderBy: {
                                    createdAt: "desc"
                                }
                            },
                            groups: {
                                include: {
                                    userGroup: {
                                        include: { group: { select: { name: true } } }
                                    }
                                }
                            }
                        }
                    })];
            case 1:
                goal = _a.sent();
                if (!goal) {
                    res.json(null);
                    return [2 /*return*/];
                }
                result = __assign(__assign({}, goal), { groups: goal === null || goal === void 0 ? void 0 : goal.groups.map(function (group) { return ({
                        id: group.groupId,
                        name: group.userGroup.group.name
                    }); }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/createGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var description, goal, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                description = req.body.description;
                return [4 /*yield*/, index_1.prisma.goal.create({
                        data: {
                            userId: res.locals.user.id,
                            description: description
                        },
                        select: {
                            id: true,
                            description: true,
                            completed: true,
                            groups: { select: { groupId: true } }
                        }
                    })];
            case 1:
                goal = _a.sent();
                result = __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/createGoalInGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, description, groupId, goal, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, description = _a.description, groupId = _a.groupId;
                return [4 /*yield*/, index_1.prisma.goal.create({
                        data: {
                            userId: res.locals.user.id,
                            description: description,
                            groups: {
                                create: {
                                    userGroup: {
                                        connect: {
                                            userId_groupId: {
                                                userId: res.locals.user.id,
                                                groupId: groupId
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        select: {
                            id: true,
                            description: true,
                            completed: true,
                            groups: { select: { groupId: true } }
                        }
                    })];
            case 1:
                goal = _b.sent();
                result = __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/addGoalToGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, groupId, goal, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, goalId = _a.goalId, groupId = _a.groupId;
                return [4 /*yield*/, index_1.prisma.goal.update({
                        where: {
                            id: goalId
                        },
                        data: {
                            groups: {
                                create: {
                                    userGroup: {
                                        connect: {
                                            userId_groupId: {
                                                userId: res.locals.user.id,
                                                groupId: groupId
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        select: {
                            id: true,
                            description: true,
                            completed: true,
                            groups: { select: { groupId: true } }
                        }
                    })];
            case 1:
                goal = _b.sent();
                result = __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/removeGoalFromGroup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, groupId, goal, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, goalId = _a.goalId, groupId = _a.groupId;
                return [4 /*yield*/, index_1.prisma.goal.update({
                        where: {
                            id: goalId
                        },
                        data: {
                            groups: {
                                "delete": {
                                    groupId_goalId: {
                                        groupId: groupId,
                                        goalId: goalId
                                    }
                                }
                            }
                        },
                        select: {
                            id: true,
                            description: true,
                            completed: true,
                            groups: { select: { groupId: true } }
                        }
                    })];
            case 1:
                goal = _b.sent();
                result = __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/deleteGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, goal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, index_1.prisma.goal["delete"]({
                        where: {
                            id: id
                        }
                    })];
            case 1:
                goal = _a.sent();
                res.json(goal);
                return [2 /*return*/];
        }
    });
}); });
router.post("/editGoal", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, description, completed, goal, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, id = _a.id, description = _a.description, completed = _a.completed;
                return [4 /*yield*/, index_1.prisma.goal.update({
                        where: {
                            id: id
                        },
                        data: {
                            description: description,
                            completed: completed
                        },
                        select: {
                            id: true,
                            description: true,
                            completed: true,
                            groups: { select: { groupId: true } }
                        }
                    })];
            case 1:
                goal = _b.sent();
                result = __assign(__assign({}, goal), { groups: goal.groups.map(function (group) { return group.groupId; }) });
                res.json(result);
                return [2 /*return*/];
        }
    });
}); });
router.post("/createCommit", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, goalId, description, hours, commit;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, goalId = _a.goalId, description = _a.description, hours = _a.hours;
                if (!description && !hours)
                    res.status(400).json({ error: "Specify description or hours" });
                return [4 /*yield*/, index_1.prisma.commit.create({
                        data: {
                            goalId: goalId,
                            description: description,
                            hours: hours
                        }
                    })];
            case 1:
                commit = _b.sent();
                res.json(commit);
                return [2 /*return*/];
        }
    });
}); });
router.post("/deleteCommit", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, commit;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                return [4 /*yield*/, index_1.prisma.commit["delete"]({
                        where: {
                            id: id
                        }
                    })];
            case 1:
                commit = _a.sent();
                res.json(commit);
                return [2 /*return*/];
        }
    });
}); });
router.post("/editCommit", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, id, description, hours, commit;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, id = _a.id, description = _a.description, hours = _a.hours;
                return [4 /*yield*/, index_1.prisma.commit.update({
                        where: {
                            id: id
                        },
                        data: {
                            description: description,
                            hours: hours
                        }
                    })];
            case 1:
                commit = _b.sent();
                res.json(commit);
                return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
//# sourceMappingURL=goals.js.map