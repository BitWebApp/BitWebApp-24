import React from "react";
import Userform from "./userform";
import { Link } from "react-router-dom";


const UserDetails = () => {
  return (
    <Link to="/u-form" className="block">
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">User Details</h2>
     
    </div>
    </Link>
  );
};


const Projectdetails = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Project-Details</h2>
     
    </div>
  );
};

export default function Dashboard() {
  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:w-full h-full">
      <UserDetails />
      <Projectdetails/>
     
    </div>
  );
}
