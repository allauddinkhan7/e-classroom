const { io } = require('socket.io-client');

const classroomId = 'de35060c-78e2-44ad-bc0c-9a6f33610a85';

const socket = io('http://localhost:8000', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6Ik1hcWJvb2wiLCJzdWIiOiIyN2VmNzNiNC0yYjkxLTQ1MTktYjE3OC03MThlYjA5OGUzYjQiLCJlbWFpbCI6Im1AZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3OTAzNDA0OTQsImV4cCI6MTc5MDM0MTM5NH0.EPQiMznbiNwcj3A-DasZZqIC8g4hB0eRr6Q9fIYL-94' },
  
});

let popQuestionId = null;

socket.on('connect', () => {
  console.log('student connected');
  socket.emit('joinClassroom', { classroomId });
});

socket.on('popQuestionStarted', (data) => {
  console.log('student received popQuestionStarted:', data);
  popQuestionId = data.id;

  setTimeout(() => {
    console.log('student: responding to pop question...');
    socket.emit('respondToPopQuestion', { popQuestionId, classroomId, answer: 'Lib' });
  }, 2000);
});

socket.on('popQuestionResponseReceived', (data) => console.log('student saw popQuestionResponseReceived:', data));