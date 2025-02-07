import { useEffect, useState } from 'react'
import { Link } from "@remix-run/react"
import Logo from '../images/corki-logo.png'
import { gsap } from 'gsap'


export function Nav() {
    const [bubArray] = useState<number[]>([]);
    const [bubArray1] = useState<number[]>([]);
    const [bubArray2] = useState<number[]>([]);

    for(let i=0; i<25; i++) {
        bubArray.push(i);
      }
      for(let i=0; i<25; i++) {
        bubArray1.push(i);
      }
      for(let i=0; i<25; i++) {
        bubArray2.push(i);
      }
  
      useEffect(() => {
        const aa = document.querySelector("#tank");
        let tankWidth = aa?.clientWidth;
        let tankHeight = aa?.clientHeight;
        tankHeight ? tankHeight += 100 : tankHeight = tankHeight;
        bubArray.forEach((el: any) => {
          let randomX = gsap.utils.random(0, tankWidth? tankWidth : 375, true);
          let randomY = gsap.utils.random(-500, 0, true);
          gsap.set(`.bubble-${el}`, {
            x: randomX(),
            y: randomY(),
          })
        })
        bubArray1.forEach((el: any) => {
          let randomX = gsap.utils.random(0, tankWidth? tankWidth : 375, true);
          let randomY = gsap.utils.random(-500, 0, true);
          gsap.set(`.bubble-${el}`, {
            x: randomX(),
            y: randomY(),
          })
        })
        bubArray2.forEach((el: any) => {
          let randomX = gsap.utils.random(0, tankWidth? tankWidth : 375, true);
          let randomY = gsap.utils.random(-500, 0, true);
          gsap.set(`.bubble-${el}`, {
            x: randomX(),
            y: randomY(),
          })
        })
    
        gsap.to("#bubble", {
          y: tankHeight,
          repeat: -1,
          duration: 3.5,
        })
        gsap.to("#bubble1", {
          y: tankHeight,
          repeat: -1,
          duration: 3.5,
          delay: 2.25
        })
        gsap.to("#bubble2", {
          y: tankHeight,
          repeat: -1,
          duration: 3.5,
          delay: 1.25
        })
      }, [])

    return (
      <div className='bg-amber-950 h-full w-52 flex flex-col items-center'>
        <div className='bg-amber-950 h-full w-52 flex flex-col items-center'>
            <Link to="/" className='w-full h-1/6 block'>
              <div className='w-full hover:cursor-pointer z-10 flex justify-center items-center animate-fly translate-x-[-50px]'>
                <img src={Logo} className='w-1/2'/>
              </div>
              <div id="tank" className="absolute w-52 h-1/6 overflow-hidden top-0">
                {bubArray && bubArray.map((x:any, index:any) => <div key={index} id="bubble" className={`bubble-${index} aspect-square rounded-full bg-white bg-opacity-50 absolute -top-10 left-0 w-0.5`}><p className='hidden'>{x}</p></div>)}
                {bubArray1 && bubArray1.map((x:any, index:any) => <div key={index} id="bubble1" className={`bubble-${index} aspect-square rounded-full bg-white bg-opacity-50 absolute -top-10 left-0 w-0.5`}><p className='hidden'>{x}</p></div>)}
                {bubArray2 && bubArray2.map((x:any, index:any) => <div key={index} id="bubble2" className={`bubble-${index} aspect-square rounded-full bg-white bg-opacity-50 absolute -top-10 left-0 w-0.5`}><p className='hidden'>{x}</p></div>)}
                <div className='flex items-end h-full justify-center'>
                  <h1 className='text-center text-white font-bold drop-shadow-custom animate-pulse tracking-widest text-4xl' style={{'fontFamily': 'Tangerine'}}>portal.ask</h1>
                </div>
              </div>
            </Link>
            <Link to="/profile" className='w-full py-5 mt-24 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'>
                <span>Dashboard</span>
            </Link>
            <hr className='border-b border-gray-500 w-4/6'/>
            <Link to="/marketplace" className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'>
                <span>Marketplace</span>
            </Link>            
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <div className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'><span>Dashboard</span></div>
            <hr className='border-b border-gray-500 w-4/6'/>
            <Link to="/settings" className='w-full py-5 flex justify-center items-center hover:cursor-pointer hover:bg-indigo-900 hover:bg-opacity-50'>
                <span>Settings</span>
            </Link>
        </div>
      </div>
    )
}