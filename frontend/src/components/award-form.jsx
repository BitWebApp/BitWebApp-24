// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// export default function Awardform() {
//   const [award, setaward] = useState("");
//   const [dor, setdor] = useState("");
//   const [des, setdes] = useState("");
//   const [fullName, setFullName] = useState("");
//   const [rollNumber, setRollNumber] = useState("");
//   const [supdoc, setsupdoc] = useState("");
//   const [spin,setSpin]=useState(false);

//   // console.log(localStorage.getItem('user'));
//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   // Handle form submission
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSpin(true);
//     try {
//       const tokenString=localStorage.getItem('user');
//       const token=JSON.parse(tokenString);
//       const formData = {
//         title: award,
//         date: dor,
//         description: des,
//         student:token._id,
//         roll:rollNumber,
//         doc:supdoc
//       };
//       const response = await axios.post("/api/v1/awards/addaward", formData, {
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       });
//       console.log(response.data);
//       toast.success("Data uploaded successfully!");
//       setTimeout(() => {
//         navigate("/db");
//       }, 2000);
//     } catch (err) {
//       console.log(err);
//       toast.error("Error uploading data!");
//     } finally {
//       setSpin(false);
//     }
//   };

//   return (
//     <div className="w-full min-h-screen flex justify-center items-center ">
//       <div className="w-full flex flex-col p-6 justify-between">
//         <div className="w-full flex flex-col">
//           <div className="flex flex-col w-full mb-5">
//             <h3 className="text-3xl font-semibold mb-4">Award Form</h3>
//             <p className="text-base mb-2">Enter Your details.</p>
//           </div>
          
//           <form onSubmit={handleSubmit}>
//             <div className="w-full flex flex-col">
//               <label>Award Name</label>
//               <input
//                 type="text"
//                 placeholder="Enter Your Award Name"
//                 value={award}
//                 onChange={(e) => setaward(e.target.value)}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//                 required
//               />
//               <label>Award Description</label>
//               <input
//                 type="text"
//                 placeholder="Enter Award Description"
//                 value={des}
//                 onChange={(e) => setdes(e.target.value)}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//                 required
//               />
//               <label>Date Received</label>
//               <input
//                 type="date"
//                 value={dor}
//                 onChange={(e) => setdor(e.target.value)}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//               />
//               <label>Full Name</label>
//               <input
//                 type="text"
//                 placeholder="Enter Your Full Name"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//               />
//               <label>Roll Number</label>
//               <input
//                 type="text"
//                 placeholder="Enter Your Roll Number"
//                 value={rollNumber}
//                 onChange={(e) => setRollNumber(e.target.value)}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//               />
//               <label>Supporting Document</label>
//               <input
//                 type="file"
//                 // value={supdoc}
//                 onChange={(e) => setsupdoc(e.target.files[0])}
//                 className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
//               />
//               <button
//                 type="submit"
//                 className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
//               >
//                 Submit
//               </button>
//             </div>
//           </form>
//           <div className="w-full items-center justify-center flex">
//             <p className="text-sm font-normal text-black">
//               <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
//                 <Link to="/db">Go back to Dashboard</Link>
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Awardform() {
  const [award, setAward] = useState("");
  const [dor, setDor] = useState("");
  const [des, setDes] = useState("");
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [supdoc, setSupdoc] = useState(null);
  const [spin, setSpin] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSpin(true);
    try {
      const tokenString = localStorage.getItem('user');
      const token = JSON.parse(tokenString);

      const formData = new FormData();
      formData.append('title', award);
      formData.append('date', dor);
      formData.append('description', des);
      formData.append('student', token._id);
      formData.append('roll', rollNumber);
      formData.append('doc', supdoc);

      const response = await axios.post("/api/v1/awards/addaward", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
      toast.success("Data uploaded successfully!");
      setTimeout(() => {
        navigate("/db");
      }, 2000);
    } catch (err) {
      console.log(err);
      toast.error("Error uploading data!");
    } finally {
      setSpin(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full flex flex-col p-6 justify-between">
        <div className="w-full flex flex-col">
          <div className="flex flex-col w-full mb-5">
            <h3 className="text-3xl font-semibold mb-4">Award Form</h3>
            <p className="text-base mb-2">Enter Your details.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <label>Award Name</label>
              <input
                type="text"
                placeholder="Enter Your Award Name"
                value={award}
                onChange={(e) => setAward(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Award Description</label>
              <input
                type="text"
                placeholder="Enter Award Description"
                value={des}
                onChange={(e) => setDes(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Date Received</label>
              <input
                type="date"
                value={dor}
                onChange={(e) => setDor(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Roll Number</label>
              <input
                type="text"
                placeholder="Enter Your Roll Number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Supporting Document</label>
              <input
                type="file"
                onChange={(e) => setSupdoc(e.target.files[0])}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <button
                type="submit"
                className="bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"
              >
                Submit
              </button>
            </div>
          </form>
          <div className="w-full items-center justify-center flex">
            <p className="text-sm font-normal text-black">
              <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db">Go back to Dashboard</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
