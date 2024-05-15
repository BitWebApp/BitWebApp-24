import { useState } from "react"
import logo from "/src/assets/Birla_Institute_of_Technology_Mesra.png"   
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
const NavBar = () => {
    const [dropDown,setDropDown] = useState(false);
    const toggleDropDown = () => {
        setDropDown(!dropDown)
    }
    return (
        <nav className="sticky top-0 z-30 py-3 border bg-stone-300 ">
            <div className="container relative px-4 mx-auto text-sm">
                <div className="flex justify-between items-center ">
                    <div className="flex items-center flex-shrink-0">
                        <img className="h-10 w-10 mr-2"src={logo} alt="bit" />
                        <span className="text-xl font-bold">BIT WEB APP</span>
                    </div>
                    <div className="hidden lg:flex justify-center space-x-8 items-center">
                        <Link to="/log" className="hover:bg-blue-600 hover:text-white transition px-2 py-3 border rounded-md ">
                            <FontAwesomeIcon icon={faUser} className="mx-2" />
                            Student Login
                        </Link>
                        <Link to="/log" className="hover:bg-red-700 hover:text-white transition px-2 py-3 border rounded-md">
                            <FontAwesomeIcon icon={faUserTie} className="mx-2"/>
                            Admin Login
                        </Link>  
                    </div>
                    <div className="lg:hidden md:flex flex-col justify-end">
                        <button onClick={toggleDropDown}>
                            <FontAwesomeIcon icon={dropDown ? faTimes : faBars} />
                        </button>

                    </div>
                </div>
                {dropDown && (
                    <div className="fixed right-0 top-16 z-20 bg-neutral-100 p-10 flex flex-col justify-center items-end lg:hidden rounded-lg">
                        <div className="flex flex-col space-y-6">
                            <Link to="/log" className="hover:bg-blue-600 hover:text-white transition px-2 py-3 border rounded-md ">
                                <FontAwesomeIcon icon={faUser} className="mx-2" />
                                Student Login
                            </Link>
                            <Link to="/log" className="hover:bg-red-700 hover:text-white transition px-2 py-3 border rounded-md">
                                <FontAwesomeIcon icon={faUserTie} className="mx-2"/>
                                Admin Login
                            </Link>  
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar