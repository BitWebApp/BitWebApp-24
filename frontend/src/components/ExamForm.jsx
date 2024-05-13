import React, { useState } from 'react'
import { Link } from 'react-router-dom'
const ExamForm = () => {
    const [name,setName] = useState("")
    const [examRoll,setExamRoll] = useState("")
    const [rollNumber,setRollNumber] = useState("")
    const [examName,setExamName] = useState("")
    const [score,setScore] = useState()
    const handleSubmit = () => {
        e.preventDefault()
        axios.post("/api/v1/exam", { 
            name,
            examRoll,
            rollNumber,
            examName,
            score
        })  
        .then(response => {
            console.log(response);
            navigate('/db'); // Navigate to '/db' after successful form submission
        })
        .catch(error => {
            console.log(error.message);
        });
    }
  return (
    <div className='flex flex-col items-center'>
        <span className="font-bold underline underline-offset-8 my-10 text-3xl">Exam Form</span>
        <div className='w-[25rem] h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black ' >
            <form className='w-full py-5 px-10 space-y-4 flex flex-col items-center'>
                <input 
                    type="text"
                    placeholder="Name"
                    className="inputClass"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />
                <input 
                    type="text"
                    placeholder="Exam Roll No."
                    className="inputClass"
                    value={examRoll}
                    onChange={(e) => setExamRoll(e.target.value)}
                    />
                <input 
                    type="text"
                    placeholder="Roll No."
                    className="inputClass"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    />
                <input 
                    type="text"
                    placeholder="Exam Name"
                    className="inputClass"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
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
                />
                <button type="submit" onClick={handleSubmit} className="h-10 w-44 rounded-lg border border-black bg-white font-semibold">Upload</button>
                <span className="font-semibold underline underline-offset cursor-pointer text-blue-600">
                <Link to="/db">Go back to Dashboard</Link>
              </span>
            </form>
        </div>
    </div>
  )
}

export default ExamForm
