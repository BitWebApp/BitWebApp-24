export async function generateAnswer(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    }),
    headers: { "Content-Type": "application/json" }
  });
  const data = await res.json();
  return data.response;
}
