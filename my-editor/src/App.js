import TextEditor from "./TextEditor.js";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect to a new unique document */}
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        
        {/* Load the TextEditor with the document ID from the URL */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
