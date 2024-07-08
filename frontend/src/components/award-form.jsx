import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from "react-spinners/ClipLoader";
import Swal from 'sweetalert2';

const AwardForm = () => {
  const [awards, setAwards] = useState([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [student, setStudent] = useState('');
  const [proId, setproId] = useState("");
  const [doc, setDoc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfigs, setSortConfigs] = useState([]);
 
  
  const fetchAwards = async () => {
    try {
      const response = await axios.get('/api/v1/awards');
      console.log(response.data.data);
      setAwards(response.data.data);
    } catch (error) {
      console.error('Error fetching awards:', error.message);
     
      toast.error('Failed to fetch awards');
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to submit the form?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'No, cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('title', title);
          formData.append('description', description);
          formData.append('date', date);
          formData.append('student', student);
          doc.forEach((docFile) => {
            formData.append('doc', docFile);
          });

          const token = localStorage.getItem("accessToken");
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          };
        
          let response;
          if (proId) {
            response = await axios.put(`/api/v1/awards/${proId}`, formData, config);
          } else {
            response = await axios.post("/api/v1/awards", formData, config);
          }
          toast.success("Award details added");
          Swal.fire({
            title: 'Success!',
            text: 'Award created successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          });

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          toast.error("Something went wrong");
          console.error('Error :', error.message);
          Swal.fire('Error!', 'Failed to submit the award form', 'error');
        } finally {
          setTitle('');
          setDate('');
          setDescription('');
          setStudent('');
          setDoc([]);
          fetchAwards();
          setproId("");
          setLoading(false);
        }
      }
    });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newDocs = Array.from(files);
    setDoc([...doc, ...newDocs]);
  };

  const handleSortOptionChange = async (field, e) => {
    const direction = e.target.value;
    const newConfig = direction === 'Sort By' ? null : { field, direction };
    setSortConfigs((prevConfigs) => {
      const otherConfigs = prevConfigs.filter((config) => config.field !== field);
      return newConfig ? [...otherConfigs, newConfig] : otherConfigs;
    });
  };

  const getSortDirection = (field) => {
    const config = sortConfigs.find((config) => config.field === field);
    return config ? config.direction : 'Sort By';
  };

  const sortAwards = (awards, configs) => {
    return awards.sort((a, b) => {
      for (const config of configs) {
        const { field, direction } = config;
        let comparison = 0;
        if (typeof a[field] === 'string' && typeof b[field] === 'string') {
          comparison = a[field].localeCompare(b[field]);
        } else {
          comparison = a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0;
        }
        if (direction === 'descending') comparison *= -1;
        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  };

  const sortedAwards = sortAwards([...awards], sortConfigs);
  const filteredAwards = sortedAwards.filter((award) =>
    Object.values(award).some((value) =>
      typeof value === 'string' ? value.toLowerCase().includes(searchQuery.toLowerCase()) : false
    )
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
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
              <label>Upload Supporting Document</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                required
              />
              <button
                type="submit"
                className={
                  loading
                    ? 'bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90'
                    : 'bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90'
                }
              >
                {loading ? <ClipLoader color="gray" /> : 'SUBMIT'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4 text-center">AWARD DETAILS</h1>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 px-4 py-2 border rounded w-full"
        />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Award Name
                  <div>
                    <select
                      value={getSortDirection('title')}
                      onChange={(e) => handleSortOptionChange('title', e)}
                    >
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Received
                  <div>
                    <select
                      value={getSortDirection('date')}
                      onChange={(e) => handleSortOptionChange('date', e)}
                    >
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                  <div>
                    <select
                      value={getSortDirection('description')}
                      onChange={(e) => handleSortOptionChange('description', e)}
                    >
                      <option value="Sort By">Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                    </select>
                
                 
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supporting Document
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAwards.map((award) => (
                <tr key={award._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{award.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(award.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{(award.description)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
  {award.doc ? (
    <a href={award.doc} target="_blank" rel="noopener noreferrer">View Document</a>
  ) : (
    <span>No document available</span>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AwardForm;
