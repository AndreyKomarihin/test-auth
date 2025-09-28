'use client'
import styles from './Authorization.module.scss';
import Image from "next/image";
import logo from '../../../../public/logo.png'
import cn from "classnames";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {config, FormDatal, initialState} from "@/app/shared/constants/constants";
import {finder, getCurrentCode, isCodeExpired, mockUsers, verifyTwoFactorCode} from "@/app/shared/mokAPI/mokApi";
import {ConfigProvider, Flex, Input} from 'antd'
import Title from "antd/es/skeleton/Title";
import {ArrowLeftOutlined} from "@ant-design/icons";

type errorStatus = '' | 'warning' | 'error' | undefined

export const Authorization = () => {

    const [formState, setFormState] = useState(initialState)
    const [isTwoFactor, setIsTwoFactor] = useState(false)
    const [twoFactorCode, setTwoFactorCode] = useState('')
    const [twoFactorSuccess, setTwoFactorSuccess] = useState(false)
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [showNewCodeBtn, setShowNewCodeBtn] = useState(false)
    const [errorCode, setErrorCode] = useState<errorStatus>('')

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
            const value = e. target.value
            const name = e. target. name
            setFormState((prev) => ({ ... prev, [name]: value}))
}

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

    const handleClick = () => {
        const user = finder(formState.email, formState.password)
        if (user) {
            setCurrentUser(user.email)
            if (user.twoFactorEnabled) {
                setIsTwoFactor(true)
                console.log('Код для', user.email, ':', getCurrentCode(user.email))
            }
        } else {
            setIsTwoFactor(false)
        }
    }

    const handleChange = (value: string) => {
        setTwoFactorCode(value)

        if (value.length === 6 && currentUser) {
            const isExpired = isCodeExpired(currentUser)

            if (isExpired) {
                setTwoFactorSuccess(false)
                setErrorCode('warning')
            } else {
                const isValid = verifyTwoFactorCode(currentUser, value)
                setTwoFactorSuccess(isValid)

                if (!isValid) {
                    setErrorCode('error')
                } else {
                    setErrorCode('')
                }
            }
        } else {
            setErrorCode('')
        }
    }

    useEffect(() => {
        if (currentUser && isTwoFactor) {
            const checkCodeExpiry = () => {
                const isExpired = isCodeExpired(currentUser)
                setShowNewCodeBtn(isExpired)
            }
            checkCodeExpiry()
            const interval = setInterval(checkCodeExpiry, 1000)

            return () => clearInterval(interval)
        }
    }, [currentUser, isTwoFactor])

    const handleGetNew = () => {
        if (currentUser) {
            const user = finder(formState.email, formState.password)
            if (user) {
                setTwoFactorCode('')
                setTwoFactorSuccess(false)
                setShowNewCodeBtn(false)
                console.log('Новый код для', user.email, ':', getCurrentCode(user.email))
            }
        }
    }

    const handleClickAuthSuccess = () => {
        console.log('Выполнен вход в учетную запись:', currentUser)
    }


    return (
        <div>
            <main className={styles.main}>
                <div className={styles.authContainer}>
                    {isTwoFactor ? <ArrowLeftOutlined onClick={() => setIsTwoFactor(false)} style={{ fontSize: '18px'}}/>
                        : ''
                    }
                    {!isTwoFactor ? <form onSubmit={onSubmit} className={styles.authInputBox}>
                        <div className={styles.authTextBox}>
                            <Image width={98} height={24} src={logo} alt="logo" />
                            <h3 className={styles.authText}>Sign in to your account to <br/> continue</h3>
                        </div>
                            {config.map((item) => (
                                <div key={item.name}><div className={styles.inputBox}><input name={item.name} value={formState[item.name]} onChange={onChange} className={styles.input} type={item.type} placeholder={item.placeholder} /><img className={styles.icon} src={item.src}/></div></div>
                            ))}
                        <button onClick={handleClick} className={cn(styles.submitBtn, finder(formState.email, formState.password) ? styles.submit : '')} type='submit'>Log in</button>
                    </form>
                        :
                        <form onSubmit={onSubmit} className={styles.twoFactorBox}>
                            <div className={styles.authTextBox}>
                                <Image width={98} height={24} src={logo} alt="logo" />
                                <div className={styles.twoFactorTextBox}>
                                    <h3 className={styles.authText}>Two-Factor Authentication</h3>
                                    <p className={styles.twoFactorText}>Enter the 6-digit code from the Google <br/>  Authenticator app</p>
                                </div>
                            </div>
                            <div className={styles.twoFactorContinueBox}>
                            <ConfigProvider
                                theme={{
                                    token: {

                                    },
                                    components: {
                                        Input: {
                                            paddingInlineLG: 11,
                                            paddingBlockLG: 10,
                                            inputFontSizeLG: 24,
                                        },
                                    },
                                }}
                            >
                                <Input.OTP status={errorCode} onChange={handleChange} className={styles.twoFactor} size={'large'} style={{ gap: '12px', justifyContent: 'space-between' }} />
                                {errorCode && (<p className={styles.errorText}>Invalid Code</p>)}
                            </ConfigProvider>
                            {twoFactorSuccess || errorCode === 'error' ? <button onClick={handleClickAuthSuccess} className={cn(styles.submitBtn, styles.continueBtn, twoFactorSuccess && styles.submit)} type='submit'>Continue</button>
                            :
                                showNewCodeBtn &&
                                <button onClick={handleGetNew} className={cn(styles.submitBtn, styles.submit)} type='submit'>Get new</button>
                            }
                            </div>
                        </form>
                    }
                </div>
            </main>
        </div>
    )
}