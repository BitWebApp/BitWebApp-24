import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClipLoader from "react-spinners/ClipLoader";

const ExamForm = () => {
    const [exams, setExams] = useState([]);
    const [examRoll, setExamRoll] = useState("");
    const [examName, setExamName] = useState("NET");
    const [academicYear, setAcademicYear] = useState("");
    const [docs, setDocs] = useState([]);
    const [isSel, setIsSel] = useState(true);
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(false);
    const [tempExamName, setTempExamName] = useState("");
    const [examId, setExamId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfigs, setSortConfigs] = useState([]);

    const fetchExams = async () => {
        try {
            const response = await axios.get("/api/v1/exam");
            setExams(response.data.data);
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleEdit = (exam) => {
        setExamId(exam._id);
        setExamRoll(exam.examRoll);
        setExamName(exam.examName);
        setAcademicYear(exam.academicYear);
        setIsSel(exam.isSel);
        setScore(exam.score);
        setDocs([]);

        if (exam.examName === "Other equivalent examination") {
            setTempExamName("Other equivalent examination");
        } else {
            setTempExamName("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("examRoll", examRoll);
            formData.append("examName", examName);
            formData.append("academicYear", academicYear);
            formData.append("isSel", isSel);
            formData.append("score", score);
            docs.forEach((doc) => {
                formData.append("files", doc);
            });

            const token = localStorage.getItem("accessToken");
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            };

            try {
                let response;
                if (examId) {
                    response = await axios.put(`/api/v1/exam/${examId}`, formData, config);
                } else {
                    response = await axios.post("/api/v1/exam", formData, config);
                }
                toast.success("exam details added")
                setTimeout(() => {
                    window.location.reload()
                }, 2000)
            } catch (error) {
                toast.error("Something went wrong")
            }
            setExamRoll("");
            setExamName("NET");
            setAcademicYear("");
            setDocs([]);
            setIsSel(false);
            setScore("");
            setExamId("");
            fetchExams();
            console.log(response);
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const newDocs = Array.from(files);
        setDocs([...docs, ...newDocs]);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/exam/${id}`);
            fetchExams();
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleSortOptionChange = async (field, e) => {
        const direction = e.target.value;
        const newConfig = direction === 'Sort By' ? null : { field, direction };
        await setSortConfigs((prevConfigs) => {
            const otherConfigs = prevConfigs.filter(config => config.field !== field);
            return newConfig ? [...otherConfigs, newConfig] : otherConfigs;
        });
    };

    const getSortDirection = (field) => {
        const config = sortConfigs.find(config => config.field === field);
        return config ? config.direction : 'Sort By';
    };

    const sortExams = (exams, configs) => {
        return exams.sort((a, b) => {
            for (const config of configs) {
                const { field, direction } = config;
                let comparison = 0;
                if (typeof a[field] === 'string' && typeof b[field] === 'string') {
                    comparison = a[field].localeCompare(b[field]);
                } else {
                    comparison = a[field] > b[field] ? 1 : (a[field] < b[field] ? -1 : 0);
                }
                if (direction === 'descending') comparison *= -1;
                if (comparison !== 0) return comparison;
            }
            return 0;
        });
    };

    const sortedExams = sortExams([...exams], sortConfigs);

    const filteredExams = sortedExams.filter((exam) =>
        Object.values(exam).some((value) =>
            typeof value === 'string' ?
            value.toLowerCase().includes(searchQuery.toLowerCase()) :
            value.toString().includes(searchQuery)
        )
    );

    const handleRowSelect = (id) => {
        setSelectedRows((prevSelectedRows) => {
            if (prevSelectedRows.includes(id)) {
                return prevSelectedRows.filter((rowId) => rowId !== id);
            } else {
                return [...prevSelectedRows, id];
            }
        });
    };

    return (
        <div className="w-full min-h-screen flex flex-col items-center">
            <ToastContainer />
            <div className="w-full flex flex-col p-6 justify-between">
                <div className="w-full flex flex-col">
                    <div className="flex flex-col w-full mb-5">
                        <h3 className="text-3xl font-semibold mb-4">Exam Form</h3>
                        <p className="text-base mb-2">Enter Your details.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="w-full flex flex-col">
                            <label>Exam Roll No.</label>
                            <input
                                type="text"
                                placeholder="Enter Your Exam Roll No."
                                value={examRoll}
                                onChange={(e) => setExamRoll(e.target.value)}
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                required
                            />
                            <label>Exam Name</label>
                            <select
                                value={tempExamName}
                                onChange={(e) => {
                                    const selectedExamName = e.target.value;
                                    if (selectedExamName !== 'Other equivalent examination') {
                                        setExamName(selectedExamName);
                                    }
                                    setTempExamName(selectedExamName);
                                }}
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                            >
                                <option value="NET">NET</option>
                                <option value="SLET">SLET</option>
                                <option value="GATE">GATE</option>
                                <option value="GMAT">GMAT</option>
                                <option value="CAT">CAT</option>
                                <option value="JAM">JAM</option>
                                <option value="GRE">GRE</option>
                                <option value="IELET">IELET</option>
                                <option value="TOEFL">TOEFL</option>
                                <option value="Civil Services">Civil Services</option>
                                <option value="State Government Examinations">State Govt. Exams</option>
                                <option value="Other equivalent examination">Other equivalent examination</option>
                            </select>
                            {tempExamName === "Other equivalent examination" && (
                                <input
                                    type="text"
                                    placeholder="Enter Other Exam Name"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                />
                            )}
                            <label>Academic Year</label>
                            <input
                                type="text"
                                placeholder="Enter Academic Year"
                                value={academicYear}
                                onChange={(e) => setAcademicYear(e.target.value)}
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                required
                            />
                            <label>Score</label>
                            <input
                                type="number"
                                placeholder="Enter Your Score"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                required
                            />
                            <label>Upload Supporting Documents</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                multiple
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                            />
                            <div className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    id="isSel"
                                    checked={isSel}
                                    onChange={(e) => setIsSel(e.target.checked)}
                                    className="mr-2"
                                />
                                <label htmlFor="isSel">I have cleared this examination.</label>
                            </div>
                            <button
                                type="submit"
                                className={loading ? "bg-black text-white w-full rounded-md p-4 text-center flex items-center opacity-70 justify-center my-2 hover:bg-black/90" : "bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90"}
                            >
                                {loading ? <ClipLoader color="gray" /> : "SUBMIT"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4 text-center">EXAMINATION DETAILS</h1>
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
                                    <input type="checkbox" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Exam Name
                                    <div>
                                        <select value={getSortDirection('examName')||''} onChange={(e) => handleSortOptionChange('examName', e)}>
                                            <option value="Sort By">Sort By</option>
                                            <option value="ascending">Ascending</option>
                                            <option value="descending">Descending</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                    <div>
                                        <select value={getSortDirection('score')||''} onChange={(e) => handleSortOptionChange('score', e)}>
                                            <option value="Sort By">Sort By</option>
                                            <option value="ascending">Ascending</option>
                                            <option value="descending">Descending</option>
                                        </select>
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Supporting Doc
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredExams.map((exam) => (
                                <tr key={exam._id} className={selectedRows.includes(exam._id) ? 'bg-gray-100' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleRowSelect(exam._id)}
                                            checked={selectedRows.includes(exam._id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{exam.examName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{exam.score}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {exam.docs.map((doc, index) => (
                                            <div key={index}>
                                                <a href={doc} target="_blank" rel="noopener noreferrer">Document {index + 1}</a>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(exam)}>Edit</button>
                                        <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleDelete(exam._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ExamForm;
