import { useEffect, useState } from 'react'
import { Link, Form } from "@remix-run/react"
import { gsap } from 'gsap'

export function Nav() {
    const bubArray = Array.from({ length: 25 }, (_, i) => i);
    const bubArray1 = Array.from({ length: 25 }, (_, i) => i);
    const bubArray2 = Array.from({ length: 25 }, (_, i) => i);
    const [randomValues, setRandomValues] = useState<number[] | null>(null);

    useEffect(() => {
        // Only run on client
        setRandomValues(Array.from({ length: 25 }, () => Math.random() * 100));
        // Dynamically import seedrandom
        import('seedrandom').then(({ default: seedrandom }) => {
            const rng = seedrandom('fixed-seed');
            const nav = document.querySelector(".nav-container");
            let navWidth = nav?.clientWidth ?? 375;
            let navHeight = nav?.clientHeight ?? 500;

            // Set initial positions for all bubbles
            bubArray.forEach((el: any) => {
                let randomX = (gsap.utils.random as any)(0, navWidth, false, rng);
                let randomY = (gsap.utils.random as any)(-navHeight, 0, false, rng);
                gsap.set(`.bubble-${el}`, {
                    x: randomX,
                    y: randomY,
                });
            });

            bubArray1.forEach((el: any) => {
                let randomX = (gsap.utils.random as any)(0, navWidth, false, rng);
                let randomY = (gsap.utils.random as any)(-navHeight, 0, false, rng);
                gsap.set(`.bubble-1-${el}`, {
                    x: randomX,
                    y: randomY,
                });
            });

            bubArray2.forEach((el: any) => {
                let randomX = (gsap.utils.random as any)(0, navWidth, false, rng);
                let randomY = (gsap.utils.random as any)(-navHeight, 0, false, rng);
                gsap.set(`.bubble-2-${el}`, {
                    x: randomX,
                    y: randomY,
                });
            });

            // Create animations for each bubble
            bubArray.forEach((el: any) => {
                gsap.to(`.bubble-${el}`, {
                    y: navHeight,
                    repeat: -1,
                    duration: 3.5 + (rng() * 2),
                    delay: rng() * 2,
                    ease: "none"
                });
            });

            bubArray1.forEach((el: any) => {
                gsap.to(`.bubble-1-${el}`, {
                    y: navHeight,
                    repeat: -1,
                    duration: 4 + (rng() * 2),
                    delay: rng() * 2,
                    ease: "none"
                });
            });

            bubArray2.forEach((el: any) => {
                gsap.to(`.bubble-2-${el}`, {
                    y: navHeight,
                    repeat: -1,
                    duration: 4.5 + (rng() * 2),
                    delay: rng() * 2,
                    ease: "none"
                });
            });
        });
    }, []);

    if (!randomValues) return null; // Prevent hydration mismatch

    return (
        <div className='group fixed left-0 top-0 h-screen w-20 bg-neutral-800 flex flex-col items-center transition-all duration-300 ease-in-out hover:w-64 overflow-hidden z-[9999] nav-container'>
            {/* Bubble Animation Container */}
            <div className="absolute inset-0 overflow-hidden">
                {bubArray.map((el, index) => (
                    <div
                        key={el}
                        className={`bubble-${el} absolute w-2 h-2 rounded-full bg-indigo-500/20`}
                        style={{
                            left: `${randomValues[index] ?? 0}%`,
                        }}
                    />
                ))}
                {bubArray1.map((el, index) => (
                    <div
                        key={`1-${el}`}
                        className={`bubble-1-${el} absolute w-1.5 h-1.5 rounded-full bg-indigo-400/20`}
                        style={{
                            left: `${randomValues[index] ?? 0}%`,
                        }}
                    />
                ))}
                {bubArray2.map((el, index) => (
                    <div
                        key={`2-${el}`}
                        className={`bubble-2-${el} absolute w-1 h-1 rounded-full bg-indigo-300/20`}
                        style={{
                            left: `${randomValues[index] ?? 0}%`,
                        }}
                    />
                ))}
            </div>

            <div className='w-full py-5 flex flex-col justify-center items-center space-y-2 relative z-10'>
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-sm transition-all duration-500 group-hover:bg-indigo-500/30"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 transition-all duration-500 group-hover:text-indigo-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h1 className="text-gray-300 text-xs font-bold tracking-wider font-cursive transition-all duration-500 group-hover:text-indigo-300 group-hover:text-lg">portal.ask</h1>
            </div>
            <hr className='border-b border-gray-500 w-4/6 relative z-10'/>

            <div className="flex-1 flex flex-col items-center justify-center space-y-2 w-full relative z-10">
                <Link to="/profile" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
                    <div className="relative flex items-center gap-4 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Profile</span>
                    </div>
                </Link>
                <hr className='border-b border-gray-500 w-4/6'/>

                <Link to="/community" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
                    <div className="relative flex items-center gap-4 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Community</span>
                    </div>
                </Link>
                <hr className='border-b border-gray-500 w-4/6'/>

                <Link to="/settings" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
                    <div className="relative flex items-center gap-4 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Settings</span>
                    </div>
                </Link>
            </div>

            <div className="w-full relative z-10">
                <hr className='border-b border-gray-500 w-4/6 mx-auto mb-4'/>
                <Form method="post" action="/logout" className="w-full">
                    <button type="submit" className="w-full py-3 flex justify-center items-center transition-all duration-300 group/item hover:bg-white/5">
                        <div className="relative flex items-center gap-4 px-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 transition-all duration-300 group-hover:text-indigo-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden text-sm font-medium text-gray-300 group-hover:text-indigo-300 group-hover:block">Logout</span>
                        </div>
                    </button>
                </Form>
            </div>
        </div>
    )
}