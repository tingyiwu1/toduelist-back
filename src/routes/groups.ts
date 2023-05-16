import { Prisma } from '@prisma/client'
import express from 'express'
import { prisma } from '../index'

const router = express.Router()

// for testing
router.get('/allGroups', async (req, res) => {
    const groups = await prisma.group.findMany({
        where: {
            users: {
                some: {
                    userId: res.locals.user.id
                }
            }
        },
        include: { users: true }
    })
    res.json(groups)
})

router.post('/createGroup', async (req, res) => {
    const { name, timeZone } = req.body
    const group = await prisma.group.create({
        data: {
            name: name,
            timeZone: timeZone,
            users: {
                create: {
                    userId: res.locals.user.id
                }
            }
        }
    })
    res.json(group)
})

router.post('/joinGroup', async (req, res) => {
    const { id } = req.body
    const group = await prisma.group.update({
        where: {
            id: id
        },
        data: {
            users: {
                create: {
                    userId: res.locals.user.id
                }
            }
        }
    })
    res.json(group)
})

router.post('/leaveGroup', async (req, res) => {
    const { id } = req.body

    const usergroup = await prisma.userGroup.delete({
        where: {
            userId_groupId: {
                userId: res.locals.user.id,
                groupId: id
            }
        }
    })

    // delete group if no users left
    const num_users = await prisma.userGroup.count({
        where: {
            groupId: id
        }
    })
    if (num_users == 0) {
        const group = await prisma.group.delete({
            where: {
                id: id
            }
        })
    }
    res.json(usergroup)
})

router.post('/addGoal', async (req, res) => {
    const { goalId, groupId } = req.body
    const usergroupgoal = await prisma.userGroupGoal.create({
        data: {
            userId: res.locals.user.id,
            groupId: groupId,
            goalId: goalId
        }
    })
    res.json(usergroupgoal)
})

router.post('/removeGoal', async (req, res) => {
    const { goalId, groupId } = req.body
    const usergroupgoal = await prisma.userGroupGoal.delete({
        where: {
            groupId_goalId: {
                groupId: groupId,
                goalId: goalId
            }
        }
    })
    res.json(usergroupgoal)
})

router.get('/leaderboard', async (req, res) => {
    const { groupId } = req.body
    const group = await prisma.group.findUniqueOrThrow({
        where: {
            id: groupId
        },
        include: {
            users: true
        }
    })

    const userGroupGoals = await prisma.userGroupGoal.findMany({
        where: {
            groupId: groupId
        },
        include: {
            goal: {
                include: {
                    commits: true,
                }
            }
        }
    })

    const userScores: Record<string, number> = {}
    for (const user of group.users) {
        userScores[user.userId] = 0
    }

    const dayStart = startOfDay(new Date(), group.timeZone)

    for (const userGroupGoal of userGroupGoals) {
        for (const commit of userGroupGoal.goal.commits) {
            if (commit.createdAt >= dayStart) {
                userScores[userGroupGoal.userId] += commit.hours ?? 0
            }
        }
    }

    const leaderboard = Object.entries(userScores)
        .sort((a, b) => b[1] - a[1])

    res.json(leaderboard)
})

function startOfDay(date: Date, timeZone: string) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
        timeZone: timeZone
    })

    const [hourOffset, minuteOffset, secondOffset] = formatter.format(date).split(':')
        .map((x: string) => parseInt(x)) // "12:34:56" -> [12, 34, 56]

    const d = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours() - hourOffset,
        date.getUTCMinutes() - minuteOffset,
        date.getUTCSeconds() - secondOffset
    ))

    return d

}

export default router