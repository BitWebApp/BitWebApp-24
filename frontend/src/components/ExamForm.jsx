import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExamForm = () => {
    const [exams, setExams] = useState([]);
    const [examRoll, setExamRoll] = useState("");
    const [examName, setExamName] = useState("NET");
    const [academicYear, setAcademicYear] = useState("");
    const [docs, setDocs] = useState([]);
    const [isSelected, setIsSelected] = useState(true);
    const [score, setScore] = useState("");
    const [loading, setLoading] = useState(false);
    const [tempExamName, setTempExamName] = useState("");
    // Fetch exams
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("examRoll", examRoll);
            formData.append("examName", examName);
            formData.append("academicYear", academicYear);
            formData.append("isSelected", isSelected);
            formData.append("score", score);
            docs.forEach((doc) => {
                formData.append("files", doc);
            });

            const token = localStorage.getItem("accessToken"); 
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}` 
                },
            };

            const response = await axios.post("/api/v1/exam", formData, config);

            setExamRoll("");
            setExamName("NET");
            setAcademicYear("");
            setDocs([]);
            setIsSelected(true);
            setScore("");

            fetchExams(); // Fetch exams after successful submission
            console.log(response);
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        const newDocs = Array.from(files); // Convert FileList to array
        setDocs([...docs, ...newDocs]); // Concatenate new files with existing files
    };
    
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/v1/exam/${id}`);
            fetchExams(); 
        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <div className='flex flex-col items-center'>
            <span className="font-bold underline underline-offset-8 my-10 text-3xl">Exam Form</span>
            <div className='w-[25rem] h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black ' >
                <form className='w-full py-5 px-10 space-y-4 flex flex-col items-center' onSubmit={handleSubmit}>
                    <input 
                        type="text"
                        placeholder="Exam Roll No."
                        className="inputClass"
                        value={examRoll}
                        onChange={(e) => setExamRoll(e.target.value)}
                    />
                   <select 
                        value={tempExamName} // Use tempExamName here instead of examName
                        onChange={(e) => {
                            const selectedExamName = e.target.value;
                            if(selectedExamName !== 'Other equivalent examination') {
                                setExamName(selectedExamName); // Update examName if selectedExamName is not "Other equivalent examination"
                            }
                            setTempExamName(selectedExamName); // Update tempExamName always
                        }}
                        className="inputClass"
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
                            value={examName} // Use examName here
                            onChange={(e) => setExamName(e.target.value)} // Update examName directly
                            className="inputClass"
                        />
                )}


                    <input 
                        type="text"
                        placeholder="Academic Year"
                        className="inputClass"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                    />
                    <input 
                        type="number"
                        placeholder="Score"
                        className="inputClass"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                    />
                    <span className='font-bold underline-offset-4 underline'>Supporting Docs:</span>
                    <input 
                        type="file"
                        className="fileButton"
                        onChange={handleFileChange}
                        multiple
                    />
                    <button type="submit" className="h-10 w-44 rounded-lg border border-black bg-white font-semibold">
                        {"Upload"}
                    </button>
                </form>
            </div>
            <div>
                <h2>Existing Exams:</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Roll Number</th>
                            <th>Exam Name</th>
                            <th>Academic Year</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map((exam, index) => (
                            <tr key={index}>
                                <td>{exam.examRoll}</td>
                                <td>{exam.examName}</td>
                                <td>{exam.academicYear}</td>
                                <td>
                                    <button onClick={() => handleDelete(exam._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
};

export default ExamForm;
