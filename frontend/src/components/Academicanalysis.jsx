import { useState, useEffect } from "react";

const Academicanalysis = () => {
  const [selectedOption, setSelectedOption] = useState("overallcg");
  const [imagesBase64, setImagesBase64] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollNumbers, setRollNumbers] = useState(["", "", ""]); // Holds up to 3 roll numbers
  const [compare, setCompare] = useState(true)

  const options = [
    { value: "overallcg", label: "Overall CGPA" },
    { value: "percentile", label: "Percentile" },
    { value: "less", label: "CGPA Distribution" },
    { value: "semwisecg", label: "Section-wise CGPA" },
    { value: "performance_degrade", label: "Performance Degradation" },
    { value: "performance_improve", label: "Performance Improvement" },
    { value: "compare_gpas", label: "Compare GPAs" },
    { value: "top_performers", label: "Top Performers" },
  ];

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      setImagesBase64([]); // Reset images while loading

      try {
        let response;
        if (selectedOption !== "compare_gpas") {
          response = await fetch(`https://bitwebapp-24-ohuu.onrender.com/${selectedOption}`);
        } else {
          const validRollNos = rollNumbers.filter((roll) => roll.trim() !== ""); // Remove empty roll numbers
          if (validRollNos.length === 0) {
            alert("Please enter at least one roll number!");
            setLoading(false);
            return;
          }

          const formData = new FormData();
          formData.append("rollnos", validRollNos.join(",")); // Send as comma-separated string

          response = await fetch(`https://bitwebapp-24-ohuu.onrender.com/${selectedOption}`, {
            method: "POST",
            body: formData,
          });
        }

        const data = await response.json();
        if (data.image_base64) {
          setImagesBase64([data.image_base64]); // Single image case
        } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          setImagesBase64(data.images); // Multiple images case
        }
      } catch (error) {
        console.error("Error fetching graph:", error);
        setImagesBase64([]);
      }
      setLoading(false);
    };

    fetchGraph();
  }, [selectedOption,compare]);

  // Handle roll number input changes
  const handleRollChange = (index, value) => {
    const updatedRolls = [...rollNumbers];
    console.log(updatedRolls);
    updatedRolls[index] = value;
    setRollNumbers(updatedRolls);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Academic Analysis</h2>

      {/* Dropdown to select option */}
      <select
        className="border rounded px-3 py-2"
        value={selectedOption}
        onChange={(e) => {setImagesBase64([]) ;setSelectedOption(e.target.value)}}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Show Roll Number Input Form only when Compare GPAs is selected */}
      {selectedOption === "compare_gpas" && (
        <div className="mt-4 p-4 border rounded shadow-sm bg-gray-100">
          <h3 className="font-bold mb-2">Enter up to 3 Roll Numbers:</h3>
          {rollNumbers.map((roll, index) => (
            <input
              key={index}
              type="text"
              value={roll}
              onChange={(e) => handleRollChange(index, e.target.value)}
              placeholder={`Roll No ${index + 1}`}
              className="border rounded px-3 py-2 mr-2 mb-2"
            />
          ))}
          <button
            onClick={() => setCompare(!compare)} // Trigger fetch when button is clicked
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Compare
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <p>Loading...</p>
      ) : imagesBase64.length > 0 ? (
        <div className="mt-4 space-y-4">
          {imagesBase64.map((imageBase64, index) => (
            <img
              key={index}
              src={`data:image/png;base64,${imageBase64}`}
              alt={`Graph ${index + 1}`}
              className="w-full border rounded shadow-sm"
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No data available.</p>
      )}
    </div>
  );
};

export default Academicanalysis;
