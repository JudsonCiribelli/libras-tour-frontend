"use client";
import { useState, useRef, useEffect } from "react";
import api from "./utils/api";

export default function Home() {
  const [categoria, setCategoria] = useState(null);

  const handleCategoriaClick = (novaCategoria) => {
    setCategoria(novaCategoria);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Selecione uma Categoria
      </h1>

      {!categoria ? (
        <div className="flex flex-col space-y-4 w-64">
          <button
            onClick={() => handleCategoriaClick("bairros")}
            className="bg-blue-500 text-white py-3 rounded-lg shadow-md transition-all hover:bg-blue-600"
          >
            Bairros
          </button>
          <button
            onClick={() => handleCategoriaClick("girias")}
            className="bg-blue-500 text-white py-3 rounded-lg shadow-md transition-all hover:bg-blue-600"
          >
            Gírias
          </button>
          <button
            onClick={() => handleCategoriaClick("turismo")}
            className="bg-blue-500 text-white py-3 rounded-lg shadow-md transition-all hover:bg-blue-600"
          >
            Turismo
          </button>
        </div>
      ) : (
        <CameraComponent categoria={categoria} />
      )}
    </div>
  );
}

function CameraComponent({ categoria }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [resultado, setResultado] = useState("Aguardando sinal...");
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  const requestCameraPermission = async () => {
    try {
      // First, check if permissions are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API não suportada neste navegador");
      }

      // Try to get user media with both front and back cameras
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error);
      setHasPermission(false);

      let errorMessage = "❌ Erro ao acessar a câmera: ";
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage +=
          "Permissão negada. Por favor, permita o acesso à câmera nas configurações do seu navegador.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "Nenhuma câmera encontrada no dispositivo.";
      } else if (error.name === "NotReadableError") {
        errorMessage += "A câmera está em uso por outro aplicativo.";
      } else {
        errorMessage += error.message || "Erro desconhecido";
      }

      setCameraError(errorMessage);
    }
  };

  useEffect(() => {
    requestCameraPermission();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturarEEnviarFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !hasPermission) return;

    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageData = canvas.toDataURL("image/jpeg").split(",")[1];
      const response = await api.post("/predict", {
        image: imageData,
        categoria,
      });
      setResultado(response.data.prediction);
    } catch (error) {
      console.error("Erro ao processar o sinal:", error);
      setResultado("Erro ao identificar o sinal.");
    }

    setLoading(false);
  };

  useEffect(() => {
    let interval;
    if (hasPermission) {
      interval = setInterval(capturarEEnviarFrame, 3000);
    }
    return () => clearInterval(interval);
  }, [hasPermission]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        Categoria Selecionada: {categoria}
      </h2>
      <p className="text-gray-600 mt-2">
        Faça um sinal e aguarde o reconhecimento.
      </p>

      {cameraError ? (
        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p>{cameraError}</p>
          <button
            onClick={requestCameraPermission}
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="mt-6 border-4 border-gray-300 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-[320px] h-[240px]"
          ></video>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden"></canvas>

      <div className="mt-4 p-4 bg-white rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-xl font-bold text-gray-800">Resultado:</h3>
        <p className="text-gray-600">
          {loading ? "Processando..." : resultado}
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md transition-all hover:bg-red-600"
      >
        Voltar
      </button>
    </div>
  );
}
