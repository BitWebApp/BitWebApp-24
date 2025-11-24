export async function embedTexts(chunks) {
  const response = await fetch("http://localhost:11434/api/embed", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "nomic-embed-text",
    input: chunks,
  }),
});
const result = await response.json();
const vectors = result.embeddings; // array of embeddings per chunk
return vectors;
}


export async function ollamaChatCompletion(prompt) {
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
