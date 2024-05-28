import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cliploader from "react-spinners/ClipLoader";

const AwardForm = () => {
  const [awards, setAwards] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [student, setStudent] = useState('');
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAwards = async () => {
    try {
      const response = await axios.get('/api/v1/awards');
      setAwards(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('student', student);
    formData.append('doc', doc);

    try {
      await axios.post('/api/v1/awards', formData);
      toast.success('Award created successfully!');
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      toast.error('An error occurred while saving the award');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <ToastContainer />
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Award Description</label>
              <input
                type="text"
                placeholder="Enter Award Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <label>Date Received</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter Your Full Name"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <label>Supporting Document</label>
              <input
                type="file"
                onChange={(e) => setDoc(e.target.files[0])}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
              <button
                type="submit"
                className={loading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" :"bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
              >
                {loading ? <Cliploader color="gray" /> : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AwardForm;
