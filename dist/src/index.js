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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.prisma = void 0;
var client_1 = require("@prisma/client");
var express_1 = __importDefault(require("express"));
require("express-async-errors");
var cors_1 = __importDefault(require("cors"));
var OAuth2Client = require("google-auth-library").OAuth2Client;
require("dotenv").config();
var goals_1 = __importDefault(require("./routes/goals"));
var groups_1 = __importDefault(require("./routes/groups"));
exports.prisma = new client_1.PrismaClient();
var app = (0, express_1["default"])();
var clientId = process.env.CLIENT_ID;
var client = new OAuth2Client(clientId);
app.use((0, cors_1["default"])({
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
        "https://tingyiwu1.github.io",
    ]
}));
app.use(express_1["default"].json());
app.use(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var ticket, payload, userId, user, impersonatingUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, client.verifyIdToken({
                    idToken: req.headers.authorization,
                    requiredAudience: clientId
                })];
            case 1:
                ticket = _a.sent();
                payload = ticket.getPayload();
                userId = payload["sub"];
                return [4 /*yield*/, exports.prisma.user.upsert({
                        where: {
                            id: userId
                        },
                        update: {},
                        create: {
                            id: userId,
                            name: payload["name"],
                            email: payload["email"],
                            real: true
                        }
                    })];
            case 2:
                user = _a.sent();
                if (!user.impersonatingId) return [3 /*break*/, 4];
                return [4 /*yield*/, exports.prisma.user.findUnique({
                        where: {
                            id: user.impersonatingId
                        }
                    })];
            case 3:
                impersonatingUser = _a.sent();
                res.locals.user = impersonatingUser;
                return [3 /*break*/, 5];
            case 4:
                res.locals.user = user;
                _a.label = 5;
            case 5:
                next();
                return [2 /*return*/];
        }
    });
}); });
app.get("/user", function (req, res) {
    res.json(res.locals.user);
});
app.post("/impersonate", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, realUserId, fakeUserId, realUser_1, fakeUser, realUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, realUserId = _a.realUserId, fakeUserId = _a.fakeUserId;
                if (!(realUserId === fakeUserId)) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.prisma.user.update({
                        where: {
                            id: realUserId
                        },
                        data: {
                            impersonating: {
                                disconnect: true
                            }
                        }
                    })];
            case 1:
                realUser_1 = _b.sent();
                console.log("".concat(realUser_1.name, " is no longer impersonating anyone"));
                res.json(realUser_1);
                return [2 /*return*/];
            case 2: return [4 /*yield*/, exports.prisma.user.findUniqueOrThrow({
                    where: {
                        id: fakeUserId
                    }
                })];
            case 3:
                fakeUser = _b.sent();
                if (fakeUser.real) {
                    res.status(400).send("Cannot impersonate real user");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, exports.prisma.user.update({
                        where: {
                            id: realUserId
                        },
                        data: {
                            impersonating: {
                                connect: {
                                    id: fakeUserId
                                }
                            }
                        }
                    })];
            case 4:
                realUser = _b.sent();
                console.log("".concat(realUser.name, " is now impersonating ").concat(fakeUser.name));
                res.json(fakeUser);
                return [2 /*return*/];
        }
    });
}); });
app.get("/getFakeUsers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var fakeUsers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.prisma.user.findMany({
                    where: {
                        real: false
                    }
                })];
            case 1:
                fakeUsers = _a.sent();
                res.json(fakeUsers);
                return [2 /*return*/];
        }
    });
}); });
app.use("/goals", goals_1["default"]);
app.use("/groups", groups_1["default"]);
app.get("/allUsers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.prisma.user.findMany({
                    include: { groups: true, goals: { include: { commits: true } } }
                })];
            case 1:
                users = _a.sent();
                res.json(users);
                return [2 /*return*/];
        }
    });
}); });
var server = app.listen(3000, function () {
    return console.log("\n\uD83D\uDE80 Server ready at: http://localhost:3000\n\u2B50\uFE0F See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api");
});
//# sourceMappingURL=index.js.map