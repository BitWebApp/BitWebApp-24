import { useState } from "react";
import logo from "/src/assets/Birla_Institute_of_Technology_Mesra.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const NavBar = () => {
    const [dropDown, setDropDown] = useState(false);

    const toggleDropDown = () => {
        setDropDown(!dropDown);
    }

    return (
        <nav className="sticky top-0 z-30 py-3 bg-gray-900 text-white">
            <div className="container relative px-4 mx-auto text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <img className="h-10 w-10 mr-2" src={logo} alt="bit" />
                        <span className="text-xl font-bold">BIT WEB APP</span>
                    </div>
                    <div className="hidden lg:flex justify-center space-x-8 items-center">
                        <Link to="/log" className="text-gray-200 hover:text-white">
                            <div className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">Student Login</div>
                        </Link>
                        <Link to="/sg" className="text-gray-200 hover:text-white">
                            <div className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">Admin Login</div>
                        </Link>
                    </div>
                    <div className="lg:hidden md:flex flex-col justify-end">
                        <button onClick={toggleDropDown}>
                            <FontAwesomeIcon icon={dropDown ? faTimes : faBars} className="text-white" />
                        </button>
                    </div>
                </div>
                {dropDown && (
                    <div className="fixed right-0 z-20 bg-white bg-opacity-90 w-full p-10 flex flex-col justify-center items-center lg:hidden">
                        <div className="flex flex-col space-y-6">
                            <Link to="/log" className="text-gray-800 hover:text-gray-900">
                                <div className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md">Student Login</div>
                            </Link>
                            <Link to="/sg" className="text-gray-800 hover:text-gray-900">
                                <div className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md">Admin Login</div>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
