const { io } = require('socket.io-client');

const classroomId = 'de35060c-78e2-44ad-bc0c-9a6f33610a85';

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6ImFsaSIsInN1YiI6Ijg4NWEwZTJlLWFlMjctNDk4Zi05NmVlLWUyMGUxMmE1ZmY3MiIsImVtYWlsIjoiYUBnbWFpbC5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTc5MDM0MDQ1NywiZXhwIjoxNzkwMzQxMzU3fQ.1_einNnDWwzmonFrtNI3_JucxCTSd4dQYisCxskQPl0' },
});

socket.on('connect', () => {
  console.log('teacher connected');
  socket.emit('joinClassroom', { classroomId });

  setTimeout(() => {
    console.log('teacher: triggering pop question...');
    socket.emit('triggerPopQuestion', { classroomId, question: "Is NestJs a Framwork or Library?", answer: 'Framework' });
  }, 1000);
});

socket.on('popQuestionStarted', (data) => console.log('teacher saw popQuestionStarted:', data));
socket.on('popQuestionResponseReceived', (data) => console.log('teacher saw popQuestionResponseReceived:', data));
socket.on('actionError', (err) => console.log('teacher got error:', err));