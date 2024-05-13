import { useState } from "react"
import logo from "/src/assets/Birla_Institute_of_Technology_Mesra.png"   
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const NavBar = () => {
    const [dropDown,setDropDown] = useState(false);
    const toggleDropDown = () => {
        setDropDown(!dropDown)
    }
    return (
        <nav className="sticky top0 z-30 py-3 border bg-stone-300 ">
            <div className="container relative px-4 mx-auto text-sm">
                <div className="flex justify-between items-center ">
                    <div className="flex items-center flex-shrink-0">
                        <img className="h-10 w-10 mr-2"src={logo} alt="bit" />
                        <span className="text-xl font-bold">BIT WEB APP</span>
                    </div>
                    <div className="hidden lg:flex justify-center space-x-8 items-center">
                        <Link to="/log" className="hover:bg-slate-200 px-2 py-3 border rounded-md">Student Login</Link>
                        <Link to="/sg" className="hover:bg-orange-200 px-2 py-3 border rounded-md">Admin Login</Link>  
                    </div>
                    <div className="lg:hidden md:flex flex-col justify-end">
                        <button onClick={toggleDropDown}>
                            <FontAwesomeIcon icon={dropDown ? faTimes : faBars} />
                        </button>

                    </div>
                </div>
                {dropDown && (
                    <div className="fixed right-0 z-20 bg-neutral-100 w-full p-10 flex flex-col justify-center items-center lg:hidden">
                        <div className="flex flex-col space-y-6">
                            <a href="#" className="hover:bg-slate-200 px-2 py-3 border rounded-md">Student Login</a>
                            <a href="#" className="hover:bg-orange-200 px-2 py-3 border rounded-md">Admin Login</a>
                        </div>
                    </div>
                    
                )}
            </div>
        </nav>
    )
}

export default NavBar