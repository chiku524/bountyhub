// app/utils/types.server.ts
export type RegisterForm = {
    email: string
    password: string
    firstName: string
    lastName: string
    username: string
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

export type Post = {
    id: string | undefined
    author: string
    title: string
    content: string
    blobVideoURL: string | undefined
    createdAt: string | undefined
    updatedAt: string | undefined
    comments: {
        postedBy: string | undefined
        content: string | undefined
        createdAt: string | undefined
        updatedAt: string | undefined
    }[] | undefined
    answers: {
        postedBy: string | undefined
        content: string | undefined
        createdAt: string | undefined
        updatedAt: string | undefined
        comments: {
            postedBy: string | undefined
            content: string | undefined
            createdAt: string | undefined
            updatedAt: string | undefined
        }[] | undefined
    }[] | undefined
}

export type PostForm = {
    author: string
    title: string
    content: string
    blobVideoURL: string | null
}