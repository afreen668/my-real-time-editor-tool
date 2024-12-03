import React, { useCallback, useEffect, useState } from 'react';
import 'quill/dist/quill.snow.css'; // Ensure Quill styling is applied
import Quill from 'quill';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SAVE_INTERVAL_MS = 2000; // Save every 2 seconds

// Define the Quill toolbar options
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['bold', 'italic', 'underline'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ align: [] }],
  ['image', 'blockquote', 'code-block'],
  ['clean'],
];
function TextEditor(){
  const { id: documentId } = useParams(); // Get document ID from URL
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const s = io('http://localhost:3001'); // Change to match your server URL
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Load document from server
  useEffect(() => {
    if (!socket || !quill) return;

    const handleLoadDocument = (document) => {
      quill.setContents(document);
      quill.enable(); // Enable editing after document is loaded
    };

    socket.once('load-document', handleLoadDocument);
    socket.emit('get-document', documentId); // Emit event to fetch document content

    return () => {
      socket.off('load-document', handleLoadDocument);
    };
  }, [socket, quill, documentId]);

  // Save document periodically
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // Handle incoming changes from other clients
  useEffect(() => {
    if (!socket || !quill) return;

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta); // Update editor content
    };

    socket.on('receive-changes', handleReceiveChanges);

    return () => {
      socket.off('receive-changes', handleReceiveChanges);
    };
  }, [socket, quill]);
// Handle outgoing changes (text changes made by the user)
useEffect(() => {
  if (!socket || !quill) return;

  const handleTextChange = (delta, oldDelta, source) => {
    if (source !== 'user') return; // Ignore non-user-generated changes
    socket.emit('send-changes', delta); // Send changes to server
  };

  quill.on('text-change', handleTextChange);

  return () => {
    quill.off('text-change', handleTextChange);
  };
}, [socket, quill]);


  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return

    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    new Quill(editor, {theme: "snow", modules: {toolbar:TOOLBAR_OPTIONS}})
  }, [])
  return <div className='container' ref={wrapperRef}></div>
}

export default TextEditor;
