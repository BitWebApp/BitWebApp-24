import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { motion } from "framer-motion";
import { LogOut, ChevronLeft } from "lucide-react";
import axios from "axios";
import facultyLinks from "../faculty_links.jsx";

const linkclasses =
  "flex items-center gap-5 font-normal p-2.5 hover:bg-neutral-800 hover:no-underline active:bg-neutral-800 rounded-md text-sm transition-colors";

export default function Sidebar() {
  const Sidebar_animation = {
    open: {
      width: "15rem",
      transition: {
        damping: 40,
      },
    },
    closed: {
      width: "4rem",
      transition: {
        damping: 40,
      },
    },
  };

  const [isOpen, setIsOpen] = useState(true);
  const links = facultyLinks;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/prof/logout");
      localStorage.removeItem("faculty");
      navigate("/");
    } catch (err) {
      // ignore
    } finally {
      navigate("/");
    }
  };

  return (
    <aside>
      <motion.div
        variants={Sidebar_animation}
        animate={isOpen ? "open" : "closed"}
        className="relative left-0 top-0 flex h-screen flex-col overflow-y-scroll overflow-x-hidden lg:overflow-y-scroll z-50 bg-black p-3 text-white"
        style={{ scrollbarWidth: "none" }}
      >
        <Link to="/">
          <img
            className="w-[50%] m-auto"
            src="/static/images/Birla_Institute_of_Technology_Mesra.png"
            alt="BIT Mesra"
          />
        </Link>

        <div className="whitespace-pre flex-1 py-4 text-sm flex flex-col gap-1">
          {links.map((link, index) => (
            <Link
              to={link.to}
              key={index}
              className={classNames(
                "cursor-pointer border-t text-neutral-200 hover:text-white border-neutral-800",
                linkclasses
              )}
            >
              <span className="text-lg flex-shrink-0">{link.icon}</span>
              {isOpen && <span className="truncate text-sm font-medium">{link.text}</span>}
            </Link>
          ))}

          <div
            onClick={handleLogout}
            className={classNames(
              "text-red-400 hover:text-red-300 mt-6 cursor-pointer border-t border-neutral-800",
              linkclasses
            )}
          >
            <span className="text-lg flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </span>
            {isOpen && <span className="text-sm font-medium">Logout</span>}
          </div>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className={classNames(
              "text-neutral-400 hover:text-white cursor-pointer border-t border-neutral-800",
              linkclasses
            )}
          >
            <span className="text-lg flex-shrink-0">
              <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`} />
            </span>
            {isOpen && <span className="text-sm font-medium">Collapse</span>}
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
