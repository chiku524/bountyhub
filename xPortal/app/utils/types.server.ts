// app/utils/types.server.ts
import type { CodeBlock as PrismaCodeBlock, Profile as PrismaProfile, User as PrismaUser } from '@prisma/client'

export interface LoginForm {
    email: string;
    password: string;
    redirectTo: string;
}

export interface RegisterForm {
    email: string;
    password: string;
    username: string;
    redirectTo: string;
}

export type User = PrismaUser & {
    profile?: PrismaProfile | null;
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

export type CodeBlock = PrismaCodeBlock;
export type Profile = PrismaProfile;

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