import React, { Fragment, useState, useEffect } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdMenu } from 'react-icons/io';
import { IoIosArrowDown, IoIosArrowForward } from 'react-icons/io';
import classNames from 'classnames';
import axios from 'axios';
import {
  HiHome,
  HiUser,
  HiAcademicCap,
  HiBadgeCheck,
  HiDocumentReport,
  HiOutlineBriefcase,
  HiPresentationChartLine,
  HiBriefcase,
  HiOutlineLogout,
  HiArchive,
} from "react-icons/hi";
import facultyLinks from '../faculty_links';
import useLinks from './admin/user-links';
const linkClasses = 'flex items-center gap-6 font-light p-2.5 hover:bg-neutral-700 hover:no-underline active:bg-neutral rounded-sm text-base';
const BATCHES = ["K22", "K23", "K24", "K25", "K26"];

export default function Header() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [user, setUser] = useState();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [courseDocs, setCourseDocs] = useState([]);
  const loggedIn = JSON.parse(localStorage.getItem('faculty'));

  useEffect(() => {
    axios.get('/api/v1/course-docs')
      .then(res => setCourseDocs(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get('/api/v1/prof/getcurrentProf')
      .then(response => {
        setUser(response.data.message);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date();
      const clock = newTime.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        weekday: 'long',
        year: 'numeric',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(clock);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const links = facultyLinks;

  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    // try {
    //   const response = await axios.post('/api/v1/users/logout');
    //   localStorage.removeItem('user');
    //   navigate('/');
    // } catch (error) {
    //   console.error(error);
      try {
        const resp = await axios.post('/api/v1/prof/logout');
        localStorage.removeItem('faculty');
        navigate('/');
      } catch (err) {
        console.error(err);
    } finally {
      navigate('/');
    }
  };

  return (
    <div className='sticky top-0 z-40 bg-white h-16 px-4 flex w-full py-2 items-center border-b border-black'>
      <div className='flex'>
        <Popover className='navbar'>
          {({ open }) => (
            <>
              <Popover.Button
                onClick={() => setIsNavbarOpen(!isNavbarOpen)}
                className='p-1.5 inline-flex items-center text-gray-700 hover:text-capacity-100 focus:outline-none active:bg-gray-200'
              >
                <IoMdMenu fontSize={32} className='text-3xl visible md:hidden hover:opacity-70 cursor-pointer text-black m-2' />
              </Popover.Button>
              <Transition
                show={isNavbarOpen}
                as={Fragment}
                enter='transition duration-200 ease-out'
                enterFrom='opacity-0 translate-y-1'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-1'
              >
               <Popover.Panel
  className='absolute left-0 z-10 mt-2.5 w-full bg-black max-h-[70vh] overflow-y-auto'
>
  <div className='whitespace-pre flex-1 py-[1rem] text-[0.9rem] text-red-500 flex flex-col gap-0.5'>
    {links.map((link, index) => {
      if (link.isCourseDoc) {
        const isExpanded = !!openDropdowns[link.courseName];
        return (
          <div key={index} className="flex flex-col border-t border-neutral-700">
            <div
              className={classNames('cursor-pointer flex justify-between items-center text-white hover:bg-neutral-700', linkClasses)}
              onClick={() => {
                setOpenDropdowns(prev => ({
                  ...prev,
                  [link.courseName]: !prev[link.courseName]
                }));
              }}
            >
              <div className="flex items-center gap-6">
                <span className='text-xl'>{link.icon}</span>
                <span>{link.text}</span>
              </div>
              <span className="text-neutral-400 p-1">
                {isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />}
              </span>
            </div>

            {isExpanded && (
              <div className="bg-neutral-900/90 py-1 pl-8 pr-4 flex flex-col gap-1 border-l-2 border-neutral-700 my-1">
                <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-0.5">
                  Select Batch PDF:
                </span>
                {BATCHES.map(b => {
                  const doc = courseDocs.find(d => d.course === link.courseName && d.batch === b);
                  if (doc && doc.pdfUrl) {
                    return (
                      <a
                        key={b}
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeNavbar}
                        className="flex items-center justify-between px-3 py-1.5 text-xs text-neutral-200 hover:text-white hover:bg-neutral-800 rounded font-medium"
                      >
                        <span>Batch {b}</span>
                        <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">
                          PDF
                        </span>
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={b}
                      to={`/faculty-db/course-document?course=${encodeURIComponent(link.courseName)}&batch=${b}`}
                      onClick={closeNavbar}
                      className="flex items-center justify-between px-3 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
                    >
                      <span>Batch {b}</span>
                      <span className="text-[10px] text-neutral-500 italic">No PDF</span>
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
          className={classNames('cursor-pointer border-t border-neutral-700 text-white hover:bg-neutral-700', linkClasses)}
          onClick={closeNavbar}
        >
          <span className='text-xl'>{link.icon}</span>
          {link.text}
        </Link>
      );
    })}
    <div
      onClick={() => { handleLogout(); closeNavbar(); }}
      className={classNames('text-red-500 mt-[2rem] cursor-pointer border-t border-neutral-700', linkClasses)}
    >
      <span className='text-xl'>
        <HiOutlineLogout />
      </span>
      Logout
    </div>
    <div
      className={classNames('text-red-500 cursor-pointer border-t border-neutral-700', linkClasses)}
      onClick={closeNavbar}
    >
      <span className='text-xl'>
        <HiOutlineLogout />
      </span>
      Collapse
    </div>
  </div>
</Popover.Panel>

              </Transition>
            </>
          )}
        </Popover>
        <div className='flex h-full m-auto rounded-sm'>
          Welcome, {user?.fullName?.toUpperCase()}
        </div>
      </div>
      <div className='ml-auto flex items-center gap-2 mr-2'>
        <Menu as='div' className='relative'>
          <div className='inline-flex'>
            <Menu.Button className='ml-2 inline-flex rounded-full bg-grey-200 focus:outline-none focus:ring-2 focus:ring-neutral-400'>
              <span className='sr-only'>Open user menu</span>
              <div
                className={`h-10 w-10 ${user?.isVerified ? 'border-green-500' : 'border-red-500'} border-2 rounded-full bg-black bg-cover bg-no-repeat bg-center`}
                style={{ backgroundImage: `url(${(user) ? user?.image : "/static/images/profile.png"})` }}
              ></div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => { handleLogout(); closeNavbar(); }}
                    className={classNames(
                      active && 'bg-gray-100',
                      'text-gray-700 focus:bg-gray-200 cursor-pointer rounded-sm px-4 w-full py-2'
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
