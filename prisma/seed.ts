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
    // const alice = await prisma.user.create({
    //     data: {
    //         name: 'Alice',
    //         email: 'alice@tdl.com',
    //         goals: {
    //             create: [
    //                 {
    //                     description: 'hit the gym',
    //                     commits: {
    //                         create: [
    //                             {
    //                                 hours: 3
    //                             }
    //                         ]
    //                     }
    //                 },
    //                 {
    //                     description: 'read a book',
    //                     commits: {
    //                         create: [
    //                             {
    //                                 hours: 4
    //                             }
    //                         ]
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     include: {
    //         goals: true
    //     }
    // })
    // console.log(`Created user ${alice.name} with id: ${alice.id}`)
    // const bob = await prisma.user.create({
    //     data: {
    //         name: 'Bob',
    //         email: 'bob@tdl.com',
    //         goals: {
    //             create: [
    //                 {
    //                     description: 'buy eggs',
    //                     commits: { create: [{ hours: 1 }] }
    //                 },
    //                 {
    //                     description: 'meet carol',
    //                 }
    //             ]
    //         }
    //     },
    //     include: {
    //         goals: true
    //     }
    // })
    // console.log(`Created user ${bob.name} with id: ${bob.id}`)
    // const carol = await prisma.user.create({
    //     data: {
    //         name: 'Carol',
    //         email: 'carol@tdl.com',
    //         goals: {
    //             create: [
    //                 {
    //                     description: 'organize office',
    //                     commits: { create: [{ hours: 5 }] }
    //                 },
    //                 {
    //                     description: 'pay bils',
    //                     commits: { create: [{ hours: 2 }, { hours: 3 }] }
    //                 },
    //                 {
    //                     description: 'meet bob',
    //                 }
    //             ]
    //         }
    //     }
    // })
    // console.log(`Created user ${carol.name} with id: ${carol.id}`)

    const users = await createUsers(26, 5, 20, 0, 5, 0.5)
    const groups = await createGroups(15, users, 2, 10)
    await addGoals(groups, 0.5, 0.9)

    // const alphabet = await prisma.group.create({
    //     data: {
    //         name: 'alphabet',
    //         timeZone: 'America/Los_Angeles',
    //         users: {
    //             create: [
    //                 {
    //                     user: { connect: { id: bob.id } }
    //                 },
    //                 {
    //                     user: { connect: { id: carol.id } }
    //                 },
    //             ]
    //         }
    //     },
    //     include: { users: { include: { user: { include: { goals: true } } } } }
    // })
    // console.log(`Created group ${alphabet.name} with id: ${alphabet.id}`)

    // for (const ug of alphabet.users) {
    //     for (const g of ug.user.goals) {
    //         const ugg = await prisma.userGroupGoal.create({
    //             data: {
    //                 userId: ug.userId,
    //                 groupId: alphabet.id,
    //                 goalId: g.id
    //             },
    //             include: { userGroup: { include: { group: true, user: true } }, goal: true }
    //         })
    //         console.log(`${ugg.userGroup.user.name} adds {${ugg.goal.description}} to ${ugg.userGroup.group.name}`)
    //     }
    // }
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
