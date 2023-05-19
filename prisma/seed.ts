import { PrismaClient, Prisma, User, Group, UserGroup, Goal } from '@prisma/client'
import nameBank from './nameBank.json'
import goalBank from './goalBank.json'
import commitBank from './commitBank.json'

const prisma = new PrismaClient()

async function createUsers(n: number, numGoalsMin: number, numGoalsMax: number, numCommitsMin: number, numCommitsMax: number, completeChance: number) {
    const shuffled = nameBank.sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, n)
    return await Promise.all(
        selected.map(async (name) => {
            const user = await prisma.user.create({
                data: {
                    name: name,
                    email: `${name.toLowerCase()
                        }@tdl.com`,
                    goals: {
                        create: [
                            ...Array(Math.floor(Math.random() * (numGoalsMax - numGoalsMin + 1)) + numGoalsMin).fill(0).map(() => {
                                return {
                                    description: goalBank[Math.floor(Math.random() * goalBank.length)],
                                    completed: Math.random() < completeChance,
                                    commits: {
                                        create: [
                                            ...Array(Math.floor(Math.random() * (numCommitsMax - numCommitsMin + 1)) + numCommitsMin).fill(0).map(() => {
                                                return {
                                                    description: Math.random() < 0.5 ? undefined : commitBank[Math.floor(Math.random() * commitBank.length)],
                                                    hours: Math.round((Math.random() * 96 / ((numCommitsMin + numCommitsMax) * (numGoalsMin + numGoalsMax))) * 10) / 10
                                                }
                                            }
                                            )
                                        ]
                                    }
                                }
                            })
                        ]
                    }
                }
            })
            console.log(`Created user ${user.name} with id: ${user.id}`)
            return user
        })
    )
}

async function createGroups(n: number, users: User[], minSize: number, maxSize: number) {
    const groupSizes = Array(n).fill(0).map(() => Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize)
    const groups = await Promise.all(
        groupSizes.map(async (size) => {
            const shuffled = users.sort(() => 0.5 - Math.random())
            const selected = shuffled.slice(0, size)
            const group = await prisma.group.create({
                data: {
                    name: `${selected.map((user) => user.name.charAt(0)).join('')}`,
                    timeZone: 'America/Los_Angeles',
                    users: {
                        create: selected.map((user) => ({ user: { connect: { id: user.id } } }))
                    }
                },
                include: {
                    users: {
                        include: { user: { include: { goals: true } } }
                    }
                }
            })
            console.log(`Created group ${group.name} with id: ${group.id}`)
            return group
        })
    )
    return groups
}

async function addGoals(
    groups: (Group & { users: (UserGroup & { user: User & { goals: Goal[] } })[] })[],
    minPercent: number,
    maxPercent: number) {
    await Promise.all(
        groups.map(async (group) => {
            await Promise.all(
                group.users.map(async (usergroup) => {
                    const goals = [...usergroup.user.goals]
                    const shuffled = goals.sort(() => 0.5 - Math.random())
                    const selected = shuffled.slice(0, Math.floor(shuffled.length * (Math.random() * (maxPercent - minPercent)) + minPercent))
                    await Promise.all(
                        selected.map(async (goal) => {
                            await prisma.userGroupGoal.create({
                                data: {
                                    userId: usergroup.user.id,
                                    groupId: group.id,
                                    goalId: goal.id
                                }
                            })
                            console.log(`${usergroup.user.name} adds {${goal.description}} to ${group.name}`)
                        })
                    )
                })
            )
        })
    )
}

async function main() {
    console.log(`Start seeding ...`)

    const users = await createUsers(26, 5, 20, 0, 5, 0.5)
    const groups = await createGroups(15, users, 2, 10)
    await addGoals(groups, 0.5, 0.9)

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
