// app/utils/validators.client.ts

export const validateEmail = (email: string): string | undefined => {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!email.length || !validRegex.test(email)) {
        return "Please enter a valid email address"
    }
}

export const validatePassword = (password: string): string | undefined => {
    if (password.length < 5) {
        return "Please enter a password that is at least 5 characters long"
    }
}

export const validateUsername = (username: string): string | undefined => {
    if (!username.length) return `Please enter a value`
    if (username.length < 3) return `Username must be at least 3 characters long`
}

export const validateTitle = (title: string): string | undefined => {
    if (!title.length) return `Please enter a title`
    if (title.length < 3) return `Title must be at least 3 characters long`
    if (title.length > 200) return `Title must be less than 200 characters`
}

export const validateContent = (content: string): string | undefined => {
    if (!content.length) return `Please enter some content`
    if (content.length < 10) return `Content must be at least 10 characters long`
} 