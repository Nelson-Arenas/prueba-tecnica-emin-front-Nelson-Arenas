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

export type Company = {
    id: string
    name: string
}
export type AuthResponse = {
