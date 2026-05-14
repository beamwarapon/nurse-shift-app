// Version: 1.1.0 - Calendar View Implementation
const API_URL = 'https://script.google.com/macros/s/AKfycbweEF2IYbkDBS__ivHwOFlfChtYE1HMf1Vg5M7sL46_pi24-jHUJi3yM5VHm_IUS_tf/exec';

let currentDate = new Date();
let allShifts = [];

async function fetchShifts() {
    const loadingElement = document.getElementById('loading');
    try {
        const finalUrl = API_URL + (API_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
        const response = await fetch(finalUrl, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) throw new Error('Network response was not ok');

        allShifts = await response.json();
        loadingElement.style.display = 'none';
        renderCalendar();
    } catch (error) {
        console.error('Error fetching shifts:', error);
        loadingElement.innerHTML = `<div class="error-msg">ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ</div>`;
    }
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    
    grid.innerHTML = '';
    
    // Set Header
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    days.forEach(day => {
        const dayHead = document.createElement('div');
        dayHead.className = 'calendar-day-head';
        dayHead.textContent = day;
        grid.appendChild(dayHead);
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    monthDisplay.textContent = new Intl.DateTimeFormat('th-TH', { month: 'long', year: 'numeric' }).format(currentDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fill empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell other-month';
        grid.appendChild(cell);
    }

    // Fill actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        cell.innerHTML = `<span class="day-number ${isToday ? 'today' : ''}">${day}</span>`;

        // Find shifts for this day
        const dayShifts = allShifts.filter(s => s.Date === dateStr);
        dayShifts.forEach(shift => {
            const shiftDiv = document.createElement('div');
            shiftDiv.className = `shift-item ${shift.ShiftType}`;
            shiftDiv.textContent = `${shift.Name}: ${shift.ShiftType}`;
            cell.appendChild(shiftDiv);
        });

        grid.appendChild(cell);
    }
}

document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.addEventListener('DOMContentLoaded', fetchShifts);
