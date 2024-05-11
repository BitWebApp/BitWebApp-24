import React, { Fragment } from 'react';
import { Popover, Transition, Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { IoMdMenu } from 'react-icons/io';
import { HiOutlineLogout } from "react-icons/hi";
import classNames from 'classnames';
import { useState } from 'react';
import { HiOutlineDocumentAdd  } from "react-icons/hi";
const linkClasses = 'flex items-center gap-6 font-light p-2.5 hover:bg-neutral-700 hover:no-underline active:bg-neutral rounded-sm text-base';
const additionalLinks = [
   
  { text: "User-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, 
{ text: "Academic-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, { text: "Award-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, { text: "Exam-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, { text: "Higher Education-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, { text: "Placement-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, { text: "Project-Form", icon: <HiOutlineDocumentAdd />,to:"//db/user-form"
}, { text: "Internship-Form", icon: <HiOutlineDocumentAdd />,to:"/db/user-form"
}, 
 
];
export default function Header() {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);
    const closeNavbar = () => {
        setIsNavbarOpen(false);
    };
  return (
    <div className='sticky top-0 z-40 bg-white h-16 px-4 flex w-full py-2 items-center border-b border-gray-200'>
      <div className='flex'>
        <Popover className="navbar">
          {({ open }) => (
            <>
              <Popover.Button
                onClick={() => setIsNavbarOpen(!isNavbarOpen)}
                className="p-1.5 inline-flex items-center text-gray-700  hover:text-capacity-100 focus:outline-none active:bg-gray-200"
              >
                <IoMdMenu fontSize={32} className='text-3xl visible md:hidden hover:opacity-70 cursor-pointer text-black m-2' />
              </Popover.Button>
              <Transition
                show={isNavbarOpen}
                as={Fragment}
                enter="transition duration-200 ease-out"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel className="absolute left-0 z-10 mt-2.5 w-full  opacity-100 bg-yellow-300">
                  <div className='whitespace-pre flex-1 py-[1rem] text-[0.9rem] text-red-700 flex flex-col gap-0.5'>
                 
                  {additionalLinks.map((link, index) => (
  <Link to={link.to} key={index} className={classNames('cursor-pointer border-t border-neutral-700', linkClasses)}>
    <span className="text-xl">{link.icon}</span>
    {link.text}
  </Link>
))}

                    <div className={classNames('text-red-500 mt-[2rem] cursor-pointer border-t border-neutral-700', linkClasses)}>
                      <span className="text-xl">
                        <HiOutlineLogout   />
                      </span>
                      Logout
                    </div>
                    <div className={classNames('text-red-500 cursor-pointer border-t border-neutral-700', linkClasses)} onClick={closeNavbar}>
                      <span className="text-xl">
                        <HiOutlineLogout   />
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
          Welcome
        </div>
      </div>
      <div className='ml-auto flex items-center gap-2 mr-2'>
        <Menu as="div" className="relative">
          <div className='inline-flex'>
            <Menu.Button className="ml-2 inline-flex rounded-full bg-grey-200 focus:outline-none focus:ring-2 focus:ring-neutral-400">
              <span className='sr-only'>Open user menu</span>
              <div className="h-10 w-10 rounded-full bg-black bg-cover bg-no-repeat bg-center" style={{ backgroundImage: '' }}>
              </div>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="origin-top-right z-10 absolute right-0 mt-2 w-48 rounded-sm shadow-md p-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link to="/db/profile">
                  <button className={classNames(
                    active && 'bg-gray-100',
                    "text-gray-700 focus:bg-gray-200 cursor-pointer rounded-sm px-4 w-full py-2"
                  )}>
                    Your Profile
                  </button>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button className={classNames(
                    active && 'bg-gray-100',
                    "text-gray-700 focus:bg-gray-200 cursor-pointer rounded-sm px-4 w-full py-2"
                  )}>
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
