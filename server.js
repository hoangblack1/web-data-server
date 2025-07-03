const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let allData = [];

// Nhận dữ liệu từ ESP32
app.post('/data', (req, res) => {
    const { temperature, salinity, location, timestamp } = req.body;

    // ✅ Sửa lại điều kiện kiểm tra để chấp nhận salinity = 0
    if (
        temperature === undefined ||
        salinity === undefined ||
        location === undefined ||
        timestamp === undefined
    ) {
        return res.status(400).send('Thiếu trường dữ liệu');
    }

    const entry = { temperature, salinity, location, timestamp };
    allData.push(entry);
    console.log("✅ Nhận dữ liệu:", entry);
    res.send('Data received');
});

// Trả toàn bộ dữ liệu
app.get('/data', (req, res) => {
    res.json(allData);
});

// Tải file Excel
app.get('/export', (req, res) => {
    const worksheet = XLSX.utils.json_to_sheet(allData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const filePath = path.join(__dirname, 'public', 'data_export.xlsx');
    XLSX.writeFile(workbook, filePath);
    res.download(filePath);
});

// Hiển thị trang index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
