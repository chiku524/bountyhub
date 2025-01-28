// app/utils/types.server.ts
export type RegisterForm = {
    email: string
    password: string
    firstName: string
    lastName: string
}
  
export type LoginForm = {
    email: string
    password: string
}

export type User = {
    id: string | undefined
    email: string | undefined
    profile: {
        firstName: string | undefined
        lastName: string | undefined
        profession: string | undefined
        avatar: string | undefined
        website: string | undefined
        bio: string | undefined
        socials: {
            facebook: string | undefined
            twitter: string | undefined
            instagram: string | undefined
            linkedin: string | undefined
            github: string | undefined
        }
    }
}