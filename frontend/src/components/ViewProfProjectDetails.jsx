import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/profProject',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
});
const ViewProfProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState({
      title: '',
      desc: '',
      profName: '',
      profEmail: '',
      startDate: '',
      endDate: '',
      categories: [],
      relevantLinks: [],
      doc: [],
      closed: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [removedDocs, setRemovedDocs] = useState([]); // State to track removed docs
    const [removedLinks, setRemovedLinks] = useState([]); // State to track removed links
    const [newFiles, setNewFiles] = useState([]); // State to track new files
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchProjectDetails = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          setProject(response.data.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching project details');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProjectDetails();
    }, [id]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setProject((prevProject) => ({
        ...prevProject,
        [name]: value,
      }));
    };
  
    const handleCategoriesChange = (e) => {
      setProject((prevProject) => ({
        ...prevProject,
        categories: e.target.value.split(',').map((cat) => cat.trim()),
      }));
    };
  
    const handleLinksChange = (e) => {
      setProject((prevProject) => ({
        ...prevProject,
        relevantLinks: e.target.value.split(',').map((link) => link.trim()),
      }));
    };
  
    const handleDocsChange = (e) => {
      setProject((prevProject) => ({
        ...prevProject,
        doc: e.target.value.split(',').map((doc) => doc.trim()),
      }));
    };
  
    const handleFileChange = (e) => {
      setNewFiles(e.target.files);
    };
  
    const handleRemoveItem = (type, index) => {
      if (type === 'doc') {
        setRemovedDocs((prev) => [...prev, project.doc[index]]);
      } else if (type === 'relevantLinks') {
        setRemovedLinks((prev) => [...prev, project.relevantLinks[index]]);
      }
  
      setProject((prevProject) => {
        const updated = [...prevProject[type]];
        updated.splice(index, 1);
        return { ...prevProject, [type]: updated };
      });
    };

      
      const handleSave = async () => {
        const { doc, relevantLinks, ...otherFields } = project;
        const payload = new FormData();
      
        // Append project details to the FormData
        payload.append('title', otherFields.title);
        payload.append('desc', otherFields.desc);
        payload.append('categories', otherFields.categories.join(', '));
        payload.append('relevantLinks', relevantLinks.join(', '));
        payload.append('startDate', otherFields.startDate);
        payload.append('endDate', otherFields.endDate);
        payload.append('closed', otherFields.closed);
        // Append each URL separately
        const deleteUrls = [...removedDocs, ...removedLinks];
        deleteUrls.forEach(url => {
        payload.append('deleteUrls[]', url);  // 'deleteUrls[]' will treat it as an array in the backend
        });
        // Append new files if any
        if (newFiles.length > 0) {
          Array.from(newFiles).forEach(file => {
            payload.append('files', file); // Ensure files are appended correctly
          });
        }
      
        try {
          const response = await api.put(`/projects/${id}`, payload, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setProject(response.data.data);
          alert('Project updated successfully!');
          setIsEditMode(false);
        } catch (err) {
          setError(err.response?.data?.message || 'Error updating project');
        }
      };
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error}</p>;
    }
  
    return (
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('/db/admin-projects-dashboard')} className="mb-4 px-4 py-2 bg-gray-500 text-white rounded">
          Back
        </button>
  
        <h1 className="text-xl font-semibold mb-6">{isEditMode ? 'Edit Project' : 'Project Details'}</h1>
  
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block font-medium text-gray-700">Title</label>
              <input
                id="title"
                name="title"
                value={project.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!isEditMode}
              />
            </div>
  
            {/* Professor Name */}
            <div>
              <label htmlFor="profName" className="block font-medium text-gray-700">Professor Name</label>
              <input
                id="profName"
                name="profName"
                value={project.profName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!isEditMode}
              />
            </div>
          </div>
  
          {/* Description */}
          <div>
            <label htmlFor="desc" className="block font-medium text-gray-700">Description</label>
            <textarea
              id="desc"
              name="desc"
              value={project.desc}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
              disabled={!isEditMode}
            />
          </div>
  
          {/* Email and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profEmail" className="block font-medium text-gray-700">Professor Email</label>
              <input
                id="profEmail"
                name="profEmail"
                value={project.profEmail}
                onChange={handleInputChange}
                type="email"
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!isEditMode}
              />
            </div>
  
            <div>
              <label htmlFor="startDate" className="block font-medium text-gray-700">Start Date</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={project.startDate.split('T')[0]} // Ensure the date is formatted correctly
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
                disabled={!isEditMode}
              />
            </div>
          </div>
  
          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block font-medium text-gray-700">End Date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={project.endDate.split('T')[0]} // Ensure the date is formatted correctly
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
              disabled={!isEditMode}
            />
          </div>
  
          {/* Categories */}
          <div>
            <label htmlFor="categories" className="block font-medium text-gray-700">Categories (comma-separated)</label>
            <input
              id="categories"
              name="categories"
              value={project.categories.join(', ')}
              onChange={handleCategoriesChange}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!isEditMode}
            />
          </div>
  
          {/* Relevant Links */}
          <div>
            <label htmlFor="relevantLinks" className="block font-medium text-gray-700">Relevant Links (comma-separated)</label>
            <input
              id="relevantLinks"
              name="relevantLinks"
              value={project.relevantLinks.join(', ')}
              onChange={handleLinksChange}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!isEditMode}
            />
            {isEditMode && project.relevantLinks.length > 0 && (
              <ul className="mt-2">
                {project.relevantLinks.map((link, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('relevantLinks', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          {/* Documents */}
          <div>
            <label htmlFor="doc" className="block font-medium text-gray-700">Documents (comma-separated)</label>
            <input
              id="doc"
              name="doc"
              value={project.doc.join(', ')}
              onChange={handleDocsChange}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!isEditMode}
            />
            {isEditMode && project.doc.length > 0 && (
              <ul className="mt-2">
                {project.doc.map((doc, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{doc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('doc', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
  
          {/* File Upload */}
          {isEditMode && (
            <div>
              <label htmlFor="file" className="block font-medium text-gray-700">Upload New Files</label>
              <input
                id="file"
                name="file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}
  
          {/* Status */}
          <div>
            <label htmlFor="closed" className="block font-medium text-gray-700">Status</label>
            <select
              id="closed"
              name="closed"
              value={project.closed ? 'Closed' : 'Open'}
              onChange={(e) => handleInputChange({ target: { name: 'closed', value: e.target.value === 'Closed' } })}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={!isEditMode}
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
  
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={isEditMode ? handleSave : () => setIsEditMode(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              {isEditMode ? 'Save Changes' : 'Edit Project'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  export default ViewProfProjectDetails;