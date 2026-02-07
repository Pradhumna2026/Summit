const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlb2Rtb29jb3p6a3B3b3Voc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDYxNTIsImV4cCI6MjA4NTUyMjE1Mn0.Sg752LuNPf4GQ5AmGIcwCxCRI4_gQJ_iKvUt_ueQM40";
const [header, payload, sig] = jwt.split('.');
const decoded = Buffer.from(payload, 'base64').toString();
console.log(JSON.parse(decoded));
