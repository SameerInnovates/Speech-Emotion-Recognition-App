const API_URL = 'https://speech-emotion-api-1bx1.onrender.com';

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