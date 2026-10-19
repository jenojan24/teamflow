
import { useEffect, useState } from "react";
import { checkApiHealth } from "./lib/api";

type ApiStatus = {
  status: string;
  message: string;
};

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApiHealth()
      .then(setApiStatus)
      .catch(() => setError("Could not connect to the backend."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>TeamFlow</h1>
      <p>Project management, made simple.</p>

      <h2>Backend connection</h2>

      {loading && <p>Checking API connection...</p>}

      {apiStatus && (
        <p>
          <strong>Backend connected:</strong> {apiStatus.message}
        </p>
      )}

      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default App;
