import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HigherEducation = () => {
  const [higherEducations, setHigherEducations] = useState([]);
  const [institute, setInstitute] = useState('');
  const [degree, setDegree] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [field, setField] = useState('');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [higherEducationId, setHigherEducationId] = useState('');

  const fetchHigherEducations = async () => {
    try {
      const response = await axios.get('/api/v1/higher-education');
      setHigherEducations(response.data.data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchHigherEducations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    formData.append('institution', institute);
    formData.append('degree', degree);
    formData.append('fieldOfStudy', field);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    Array.from(docs).forEach((doc) => {
      formData.append('files', doc);
    });
  
    try {
      if (higherEducationId) {
        await axios.put(`/api/v1/higher-education/${higherEducationId}`, formData);
        toast.success('Higher education updated successfully!');
      } else {
        await axios.post('/api/v1/higher-education', formData);
        toast.success('Higher education created successfully!');
      }
      fetchHigherEducations();
      setInstitute('');
      setDegree('');
      setField('');
      setStartDate('');
      setEndDate('');
      setDocs([]);
      setHigherEducationId('');
    } catch (error) {
      toast.error('An error occurred while saving higher education');
    } finally {
      setLoading(false);
    }
  };
  

  const handleEdit = (higherEducation) => {
    setHigherEducationId(higherEducation._id);
    setInstitute(higherEducation.institution);
    setDegree(higherEducation.degree);
    setField(higherEducation.fieldOfStudy);
    setStartDate(higherEducation.startDate);
    setEndDate(higherEducation.endDate);
    setDocs([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this higher education?')) {
      try {
        await axios.delete(`/api/v1/higher-education/${id}`);
        toast.success('Higher education deleted successfully!');
        fetchHigherEducations();
      } catch (error) {
        console.log(error.message);
        toast.error('An error occurred while deleting higher education');
      }
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newDocs = Array.from(files);
    setDocs([...docs, ...newDocs]);
  };

  return (
    <div className='flex flex-col items-center'>
      <span className='font-bold underline underline-offset-8 my-10 text-3xl'>Higher Education</span>
      <div className='w-[25rem] h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black'>
        <form className='w-full py-5 px-10 space-y-4 flex flex-col items-center' onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='Institute'
            className='inputClass'
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
          />
          <input
            type='text'
            placeholder='Degree'
            className='inputClass'
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
          />
          <input
            type='text'
            placeholder='Field of Study'
            className='inputClass'
            value={field}
            onChange={(e) => setField(e.target.value)}
          />
          <input
            type='date'
            className='inputClass'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type='date'
            className='inputClass'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <span className='font-bold underline-offset-4 underline'>Supporting Docs:</span>
          <input
            type='file'
            className='fileButton'
            onChange={handleFileChange}
            multiple
          />
          <button type='submit' className='h-10 w-44 rounded-lg border border-black bg-white font-semibold'>
            {loading ? 'Saving...' : higherEducationId ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
      <div>
        <h2>Existing Higher Education:</h2>
        <table>
          <thead>
            <tr>
              <th>Institute</th>
              <th>Degree</th>
              <th>Field of Study</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {higherEducations.map((higherEducation, index) => (
              <tr key={index}>
                <td>{higherEducation.institution}</td>
                <td>{higherEducation.degree}</td>
                <td>{higherEducation.fieldOfStudy}</td>
                <td>{new Date(higherEducation.startDate).toLocaleDateString()}</td>
                <td>{new Date(higherEducation.endDate).toLocaleDateString()}</td>
                <td>
                  <div><button onClick={() => handleEdit(higherEducation)}>Edit</button></div>
                  <div><button onClick={() => handleDelete(higherEducation._id)}>Delete</button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HigherEducation;
