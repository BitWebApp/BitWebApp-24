import { useState } from "react";
import logo from "/src/assets/Birla_Institute_of_Technology_Mesra.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faUserTie,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import LandingPage from "./LandingPage";

const NavBar = () => {
  const [dropDown, setDropDown] = useState(false);
  const toggleDropDown = () => setDropDown(!dropDown);

  return (
    <nav className="sticky top-0 z-30 py-3 bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <img className="h-10 w-10" src={logo} alt="BIT Logo" />
            <span className="text-xl font-bold tracking-wide">BITACADEMIA</span>
          </Link>
        </div>
        <div className="hidden lg:flex space-x-6">
          <Link
            to="/interview-experiences"
            className="px-4 py-2 border rounded-md hover:bg-blue-600 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Interview Experiences
          </Link>
          <Link
            to="/public-user"
            className="px-4 py-2 border rounded-md hover:bg-blue-600 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Search Student
          </Link>
          <Link
            to="/log"
            className="px-4 py-2 border rounded-md hover:bg-blue-600 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Student Login
          </Link>
          <Link
            to="/log.a"
            className="px-4 py-2 border rounded-md hover:bg-red-700 hover:text-white transition"
          >
            <FontAwesomeIcon icon={faUserTie} className="mr-2" />
            Admin Login
          </Link>
        </div>
        <button
          onClick={toggleDropDown}
          className="lg:hidden p-2 border rounded-md"
          aria-label="Toggle navigation menu"
        >
          <FontAwesomeIcon icon={dropDown ? faTimes : faBars} />
        </button>
      </div>
      {dropDown && (
        <div className="absolute right-0 top-16 z-20 bg-gray-100 p-6 rounded-md shadow-lg lg:hidden">
          <ul className="flex flex-col space-y-4">
            <li>
              <Link
                to="/public-user"
                className="block px-4 py-2 border rounded-md bg-white text-black hover:bg-blue-600 hover:text-white transition"
                onClick={() => setDropDown(false)}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Search Student
              </Link>
            </li>
            <li>
              <Link
                to="/log"
                className="block px-4 py-2 border rounded-md bg-white text-black hover:bg-blue-600 hover:text-white transition"
                onClick={() => setDropDown(false)}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Student Login
              </Link>
            </li>
            <li>
              <Link
                to="/log.a"
                className="block px-4 py-2 border rounded-md bg-white text-black hover:bg-red-700 hover:text-white transition"
                onClick={() => setDropDown(false)}
              >
                <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                Admin Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
