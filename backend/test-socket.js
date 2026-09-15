const { io } = require('socket.io-client');

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6ImFsaSIsInN1YiI6Ijg4NWEwZTJlLWFlMjctNDk4Zi05NmVlLWUyMGUxMmE1ZmY3MiIsImVtYWlsIjoiYUBnbWFpbC5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTc4OTQ1Mzg3OSwiZXhwIjoxNzg5NDU0Nzc5fQ.ypYDUolhZ0n9PfbLmpRVQZHyXqSGLezyU7Lif2XkY8s' },
});

socket.on('connect', () => {
  console.log('connected');
  socket.emit('joinClassroom', { classroomId: 'de35060c-78e2-44ad-bc0c-9a6f33610a85' });

  setTimeout(() => {
    socket.emit('sendMessage', { classroomId: 'de35060c-78e2-44ad-bc0c-9a6f33610a85', content: 'Hello from test script' });
  }, 1000);
});

socket.on('newMessage', (msg) => console.log('Received:', msg));    
// to run this : e-classroom/backend$ node test-socket.js
