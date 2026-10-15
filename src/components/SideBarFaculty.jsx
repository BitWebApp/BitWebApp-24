import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames";
import { HiOutlineLogout } from "react-icons/hi";
import { motion } from "framer-motion";
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
} from "react-icons/io";
import axios from "axios";
import facultyLinks from "../faculty_links.jsx";

const BATCHES = ["K22", "K23", "K24", "K25", "K26"];

const linkclasses =
  "flex items-center gap-6 font-light p-2.5 hover:bg-neutral-700 hover:no-underline active:bg-neutral rounded-sm text-base";

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
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [courseDocs, setCourseDocs] = useState([]);
  const links = facultyLinks;
  const navigate = useNavigate();

  // Fetch course documents so sidebar can immediately link to PDFs
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await axios.get("/api/v1/course-docs");
        setCourseDocs(res.data.data || []);
      } catch (err) {
        // Silently catch in sidebar
      }
    };
    fetchDocs();
  }, []);

  const toggleDropdown = (courseName) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setOpenDropdowns((prev) => ({
      ...prev,
      [courseName]: !prev[courseName],
    }));
  };

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

  const getDoc = (course, batch) =>
    courseDocs.find((d) => d.course === course && d.batch === batch);

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

        <div className="whitespace-pre flex-1 py-[1rem] text-[0.9rem] flex flex-col gap-0.5">
          {links.map((link, index) => {
            if (link.isCourseDoc) {
              const isExpanded = !!openDropdowns[link.courseName];
              return (
                <div key={index} className="flex flex-col border-t border-neutral-700">
                  <div
                    className={classNames(
                      "flex items-center justify-between cursor-pointer text-white hover:bg-orange-600 rounded-sm",
                      linkclasses
                    )}
                    onClick={() => toggleDropdown(link.courseName)}
                  >
                    <Link
                      to={link.to}
                      onClick={(e) => {
                        // Allow clicking text to navigate or toggle
                        e.stopPropagation();
                      }}
                      className="flex items-center gap-6 flex-1 text-white hover:no-underline"
                    >
                      <span className="text-xl flex-shrink-0">{link.icon}</span>
                      {isOpen && (
                        <span className="truncate text-sm">{link.text}</span>
                      )}
                    </Link>

                    {isOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDropdown(link.courseName);
                        }}
                        className="text-neutral-400 hover:text-white p-1"
                        title="Toggle Batch Dropdown"
                      >
                        {isExpanded ? (
                          <IoIosArrowDown className="text-base" />
                        ) : (
                          <IoIosArrowForward className="text-base" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Batch Dropdown */}
                  {isOpen && isExpanded && (
                    <div className="bg-neutral-900/90 py-1 pl-4 pr-2 rounded my-1 flex flex-col gap-1 border-l-2 border-orange-500">
                      <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-0.5">
                        Select Batch PDF:
                      </div>
                      {BATCHES.map((b) => {
                        const doc = getDoc(link.courseName, b);
                        if (doc && doc.pdfUrl) {
                          return (
                            <a
                              key={b}
                              href={doc.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-200 hover:text-white hover:bg-orange-600 rounded transition font-medium"
                              title={`Open ${link.courseName} Batch ${b} PDF`}
                            >
                              <span>Batch {b}</span>
                              <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wide">
                                PDF
                              </span>
                            </a>
                          );
                        }
                        return (
                          <Link
                            key={b}
                            to={`/faculty-db/course-document?course=${encodeURIComponent(
                              link.courseName
                            )}&batch=${b}`}
                            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition"
                            title={`Batch ${b} (No PDF uploaded yet)`}
                          >
                            <span>Batch {b}</span>
                            <span className="text-[10px] text-neutral-500 italic">
                              No PDF
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                to={link.to}
                key={index}
                className={classNames(
                  "cursor-pointer border-t text-white hover:bg-orange-600 border-neutral-700",
                  linkclasses
                )}
              >
                <span className="text-xl flex-shrink-0">{link.icon}</span>
                {isOpen && <span>{link.text}</span>}
              </Link>
            );
          })}

          <div
            onClick={() => handleLogout()}
            className={classNames(
              "text-red-500 mt-[2rem] cursor-pointer border-t border-neutral-700",
              linkclasses
            )}
          >
            <span className="text-xl flex-shrink-0">
              <HiOutlineLogout />
            </span>
            {isOpen && <span>Logout</span>}
          </div>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className={classNames(
              "text-red-500 cursor-pointer border-t border-neutral-700",
              linkclasses
            )}
          >
            <span className="text-xl flex-shrink-0">
              <IoIosArrowBack />
            </span>
            {isOpen && <span>Collapse</span>}
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
