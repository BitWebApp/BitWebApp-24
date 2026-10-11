import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { motion } from "framer-motion";
import axios from "axios";
import { LogOut, ChevronLeft } from "lucide-react";
import { getVisibleStudentLinks } from "../student_links";

const linkclasses =
  "flex items-center gap-6 font-light p-2.5 hover:bg-neutral-700 hover:no-underline active:bg-neutral rounded-sm text-base";

export default function Sidebar() {
  const Sidebar_animation = {
    open: {
      width: "16.5rem",
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

  // Filter links based on student year (from batch)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const links = getVisibleStudentLinks(user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/v1/users/logout");
      // console.log(response);
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      // console.log(error);
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
            alt=""
          />
        </Link>

        <div className="flex-1 py-[1rem] text-[0.9rem] flex flex-col gap-0.5">
          {links.map((link, index) => (
            <Link
              to={link.to}
              key={index}
              className={classNames(
                "cursor-pointer border-t text-white hover:bg-orange-600 border-neutral-700",
                linkclasses
              )}
            >
              <span className="text-xl shrink-0">{link.icon}</span>
              <span className="flex-1 min-w-0 break-words leading-tight">
                {link.text}
              </span>
            </Link>
          ))}
          <div
            onClick={() => handleLogout()}
            className={classNames(
              "text-red-500 mt-[2rem] cursor-pointer border-t border-neutral-700",
              linkclasses
            )}
          >
            <span className="text-xl">
              <LogOut className="w-5 h-5 shrink-0" />
            </span>
            Logout
          </div>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className={classNames(
              "text-red-500 cursor-pointer border-t border-neutral-700",
              linkclasses
            )}
          >
            <span className="text-xl">
              <ChevronLeft className="w-5 h-5 shrink-0" />
            </span>
            Collapse
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
