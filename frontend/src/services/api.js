const API_URL = 'http://127.0.0.1:8000';

export async function predictEmotion(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Prediction failed. Please try again.');
  }

  return response.json();
}