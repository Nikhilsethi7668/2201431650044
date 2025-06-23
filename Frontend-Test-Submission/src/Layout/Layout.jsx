import React from 'react'
import ExampleNavigationMenu from '../Components/Navbar'
import { Outlet } from 'react-router-dom'
import ColorInversionFooter from '../Components/Footer'
import './Layout.css'

const Layout = () => {
    return (
        <div className='container'>
            <header className="navbar">
                <div className="navbar-content">
                    <ExampleNavigationMenu />
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-content">
                    <ColorInversionFooter />
                </div>
            </footer>
        </div>
    )
}

export default Layout