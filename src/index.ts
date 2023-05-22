import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
require("express-async-errors");
import cors from "cors";
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

import goals from "./routes/goals";
import groups from "./routes/groups";

export const prisma = new PrismaClient();
const app = express();

const clientId = process.env.CLIENT_ID;
const client = new OAuth2Client(clientId);

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://tingyiwu1.github.io",
        ],
    })
);
app.use(express.json());
app.use(async (req, res, next) => {
    const ticket = await client.verifyIdToken({
        idToken: req.headers.authorization,
        requiredAudience: clientId,
    });
    const payload = ticket.getPayload();
    const userId = payload["sub"];
    const user = await prisma.user.upsert({
        where: {
            id: userId,
        },
        update: {},
        create: {
            id: userId,
            name: payload["name"],
            email: payload["email"],
            real: true,
        },
    });
    if (user.impersonatingId) {
        const impersonatingUser = await prisma.user.findUnique({
            where: {
                id: user.impersonatingId,
            },
        });
        res.locals.user = impersonatingUser;
    } else {
        res.locals.user = user;
    }
    next();
});

app.get("/user", (req, res) => {
    res.json(res.locals.user);
});

app.post("/impersonate", async (req, res) => {
    const { realUserId, fakeUserId } = req.body;

    if (realUserId === fakeUserId) {
        const realUser = await prisma.user.update({
            where: {
                id: realUserId,
            },
            data: {
                impersonating: {
                    disconnect: true,
                },
            },
        });
        console.log(`${realUser.name} is no longer impersonating anyone`);
        res.json(realUser);
        return;
    }

    const fakeUser = await prisma.user.findUniqueOrThrow({
        where: {
            id: fakeUserId,
        },
    });
    if (fakeUser.real) {
        res.status(400).send("Cannot impersonate real user");
        return;
    }

    const realUser = await prisma.user.update({
        where: {
            id: realUserId,
        },
        data: {
            impersonating: {
                connect: {
                    id: fakeUserId,
                },
            },
        },
    });
    console.log(`${realUser.name} is now impersonating ${fakeUser.name}`);
    res.json(fakeUser);
});

app.get("/getFakeUsers", async (req, res) => {
    const fakeUsers = await prisma.user.findMany({
        where: {
            real: false,
        },
    });
    res.json(fakeUsers);
});

app.use("/goals", goals);
app.use("/groups", groups);

app.get("/allUsers", async (req, res) => {
    const users = await prisma.user.findMany({
        include: { groups: true, goals: { include: { commits: true } } },
    });
    res.json(users);
});

const server = app.listen(3000, () =>
    console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
