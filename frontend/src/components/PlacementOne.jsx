import React, { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const PlacementOne = () => {
    const [company,setCompany] = useState("")
    const [ctc,setCTC] = useState("")
    const [date,setDate] = useState("")
    const navigate = useNavigate()
    const handleSubmit = (e) =>{
        e.preventDefault()
        axios.post("/api/v1/users/pone", {
            company,
            ctc,
            date
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
        <span className="font-bold underline underline-offset-8 my-10 text-3xl">Placement Record Data - 1</span>
        <div className='w-[25rem] h-auto flex flex-col justify-between items-center bg-lime-100 rounded-lg border-2 border-black ' >
            
            <form className='w-full py-5 px-10 space-y-4 flex flex-col items-center'>
                
                <input 
                    type="text"
                    placeholder="Company Name"
                    className="inputClass"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    />
                <input 
                    type="text"
                    placeholder="CTC"
                    className="inputClass"
                    value={ctc}
                    onChange={(e) => setCTC(e.target.value)}
                    />
                <span className="font-bold underline text-md">Date of joining:</span>
                <input 
                    type="date"
                    placeholder="Date"
                    className="inputClass"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    />
                <span className='font-bold underline-offset-4 underline'>Supporting Docs:</span>
                <input 
                    type="file"
                    className="fileButton"
                    />
                <button type="submit" onClick={handleSubmit} className="h-10 w-44 rounded-lg border border-black bg-white font-semibold">Upload</button>
            </form>
        </div>
    </div>
  )
}

export default PlacementOne
