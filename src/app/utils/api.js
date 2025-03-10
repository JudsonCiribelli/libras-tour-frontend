import axios from "axios";

const API_URL =
  "https://7654-2804-1b2-ab42-fcdb-d9f-4d1c-a847-9214.ngrok-free.app/api/";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const enviarImagemParaPredicao = async (base64Image, categoria) => {
  try {
    const response = await api.post("/predict/", {
      image: base64Image,
      categoria: categoria,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar a imagem:", error);
    throw error; // Propagate the error to be handled by the caller
  }
};

export default api;
