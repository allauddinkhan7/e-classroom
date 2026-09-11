const { io } = require('socket.io-client');

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6InNzcyIsInN1YiI6ImVlNmI4ZTBiLTk0ZTItNDMyMC1iOTQ1LWJlZWU3NzUwMjhlZiIsImVtYWlsIjoiYUBnbWFpbC5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTc4OTEzMTE1MiwiZXhwIjoxNzg5MTMyMDUyfQ.EVY-Qy-WoHXQIcOkNjbfGBgIZQdfdhc6EEFTVI6ZhII' },
});

socket.on('connect', () => {
  console.log('connected');
  socket.emit('joinClassroom', { classroomId: 'adefca31-e33a-42a0-aa21-c511fd302b3e' });

  setTimeout(() => {
    socket.emit('sendMessage', { classroomId: 'adefca31-e33a-42a0-aa21-c511fd302b3e', content: 'Hello from test script' });
  }, 1000);
});

socket.on('newMessage', (msg) => console.log('Received:', msg));