import { useEffect, useState } from 'react'
import { Link, Form } from "@remix-run/react"
import gsap from 'gsap'

interface BubbleConfig {
  size: number;
  opacity: number;
  duration: number;
  className: string;
}

export function Nav() {
    const bubbleConfigs: BubbleConfig[] = [
        { size: 4, opacity: 0.6, duration: 3.5, className: 'bubble' },
        { size: 3, opacity: 0.6, duration: 4, className: 'bubble-1' },
        { size: 2, opacity: 0.6, duration: 4.5, className: 'bubble-2' }
    ];
    
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const nav = document.querySelector(".nav-container");
        if (!nav) return;

        const navWidth = nav.clientWidth;
        const navHeight = nav.clientHeight;

        // Create and append bubbles
        const container = document.querySelector('.bubble-container');
        if (!container) return;

        // Clear existing bubbles
        container.innerHTML = '';

        // Function to create a single bubble
        const createBubble = (config: BubbleConfig, index: number) => {
            const bubble = document.createElement('div');
            bubble.className = `${config.className}-${index} absolute rounded-full bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.6),0_0_15px_rgba(99,102,241,0.4)]`;
            bubble.style.width = `${config.size}px`;
            bubble.style.height = `${config.size}px`;
            bubble.style.opacity = config.opacity.toString();
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = '0%';
            container.appendChild(bubble);

            // Animate bubble
            gsap.to(bubble, {
                y: navHeight,
                duration: config.duration + (Math.random() * 2),
                ease: "none",
                onUpdate: function() {
                    // Add pulsing glow effect
                    const progress = this.progress();
                    const glowIntensity = 0.4 + Math.sin(progress * Math.PI * 2) * 0.3;
                    bubble.style.boxShadow = `0 0 ${8 + glowIntensity * 8}px rgba(99,102,241,${0.4 + glowIntensity * 0.3}), 0 0 ${15 + glowIntensity * 15}px rgba(99,102,241,${0.3 + glowIntensity * 0.2})`;
                },
                onComplete: function() {
                    // Remove the bubble when it reaches the bottom
                    bubble.remove();
                    // Create a new bubble at the top
                    createBubble(config, index);
                }
            });
        };

        // Create initial set of bubbles
        bubbleConfigs.forEach((config) => {
            for (let i = 0; i < 15; i++) {
                createBubble(config, i);
            }
        });

        // Cleanup
        return () => {
            gsap.killTweensOf(".bubble, .bubble-1, .bubble-2");
        };
    }, [isClient]);

    if (!isClient) return null;

    return (
        <div className='group fixed left-0 top-0 h-screen w-20 bg-neutral-800 flex flex-col items-center transition-all duration-300 ease-in-out hover:w-64 overflow-hidden z-[9999] nav-container'>
            {/* Bubble Animation Container */}
            <div className="absolute inset-0 overflow-hidden bubble-container pointer-events-none">
                {/* Bubbles will be added here by JavaScript */}
            </div>

            <div className="relative z-10 flex flex-col items-center w-full py-5">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-sm transition-all duration-500 group-hover:bg-indigo-500/30"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 transition-all duration-500 group-hover:text-indigo-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h1 className="text-gray-300 text-xs font-bold tracking-wider font-cursive transition-all duration-500 group-hover:text-indigo-300 group-hover:text-lg mt-2">portal.ask</h1>
            </div>
            <hr className='border-b border-gray-500 w-4/6 relative z-10'/>

            <div className="relative z-10 flex flex-col items-center w-full flex-1 justify-center">
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

            <div className="relative z-10 mt-auto w-full">
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