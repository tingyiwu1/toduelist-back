import { Prisma } from '@prisma/client'
import express from 'express'
import { prisma } from '../index'

const router = express.Router()

router.get('/allGoals', async (req, res) => {
    const goals = await prisma.goal.findMany({
        where: {
            userId: res.locals.user.id
        },
        include: { commits: true }
    })
    res.json(goals)
})

router.post('/createGoal', async (req, res) => {
    const { description } = req.body
    const goal = await prisma.goal.create({
        data: {
            userId: res.locals.user.id,
            description: description
        }
    })
    res.json(goal)
})

router.post('/deleteGoal', async (req, res) => {
    const { id } = req.body
    const goal = await prisma.goal.delete({
        where: {
            id: id
        }
    })
    res.json(goal)
})

router.post('/createCommit', async (req, res) => {
    const { goalId, description, hours } = req.body
    if (!description && !hours)
        res.status(400).json({ error: 'Specify description or hours' })
    const commit = await prisma.commit.create({
        data: {
            goalId: goalId,
            description: description,
            hours: hours
        }
    })
    res.json(commit)
})

router.post('/deleteCommit', async (req, res) => {
    const { id } = req.body
    const commit = await prisma.commit.delete({
        where: {
            id: id
        }
    })
    res.json(commit)
})

router.post('/setGoalCompletion', async (req, res) => {
    const { id, completed } = req.body
    const goal = await prisma.goal.update({
        where: {
            id: id
        },
        data: {
            completed: completed
        }
    })
    res.json(goal)
})

export default router