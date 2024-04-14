import Link from 'next/link'
import Image from 'next/image'
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";

export default function Navbar() {
    return (
        <>
            {/* --------------- NAVBAR ----------------------------------------------------------------------------------------------------------------------------------*/}
            <div
                className="site-header border-b-1 flex justify-between border-solid border-transparent px-8"
                id="site-header"
                role="banner"
            >
                <Link href="/" className="" aria-label="Home">
                    <Image
                        src="/logo/forVoyez.svg"
                        alt="ForVoyez - Image meta-description generator"
                        height={26}
                        width={80}
                    />
                </Link>
                <nav aria-label="Main">
                    <button
                        className="block md:hidden"
                        aria-label="Open Menu"
                        type="button"
                        aria-expanded="false"
                        aria-controls="menu"
                    >
                        <svg width={24} height={24} aria-hidden="true">
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
                        </svg>
                    </button>
                    <ul
                        className="flex h-full w-full list-none items-center justify-center gap-8"
                        id="menu"
                    >
                        <li>
                            <Link href="/social-media-scheduling" className="">
                                Scheduling
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/analytics"
                                className="router-link-active router-link-exact-active"
                                aria-current="page"
                            >
                                Analytics
                            </Link>
                        </li>
                        <li>
                            <Link href="/social-media-inbox" className="">
                                Inbox
                            </Link>
                        </li>
                        <li>
                            <Link href="/teams" className="">
                                Teams
                            </Link>
                        </li>

                        <li>
                            <Link href="/pricing" className="">
                                Pricing
                            </Link>
                        </li>


                        <SignedIn>
                            {/* Mount the UserButton component */}
                            <li>
                                <UserButton/>
                            </li>
                        </SignedIn>
                        <SignedOut>
                            {/* Signed out users get sign in button */}
                            <li>
                                <SignInButton
                                    className="decoration-none"
                                />
                            </li>

                            <li>
                                <Link
                                    href="/sign-up"
                                    className="rounded-full border border-solid border-black px-4 py-2"
                                    data-type="secondary"
                                >
                                    Get Started
                                </Link>
                            </li>
                        </SignedOut>


                    </ul>
                </nav>
            </div>
        </>
    )
}
