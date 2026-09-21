const { io } = require('socket.io-client');

const classroomId = 'de35060c-78e2-44ad-bc0c-9a6f33610a85';

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6ImFsaSIsInN1YiI6Ijg4NWEwZTJlLWFlMjctNDk4Zi05NmVlLWUyMGUxMmE1ZmY3MiIsImVtYWlsIjoiYUBnbWFpbC5jb20iLCJyb2xlIjoiVEVBQ0hFUiIsImlhdCI6MTc4OTk5MzY2OCwiZXhwIjoxNzg5OTk0NTY4fQ.luneMnO0hJ0rvCt4UkwNO95Z59WkU29D8ppRO3qF4Mg' },
}); 

socket.on('connect', () => {
  console.log('teacher connected');
  socket.emit('joinClassroom', { classroomId });

  setTimeout(() => {
    console.log('teacher: triggering attendance check...');
    socket.emit('triggerAttendanceCheck', { classroomId });
  }, 1000);
});

socket.on('attendanceCheckStarted', (data) => console.log('teacher saw attendanceCheckStarted:', data));
socket.on('attendanceResponseReceived', (data) => console.log('teacher saw attendanceResponseReceived:', data));
socket.on('actionError', (err) => console.log('teacher got error:', err));