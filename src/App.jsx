import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import PulsoEnVivo from "./Pages/PulsoEnVivo";
import Historial from "./Pages/Historial";
import Perfil from "./Pages/Perfil";
import "./Index.css";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live" element={<PulsoEnVivo />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
  );
}

export default App;


