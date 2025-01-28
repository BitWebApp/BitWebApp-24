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

const NavBar = () => {
  const [dropDown, setDropDown] = useState(false);
  const toggleDropDown = () => setDropDown(!dropDown);

  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm backdrop-blur-sm bg-opacity-80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img className="h-10 w-10" src={logo} alt="BIT Logo" />
              <span className="text-xl font-bold text-gray-800">BITACADEMIA</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/interview-experiences"
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Interview Experiences
            </Link>
            <Link
              to="/public-user"
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Search Student
            </Link>
            <Link
              to="/log"
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Student Login
            </Link>
            <Link
              to="/log.a"
              className="text-gray-700 hover:text-red-600 transition duration-300"
            >
              <FontAwesomeIcon icon={faUserTie} className="mr-2" />
              Admin Login
            </Link>
            <Link
              to="/faculty-login"
              className="text-gray-700 hover:text-blue-600 transition duration-300"
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              Faculty Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleDropDown}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 focus:outline-none transition duration-300"
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={dropDown ? faTimes : faBars} />
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {dropDown && (
          <div className="lg:hidden bg-white border-t border-gray-200 mt-2">
            <ul className="flex flex-col space-y-2 p-4">
              <li>
                <Link
                  to="/interview-experiences"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition duration-300"
                  onClick={() => setDropDown(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Interview Experiences
                </Link>
              </li>
              <li>
                <Link
                  to="/public-user"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition duration-300"
                  onClick={() => setDropDown(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Search Student
                </Link>
              </li>
              <li>
                <Link
                  to="/log"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition duration-300"
                  onClick={() => setDropDown(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Student Login
                </Link>
              </li>
              <li>
                <Link
                  to="/log.a"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-md transition duration-300"
                  onClick={() => setDropDown(false)}
                >
                  <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                  Admin Login
                </Link>
              </li>
              <li>
                <Link
                  to="/faculty-login"
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition duration-300"
                  onClick={() => setDropDown(false)}
                >
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Faculty Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;