// app/utils/types.server.ts

export interface LoginForm {
    email: string;
    password: string;
    redirectTo: string;
}

export interface RegisterForm {
    email: string;
    password: string;
    username: string;
    redirectTo?: string;
}

export type User = {
    id: string;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    profile?: Profile | null;
};

export interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    author: User;
    codeBlocks: CodeBlock[];
}

export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    postId: string;
    author: User;
    post: Post;
}

export type Profile = {
    id: string;
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePicture?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    github?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    discord?: string | null;
    reddit?: string | null;
    medium?: string | null;
    stackoverflow?: string | null;
    devto?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export type CodeBlock = {
    id: string;
    content: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface CodeBlockForm {
    language: string;
    code: string;
    description?: string;
}

export type PostForm = {
    authorId: string
    title: string
    content: string
    codeBlocks: CodeBlockForm[]
    media: Array<{
        type: string
        url: string
        thumbnailUrl?: string
        isScreenRecording: boolean
    }>
}