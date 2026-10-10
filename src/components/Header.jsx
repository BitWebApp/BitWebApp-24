import React, { Fragment, useState, useEffect } from "react";
import { Transition, Menu } from "@headlessui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import classNames from "classnames";
import axios from "axios";
import { Menu as MenuIcon, X, LogOut, User, ChevronUp } from "lucide-react";
import { getVisibleStudentLinks } from "../student_links";

const linkClasses =
  "flex items-center gap-4 font-light p-3 hover:bg-neutral-700 hover:no-underline active:bg-neutral-800 text-sm md:text-base text-white border-t border-neutral-800 transition-colors";

export default function Header() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const loggedIn = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    axios
      .get("/api/v1/users/get-user")
      .then((response) => {
        if (response.data?.data) {
          setUser(response.data.data);
        }
      })
      .catch(() => {
        // Fallback to localStorage user
      });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const newTime = new Date();
      const clock = newTime.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        weekday: "short",
        year: "numeric",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(clock);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsNavbarOpen(false);
  }, [location.pathname]);

  const activeUser = user || loggedIn;
  const links = getVisibleStudentLinks(activeUser);

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/users/logout");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/");
    } finally {
      navigate("/");
    }
  };

  const displayName =
    activeUser?.fullName?.toUpperCase() ||
    activeUser?.username?.toUpperCase() ||
    "STUDENT";

  return (
    <>
      {/* Top Header Bar - Matches original color scheme: bg-white, border-b border-black */}
      <div className="sticky top-0 z-40 bg-white h-16 px-4 flex w-full items-center border-b border-black">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            className="p-1 inline-flex md:hidden items-center justify-center text-black focus:outline-hidden hover:opacity-70 transition-opacity"
            aria-label="Toggle navigation menu"
            aria-expanded={isNavbarOpen}
          >
            <MenuIcon className="w-7 h-7 text-black" />
          </button>

          {/* Welcome User Heading */}
          <div className="truncate text-sm sm:text-base font-normal text-black">
            Welcome, {displayName}
          </div>
        </div>

        {/* Right Section: Time & User Profile Menu */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
          {currentTime && (
            <div className="hidden md:block text-gray-600 text-xs sm:text-sm mr-2">
              {currentTime}
            </div>
          )}

          <Menu as="div" className="relative">
            <Menu.Button className="flex rounded-full bg-gray-200 focus:outline-hidden focus:ring-2 focus:ring-neutral-400">
              <span className="sr-only">Open user menu</span>
              <div
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 ${
                  activeUser?.isVerified ? "border-green-500" : "border-red-500"
                } bg-black bg-cover bg-no-repeat bg-center`}
                style={{
                  backgroundImage: `url(${
                    activeUser?.image || "/static/images/profile.png"
                  })`,
                }}
              />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right z-50 absolute right-0 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-hidden">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/db/userform"
                      onClick={closeNavbar}
                      className={classNames(
                        active && "bg-gray-100",
                        "flex items-center gap-2 text-gray-700 cursor-pointer rounded-sm px-4 w-full py-2 text-sm"
                      )}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        closeNavbar();
                      }}
                      className={classNames(
                        active && "bg-gray-100",
                        "flex items-center gap-2 text-red-600 cursor-pointer rounded-sm px-4 w-full py-2 text-sm text-left"
                      )}
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isNavbarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden transition-opacity"
          onClick={closeNavbar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer - Matches Sidebar's original bg-black, border-neutral-700 styling */}
      <aside
        className={classNames(
          "fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-black text-white z-50 flex flex-col shadow-2xl transition-transform duration-200 ease-in-out md:hidden border-r border-neutral-800",
          isNavbarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer Brand Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <Link to="/db" onClick={closeNavbar} className="flex items-center gap-3">
            <img
              className="h-9 w-auto object-contain"
              src="/static/images/Birla_Institute_of_Technology_Mesra.png"
              alt="BIT Mesra"
            />
            <span className="text-sm font-semibold tracking-wider text-white">
              BITACADEMIA
            </span>
          </Link>
          <button
            type="button"
            onClick={closeNavbar}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {links.map((link, index) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={index}
                to={link.to}
                onClick={closeNavbar}
                className={classNames(
                  linkClasses,
                  isActive && "bg-neutral-800 font-normal"
                )}
              >
                <span className="shrink-0 text-white">{link.icon}</span>
                <span className="flex-1 min-w-0 break-words leading-tight">
                  {link.text}
                </span>
              </Link>
            );
          })}

          {/* Profile, Logout & Collapse Actions */}
          <Link
            to="/db/userform"
            onClick={closeNavbar}
            className={linkClasses}
          >
            <span className="shrink-0 text-white">
              <User className="w-5 h-5 shrink-0" />
            </span>
            <span>Your Profile</span>
          </Link>

          <div
            onClick={() => {
              handleLogout();
              closeNavbar();
            }}
            className={classNames(
              "text-red-500 cursor-pointer",
              linkClasses
            )}
          >
            <span className="shrink-0">
              <LogOut className="w-5 h-5 shrink-0" />
            </span>
            <span>Logout</span>
          </div>

          <div
            onClick={closeNavbar}
            className={classNames(
              "text-red-500 cursor-pointer",
              linkClasses
            )}
          >
            <span className="shrink-0">
              <ChevronUp className="w-5 h-5 shrink-0" />
            </span>
            <span>Collapse</span>
          </div>
        </div>
      </aside>
    </>
  );
}
