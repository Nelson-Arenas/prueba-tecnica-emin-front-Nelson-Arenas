export type User = {
    name: string
    lastName: string
    email: string
}

export type RegisterData = Pick<User, 'name' | 'lastName' | 'email'> & {
    password: string
    confirmPassword: string
    company?: string
}

export type LoginData = Pick<User, 'email'> & {
    password: string
}

export type Company = {
    id: string
    name: string
}
