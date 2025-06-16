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
        profilePicture: string | undefined
        bio: string | undefined
        location: string | undefined
        website: string | undefined
        twitter: string | undefined
        github: string | undefined
        linkedin: string | undefined
    }
}

export type CodeBlock = {
    id: string;
    language: string;
    code: string;
    postId: string;
    createdAt: string;
    updatedAt: string;
}

export type CodeBlockForm = {
    language: string;
    code: string;
}

export type Post = {
    id: string | undefined
    author: string
    title: string
    content: string
    blobVideoURL: string | undefined
    createdAt: string | undefined
    updatedAt: string | undefined
    codeBlocks: CodeBlock[] | undefined
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
    authorId: string
    title: string
    content: string
    blobVideoURL: string | null
    codeBlocks: CodeBlockForm[]
}

export interface Profile {
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    twitter?: string | null;
    github?: string | null;
    linkedin?: string | null;
}