import { Route, Routes } from "react-router-dom";
import Home from "./page/Home";
import MainPage from "./page/MainPage";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </div>
  );
}
