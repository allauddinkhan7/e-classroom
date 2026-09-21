const { io } = require('socket.io-client');

const classroomId = 'de35060c-78e2-44ad-bc0c-9a6f33610a85';

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ik1hcWJvb2wiLCJzdWIiOiIyN2VmNzNiNC0yYjkxLTQ1MTktYjE3OC03MThlYjA5OGUzYjQiLCJlbWFpbCI6Im1AZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3ODk5OTM2MjgsImV4cCI6MTc4OTk5NDUyOH0.Bzeehx2An9FTIFvoQ_U04jM1k9u5E9SFVaK7VPBOIsI' },
});

let lastCheckId = null;

socket.on('connect', () => {
  console.log('student connected');
  socket.emit('joinClassroom', { classroomId });
});

socket.on('attendanceCheckStarted', (data) => {
  console.log('student received attendanceCheckStarted:', data);
  lastCheckId = data.id;

  setTimeout(() => {
    console.log('student: responding to attendance check...');
    socket.emit('respondToAttendance', { attendanceCheckId: lastCheckId, classroomId });
  }, 2000);
});

socket.on('attendanceResponseReceived', (data) => console.log('student saw attendanceResponseReceived:', data));