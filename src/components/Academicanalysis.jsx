import { useState, useEffect } from "react";

const Academicanalysis = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [imagesBase64, setImagesBase64] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rollNumbers, setRollNumbers] = useState(["", "", ""]);
  const [showWelcome, setShowWelcome] = useState(true);

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
    if (!showWelcome && selectedOption && selectedOption !== "compare_gpas") {
      fetchGraph();
    } else {
      setImagesBase64([]);
    }
  }, [selectedOption]);

  const fetchGraph = async () => {
    setLoading(true);
    setImagesBase64([]);

    try {
      let response;
      if (selectedOption !== "compare_gpas") {
        response = await fetch(`https://bitwebapp-24-ohuu.onrender.com/${selectedOption}`);
      } else {
        const validRollNos = rollNumbers.filter((roll) => roll.trim() !== "");
        if (validRollNos.length === 0) {
          alert("Please enter at least one roll number!");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("rollnos", validRollNos.join(","));

        response = await fetch(`https://bitwebapp-24-ohuu.onrender.com/${selectedOption}`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();
      if (data.image_base64) {
        setImagesBase64([data.image_base64]);
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        setImagesBase64(data.images);
      }
    } catch (error) {
      console.error("Error fetching graph:", error);
      setImagesBase64([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      {showWelcome ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Academic Analysis</h1>
          <p className="text-gray-600 mb-6">
            Explore insightful academic trends and performance analytics.  
            Select an option below to begin.
          </p>
          <button
            onClick={() => setShowWelcome(false)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Academic Analysis</h2>

          <select
            className="w-full border rounded px-3 py-2 mb-4"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="" disabled>Select an analysis type</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {selectedOption === "compare_gpas" && (
            <div className="mt-4 p-4 border rounded bg-gray-100">
              <h3 className="font-bold mb-2">Enter up to 3 Roll Numbers:</h3>
              {rollNumbers.map((roll, index) => (
                <input
                  key={index}
                  type="text"
                  value={roll}
                  onChange={(e) => {
                    const updatedRolls = [...rollNumbers];
                    updatedRolls[index] = e.target.value;
                    setRollNumbers(updatedRolls);
                  }}
                  placeholder={`Roll No ${index + 1}`}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
              ))}
              <button
                onClick={fetchGraph}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Compare
              </button>
            </div>
          )}

          {loading && <p className="mt-4 text-gray-600">Loading...</p>}

          {!loading && imagesBase64.length > 0 && (
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
          )}

          {!loading && imagesBase64.length === 0 && selectedOption !== "compare_gpas" && (
            <p className="mt-4 text-gray-500">No data available.</p>
          )}

          <button
            onClick={() => {
              setShowWelcome(true);
              setSelectedOption("");
            }}
            className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Back to Welcome
          </button>
        </div>
      )}
    </div>
  );
};

export default Academicanalysis;
