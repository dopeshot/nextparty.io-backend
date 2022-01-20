export const migrationSetup = {
    sets: [
        {
            _id: '61e8a59e0884d3f6c0023226',
            visibility: 'public',
            played: 0,
            dareCount: 0,
            truthCount: 1,
            language: 'de',
            createdBy: '61e8a58a0884d3f6c0023223',
            status: 'active',
            category: 'kids',
            slug: 'kids-set',
            name: 'Kids Set',
            tasks: [
                {
                    status: 'active',
                    slug: 'wie-alt-bist-du?',
                    message: 'Wie alt bist du?',
                    currentPlayerGender: '@ca',
                    type: 'truth',
                    _id: '61e8a59e0884d3f6c002322a',
                    updatedAt: '2022-01-19T23:58:22.276Z',
                    createdAt: '2022-01-19T23:58:22.276Z'
                }
            ],
            createdAt: '2022-01-19T23:58:22.264Z',
            updatedAt: '2022-01-19T23:58:22.276Z',
            __v: 0
        }
    ],
    users: [
        {
            _id: '61e8a58a0884d3f6c0023223',
            status: 'unverified',
            role: 'admin',
            password:
                '$2b$12$VN9qfLfMyN/3705PoJkqduDeeTO.paITPS1.q1ktSMiD50RpboWiy',
            slug: 'normal-user',
            email: 'normaluser@gmail.de',
            username: 'Normal User',
            createdAt: '2022-01-19T23:58:02.405Z',
            updatedAt: '2022-01-19T23:58:02.405Z',
            __v: 0
        }
    ]
};
