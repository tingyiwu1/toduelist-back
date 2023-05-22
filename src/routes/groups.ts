import { Prisma } from "@prisma/client";
import express from "express";
import { prisma } from "../index";
import { randString } from "../util";

const router = express.Router();

router.get("/allGroups", async (req, res) => {
    const groups = await prisma.group.findMany({
        where: {
            users: {
                some: {
                    userId: res.locals.user.id,
                },
            },
        },
        select: {
            id: true,
            name: true,
            timeZone: true,
            joinCode: true,
            users: { include: { user: true } },
        },
    });
    const result = groups.map((group) => {
        return { ...group, users: group.users.map((user) => user.user) };
    });
    res.json(result);
});

router.post("/getGroupByJoinCode", async (req, res) => {
    const { joinCode } = req.body;
    const group = await prisma.group.findUnique({
        where: {
            joinCode: joinCode,
        },
        select: {
            id: true,
            name: true,
            timeZone: true,
            joinCode: true,
        },
    });
    res.json(group);
});

router.post("/createGroup", async (req, res) => {
    const { name, timeZone } = req.body;
    const group = await prisma.group.create({
        data: {
            name: name,
            timeZone: timeZone,
            joinCode: randString(10),
            users: {
                create: {
                    userId: res.locals.user.id,
                },
            },
        },
        select: {
            id: true,
            name: true,
            timeZone: true,
            joinCode: true,
        },
    });
    res.json(group);
});

router.post("/joinGroup", async (req, res) => {
    const { joinCode } = req.body;
    try {
        const group = await prisma.group.update({
            where: {
                joinCode: joinCode,
            },
            data: {
                users: {
                    create: {
                        userId: res.locals.user.id,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                timeZone: true,
                joinCode: true,
            },
        });
        res.json(group);
    } catch (e) {
        if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
        ) {
            res.json(null);
        }
    }
});

router.post("/leaveGroup", async (req, res) => {
    const { id } = req.body;

    const usergroup = await prisma.userGroup.delete({
        where: {
            userId_groupId: {
                userId: res.locals.user.id,
                groupId: id,
            },
        },
    });

    // delete group if no users left
    const num_users = await prisma.userGroup.count({
        where: {
            groupId: id,
        },
    });
    if (num_users == 0) {
        await prisma.group.delete({
            where: {
                id: id,
            },
        });
    }
    res.json(usergroup);
});

router.post("/editGroup", async (req, res) => {
    const { id, name, timeZone } = req.body;
    const group = await prisma.group.update({
        where: {
            id: id,
        },
        data: {
            name: name,
            timeZone: timeZone,
        },
        select: {
            id: true,
            name: true,
            timeZone: true,
            joinCode: true,
            users: { include: { user: true } },
        },
    });
    const result = { ...group, users: group.users.map((user) => user.user) };
    res.json(result);
});

router.post("/addGoal", async (req, res) => {
    const { goalId, groupId } = req.body;
    const usergroupgoal = await prisma.userGroupGoal.create({
        data: {
            userId: res.locals.user.id,
            groupId: groupId,
            goalId: goalId,
        },
    });
    res.json(usergroupgoal);
});

router.post("/removeGoal", async (req, res) => {
    const { goalId, groupId } = req.body;
    const usergroupgoal = await prisma.userGroupGoal.delete({
        where: {
            groupId_goalId: {
                groupId: groupId,
                goalId: goalId,
            },
        },
    });
    res.json(usergroupgoal);
});

router.post("/leaderboard", async (req, res) => {
    const { groupId } = req.body;
    const group = await prisma.group.findUniqueOrThrow({
        where: {
            id: groupId,
        },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
        },
    });

    const userGroupGoals = await prisma.userGroupGoal.findMany({
        where: {
            groupId: groupId,
        },
        include: {
            goal: {
                include: {
                    commits: true,
                },
            },
        },
    });

    const userScores: Record<string, number> = {};
    for (const user of group.users) {
        userScores[user.userId] = 0;
    }

    const dayStart = startOfDay(new Date(), group.timeZone);

    for (const userGroupGoal of userGroupGoals)
        for (const commit of userGroupGoal.goal.commits)
            if (commit.createdAt >= dayStart)
                userScores[userGroupGoal.userId] += commit.hours ?? 0;

    const leaderboard = group.users
        .map((userGroup) => ({
            user: userGroup.user,
            score: Math.round(userScores[userGroup.userId] * 10) / 10,
        }))
        .sort((a, b) => b.score - a.score);

    res.json(leaderboard);
});

function startOfDay(date: Date, timeZone: string) {
    const formatter = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        timeZone: timeZone,
    });

    const [hourOffset, minuteOffset, secondOffset] = formatter
        .format(date)
        .split(":")
        .map((x: string) => parseInt(x)); // "12:34:56" -> [12, 34, 56]

    const d = new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours() - hourOffset,
            date.getUTCMinutes() - minuteOffset,
            date.getUTCSeconds() - secondOffset
        )
    );

    return d;
}

export default router;
