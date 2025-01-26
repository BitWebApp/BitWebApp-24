import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function Layout({ sidebar: Sidebar, header: Header }) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth < 768);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-neutral-100">
      <div className="flex h-screen overflow-hidden">
        {!isSmallScreen && Sidebar && <Sidebar />} {/* Conditionally render the Sidebar */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {Header && <Header />} {/* Render the Header if passed */}
          <main>
            <div className="min-h-screen flex flex-col space-y-10 p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
