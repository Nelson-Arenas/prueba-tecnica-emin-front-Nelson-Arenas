export type User = {
    _id: string;
    name: string;
    lastName: string;
    email: string;
    company?: number | string;   // según tu backend (en consola es 1)
    createdAt?: string;          // viene en consola
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

export type Activo = {
    id: string
    code: string
    name: string
    type: "NOTEBOOK" | "MONITOR" | "LICENCIA" | "PERIFERICO" | "OTRO"
    brand?: string
    model?: string
    serialNumber: string
    status: "DISPONIBLE" | "ASIGNADO" | "MANTENCION" | "BAJA"
    purchaseDate?: string
    company: string
    location: string
    assignedUser?: string | null
    notes?: string | null
    deletedAt?: string | null
    createdAt?: string
    updatedAt?: string
}

export type Empresas = {
    _id: string
    name: string
    createdAt: string
    updatedAt: string
    __v: number
}