import { Prisma } from "@prisma/client";
import express from "express";
import { prisma } from "../index";

const router = express.Router();

router.get("/goalQuery", async (req, res) => {
    const goals = await prisma.goal.findMany({
        where: {
            userId: res.locals.user.id,
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = goals.map((goal) => {
        return { ...goal, groups: goal.groups.map((group) => group.groupId) };
    });
    res.json(result);
});

router.post("/getGoal", async (req, res) => {
    const { id } = req.body;
    const goal = await prisma.goal.findUnique({
        where: {
            id: id,
        },
        include: {
            commits: {
                orderBy: {
                    createdAt: "desc",
                },
            },
            groups: {
                include: {
                    userGroup: {
                        include: { group: { select: { name: true } } },
                    },
                },
            },
        },
    });
    if (!goal) {
        res.json(null);
        return;
    }
    const result = {
        ...goal,
        groups: goal?.groups.map((group) => ({
            id: group.groupId,
            name: group.userGroup.group.name,
        })),
    };
    res.json(result);
});

router.post("/createGoal", async (req, res) => {
    const { description } = req.body;
    const goal = await prisma.goal.create({
        data: {
            userId: res.locals.user.id,
            description: description,
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = {
        ...goal,
        groups: goal.groups.map((group) => group.groupId),
    };
    res.json(result);
});

router.post("/createGoalInGroup", async (req, res) => {
    const { description, groupId } = req.body;
    const goal = await prisma.goal.create({
        data: {
            userId: res.locals.user.id,
            description: description,
            groups: {
                create: {
                    userGroup: {
                        connect: {
                            userId_groupId: {
                                userId: res.locals.user.id,
                                groupId: groupId,
                            },
                        },
                    },
                },
            },
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = {
        ...goal,
        groups: goal.groups.map((group) => group.groupId),
    };
    res.json(result);
});

router.post("/addGoalToGroup", async (req, res) => {
    const { goalId, groupId } = req.body;
    const goal = await prisma.goal.update({
        where: {
            id: goalId,
        },
        data: {
            groups: {
                create: {
                    userGroup: {
                        connect: {
                            userId_groupId: {
                                userId: res.locals.user.id,
                                groupId: groupId,
                            },
                        },
                    },
                },
            },
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = {
        ...goal,
        groups: goal.groups.map((group) => group.groupId),
    };
    res.json(result);
});

router.post("/removeGoalFromGroup", async (req, res) => {
    const { goalId, groupId } = req.body;
    const goal = await prisma.goal.update({
        where: {
            id: goalId,
        },
        data: {
            groups: {
                delete: {
                    groupId_goalId: {
                        groupId: groupId,
                        goalId: goalId,
                    },
                },
            },
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = {
        ...goal,
        groups: goal.groups.map((group) => group.groupId),
    };
    res.json(result);
});

router.post("/deleteGoal", async (req, res) => {
    const { id } = req.body;
    const goal = await prisma.goal.delete({
        where: {
            id: id,
        },
    });
    res.json(goal);
});

router.post("/editGoal", async (req, res) => {
    const { id, description, completed } = req.body;
    const goal = await prisma.goal.update({
        where: {
            id: id,
        },
        data: {
            description: description,
            completed: completed,
        },
        select: {
            id: true,
            description: true,
            completed: true,
            groups: { select: { groupId: true } },
        },
    });
    const result = {
        ...goal,
        groups: goal.groups.map((group) => group.groupId),
    };
    res.json(result);
});

router.post("/createCommit", async (req, res) => {
    const { goalId, description, hours } = req.body;
    if (!description && !hours)
        res.status(400).json({ error: "Specify description or hours" });
    const commit = await prisma.commit.create({
        data: {
            goalId: goalId,
            description: description,
            hours: hours,
        },
    });
    res.json(commit);
});

router.post("/deleteCommit", async (req, res) => {
    const { id } = req.body;
    const commit = await prisma.commit.delete({
        where: {
            id: id,
        },
    });
    res.json(commit);
});

router.post("/editCommit", async (req, res) => {
    const { id, description, hours } = req.body;
    const commit = await prisma.commit.update({
        where: {
            id: id,
        },
        data: {
            description: description,
            hours: hours,
        },
    });
    res.json(commit);
});

export default router;
