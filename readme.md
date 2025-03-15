<!-- cmd code in case of multiple server instances -->
netstat -ano | findstr :5000
taskkill /PID 12345 /F