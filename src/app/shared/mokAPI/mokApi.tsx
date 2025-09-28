export interface User {
    id: number
    email: string
    password: string
    name: string
    twoFactorEnabled: boolean
    currentCode?: string
    codeExpiry?: number
}

export const mockUsers: User[] = [
    {
        id: 1,
        email: 'a@mail.ru',
        password: '111',
        name: 'John Doe',
        twoFactorEnabled: true
    },
    {
        id: 2,
        email: 'admin@test.com',
        password: 'admin',
        name: 'Admin User',
        twoFactorEnabled: true
    },
    {
        id: 3,
        email: 'test@test.com',
        password: 'test',
        name: 'Test User',
        twoFactorEnabled: false
    }
]

export const generateTwoFactorCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const CODE_EXPIRY_TIME = 6 * 60 * 1000

export const finder = (email: string, password: string): User | { code: string } | null => {
    const user = mockUsers.find(u => u.email === email && u.password === password)


    if (user && user.twoFactorEnabled) {
        user.currentCode = generateTwoFactorCode()
        user.codeExpiry = Date.now() + CODE_EXPIRY_TIME

        console.log(`Код действителен до: ${new Date(user.codeExpiry).toLocaleTimeString()}`)
    }

    if (sessionStorage.getItem('TWO_FACTOR_KEY')) {
        return user || null
    }

    return {code: 'TWO_FACTOR_AUTH'}

}

export const verifyTwoFactorCode = (email: string, code: string): boolean => {
    const user = mockUsers.find(u => u.email === email)

    if (!user || !user.currentCode || !user.codeExpiry) {
        return false
    }

    if (Date.now() > user.codeExpiry) {
        user.currentCode = undefined
        user.codeExpiry = undefined
        return false
    }

    const isValid = user.currentCode === code

    if (isValid) {
        user.currentCode = undefined
        user.codeExpiry = undefined
    }
    return isValid
}

export const getCurrentCode = (email: string): string | null => {
    const user = mockUsers.find(u => u.email === email)
    return user?.currentCode || null
}

export const isCodeExpired = (email: string): boolean => {
    const user = mockUsers.find(u => u.email === email)
    if (!user || !user.codeExpiry) return true
    return Date.now() > user.codeExpiry
}
