export const initialState: FormDatal = {
    name: '',
    password: '',
    duplicate: '',
    email: ''
}

export type FormDatal = {
    name: string
    email: string
    password: string
    duplicate: string | undefined
}

export interface ConfigItem {
    name: keyof FormDatal
    src: string
    type: string
    placeholder: string
    pattern?: string
    errorMessage?: string
    required?: boolean
    minLength?: number
    validate?: (state: FormDatal) => boolean
}

export const config: ConfigItem[] = [
    {
        name: 'email',
        src: './email.png',
        type: 'email',
        placeholder: 'Email',
        pattern: '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/',
        errorMessage: 'Please enter a valid email address',
    },
    {
        name: 'password',
        src: './password.png',
        placeholder: 'Password',
        required: true,
        type: 'password',
        minLength: 6,
        errorMessage: 'Please enter a valid password',
    }
]