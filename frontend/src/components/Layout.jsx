import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768); // Adjust the breakpoint as needed
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-neutral-100">
      <div className="flex h-screen overflow-hidden">
        {!isSmallScreen && <Sidebar />} {/* Conditionally render the Sidebar */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          <main>
            <div className="mx-auto p-4 md:p-6 2xl:p-10 h-screen">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}
