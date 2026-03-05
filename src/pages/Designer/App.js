import "./App.css";
import { Formio } from "@formio/react";
import FormioContrib from "@formio/contrib";
import Navigation from "./components/Navigation";
import { Route, Routes } from "react-router-dom";
import Builder from "./components/Builder";
import Components from "./components/Components";
Formio.use(FormioContrib);

function App() {
  return (
    <div className="App">
      <Routes basename={"/designer"}>
        <Route path="/" element={<Builder />}></Route>
        <Route path="components" element={<Components />}></Route>
      </Routes>
    </div>
  );
}

export default App;
