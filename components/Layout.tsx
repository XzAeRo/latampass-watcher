import React, { ReactNode } from 'react'
import Link from 'next/link'
import Head from 'next/head'

type Props = {
    children?: ReactNode
    title?: string
}

const year = (new Date()).getFullYear();

const Layout = ({ children, title = 'Catalogo LATAM PASS Watcher'}: Props) => (
    <>
        <Head>
            <title>{title}</title>
            <meta charSet='utf-8' />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <header>
            <nav>
                <Link href="/">
                    <a>Home</a>
                </Link>
            </nav>
        </header>
    {children}
    <footer>
        <hr />
        <span>Developed with &#9829; by VGR &copy; {year}</span>
    </footer>
    </>
)

export default Layout