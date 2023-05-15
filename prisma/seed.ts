import { PrismaClient, Prisma, User } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
    {
        name: 'Alice',
        email: 'alice@tdl.com',
        goals: {
            create: [
                {
                    description: 'hit the gym',
                    commits: {
                        create: [
                            {
                                hours: 3
                            }
                        ]
                    }
                },
                {
                    description: 'read a book',
                    commits: {
                        create: [
                            {
                                hours: 4
                            }
                        ]
                    }
                }
            ]
        }
    },
    {
        name: 'Bob',
        email: 'bob@tdl.com',
        goals: {
            create: [
                {
                    description: 'buy eggs',
                    commits: { create: [{ hours: 1 }] }
                },
                {
                    description: 'meet carol',
                }
            ]
        }
    },
    {
        name: 'Carol',
        email: 'carol@tdl.com',
        goals: {
            create: [
                {
                    description: 'organize office',
                    commits: { create: [{ hours: 5 }] }
                },
                {
                    description: 'pay bils',
                    commits: { create: [{ hours: 2 }, { hours: 3 }] }
                },
                {
                    description: 'meet bob',
                }
            ]
        }
    }
]

function genGroupData(name: string, users: User[]): Prisma.GroupCreateInput {
    const groupData: Prisma.GroupCreateInput = {
        name: name,
        users: {
            create: users.map((user) => {
                return {
                    user: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            })
        }
    }
    return groupData
}


async function main() {
    console.log(`Start seeding ...`)
    const alice = await prisma.user.create({
        data: {
            name: 'Alice',
            email: 'alice@tdl.com',
            goals: {
                create: [
                    {
                        description: 'hit the gym',
                        commits: {
                            create: [
                                {
                                    hours: 3
                                }
                            ]
                        }
                    },
                    {
                        description: 'read a book',
                        commits: {
                            create: [
                                {
                                    hours: 4
                                }
                            ]
                        }
                    }
                ]
            }
        },
        include: {
            goals: true
        }
    })
    console.log(`Created user ${alice.name} with id: ${alice.id}`)
    const bob = await prisma.user.create({
        data: {
            name: 'Bob',
            email: 'bob@tdl.com',
            goals: {
                create: [
                    {
                        description: 'buy eggs',
                        commits: { create: [{ hours: 1 }] }
                    },
                    {
                        description: 'meet carol',
                    }
                ]
            }
        },
        include: {
            goals: true
        }
    })
    console.log(`Created user ${bob.name} with id: ${bob.id}`)
    const carol = await prisma.user.create({
        data: {
            name: 'Carol',
            email: 'carol@tdl.com',
            goals: {
                create: [
                    {
                        description: 'organize office',
                        commits: { create: [{ hours: 5 }] }
                    },
                    {
                        description: 'pay bils',
                        commits: { create: [{ hours: 2 }, { hours: 3 }] }
                    },
                    {
                        description: 'meet bob',
                    }
                ]
            }
        }
    })
    console.log(`Created user ${carol.name} with id: ${carol.id}`)

    const alphabet = await prisma.group.create({
        data: {
            name: 'alphabet',
            users: {
                create: [
                    {
                        user: { connect: { id: bob.id } }
                    },
                    {
                        user: { connect: { id: carol.id } }
                    },
                ]
            }
        },
        include: { users: { include: { user: { include: { goals: true } } } } }
    })
    console.log(`Created group ${alphabet.name} with id: ${alphabet.id}`)

    for (const ug of alphabet.users) {
        for (const g of ug.user.goals) {
            const ugg = await prisma.userGroupGoals.create({
                data: {
                    userId: ug.userId,
                    groupId: alphabet.id,
                    goalId: g.id
                },
                include: {userGroup: {include: {group: true, user: true}}, goal: true}
            })
            console.log(`${ugg.userGroup.user.name} adds {${ugg.goal.description}} to ${ugg.userGroup.group.name}`)
        }
    }
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
