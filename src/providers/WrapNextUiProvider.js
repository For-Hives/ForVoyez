'use client'
import React from 'react'
import {ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const WrapNextUiProvider = ({children}) => {
    return (
        <>
            {children}
            <ToastContainer/>
        </>
    )
}

export default WrapNextUiProvider
