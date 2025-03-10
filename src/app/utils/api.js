import axios from "axios";

const API_URL =
  "https://61fd-2804-1b2-ab42-fcdb-3df1-c057-a5ae-645b.ngrok-free.app/api/";

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
