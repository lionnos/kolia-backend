// src/pages/TestApi.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosConfig'; // 🔥 instance Axios configurée (baseURL + interceptors)

const TestApi = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fonction pour tester la connexion API
  const testConnection = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/api/test'); // 👈 GET vers /api/test sur la baseURL
      setMessage(response.data.message + ' ✅');
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au backend ❌');
    } finally {
      setLoading(false);
    }
  };

  // Lancer le test automatiquement à l’ouverture du composant
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Test de connexion API 🚀
        </h1>
        {loading && <p className="text-blue-600">Connexion en cours...</p>}
        {message && (
          <p className="text-green-600 font-medium mt-2">{message}</p>
        )}
        {error && <p className="text-red-600 font-medium mt-2">{error}</p>}

        <button
          onClick={testConnection}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"
        >
          Re-tester la connexion
        </button>
      </div>
    </div>
  );
};

export default TestApi;
