import mongoose from 'mongoose';
import Document from './Document.js';  // Ensure you have the .js extension for the file
import { Server } from 'socket.io';    // Import socket.io using ES module syntax

// Connect to MongoDB (no need for deprecated options)
mongoose.connect('mongodb://localhost/Real-Time_editing-tool');

// Set up socket.io server
const io = new Server(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Default document value
const defaultValue = '';

// Socket.io connection logic
io.on('connection', socket => {
  socket.on('get-document', async documentId => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

// Function to find or create a document
async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;

  return await Document.create({ _id: id, data: defaultValue });
}