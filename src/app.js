// Version: 1.3.0 - Add Shift Implementation & Modal
const API_URL = 'https://script.google.com/macros/s/AKfycbweEF2IYbkDBS__ivHwOFlfChtYE1HMf1Vg5M7sL46_pi24-jHUJi3yM5VHm_IUS_tf/exec';

let currentDate = new Date();
let allShifts = [];
let allStaff = [];

// DOM Elements
const calendarView = document.getElementById('calendar-view');
const staffView = document.getElementById('staff-view');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const loadingElement = document.getElementById('loading');
const staffList = document.getElementById('staff-list');
const addStaffForm = document.getElementById('add-staff-form');
const addShiftForm = document.getElementById('add-shift-form');
const shiftModal = document.getElementById('shift-modal');
const nurseSelect = document.getElementById('shift-nurse-select');

// Navigation
document.getElementById('show-calendar').addEventListener('click', () => switchView('calendar'));
document.getElementById('show-staff').addEventListener('click', () => switchView('staff'));

function switchView(view) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    if (view === 'calendar') {
        calendarView.classList.remove('hidden');
        staffView.classList.add('hidden');
        document.getElementById('show-calendar').classList.add('active');
        viewTitle.textContent = 'ตารางเวรพยาบาล';
        viewSubtitle.textContent = 'ระบบจัดการและตรวจสอบตารางเวรแบบเรียลไทม์';
        renderCalendar();
    } else {
        calendarView.classList.add('hidden');
        staffView.classList.remove('hidden');
        document.getElementById('show-staff').classList.add('active');
        viewTitle.textContent = 'จัดการเจ้าหน้าที่';
        viewSubtitle.textContent = 'เพิ่ม ลบ และดูรายชื่อเจ้าหน้าที่ทั้งหมด';
        renderStaff();
    }
}

async function fetchData() {
    loadingElement.style.display = 'block';
    try {
        const finalUrl = API_URL + (API_URL.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
        const response = await fetch(finalUrl, {
            method: 'GET',
            credentials: 'omit'
        });
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        allShifts = data.shifts || [];
        allStaff = data.staff || [];
        
        loadingElement.style.display = 'none';
        updateNurseDropdown();
        renderCalendar();
    } catch (error) {
        console.error('Error fetching data:', error);
        loadingElement.innerHTML = `<div class="error-msg">ไม่สามารถดึงข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่อ</div>`;
    }
}

function updateNurseDropdown() {
    nurseSelect.innerHTML = '<option value="">-- เลือกชื่อพยาบาล --</option>';
    allStaff.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.Name;
        option.textContent = staff.Name;
        nurseSelect.appendChild(option);
    });
}

// Staff Management
async function addStaff(e) {
    e.preventDefault();
    const name = document.getElementById('staff-name').value;
    const role = document.getElementById('staff-role').value;
    const dept = document.getElementById('staff-dept').value;

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'omit',
            body: JSON.stringify({
                action: 'addStaff',
                Name: name,
                Role: role,
                Department: dept
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            allStaff.push({ ID: result.id, Name: name, Role: role, Department: dept });
            updateNurseDropdown();
            renderStaff();
            addStaffForm.reset();
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    } finally {
        btn.disabled = false;
        btn.textContent = 'เพิ่มข้อมูล';
    }
}

async function deleteStaff(id) {
    if (!confirm('ยืนยันการลบเจ้าหน้าที่?')) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'omit',
            body: JSON.stringify({ action: 'deleteStaff', ID: id })
        });
        const result = await response.json();
        if (result.status === 'success') {
            allStaff = allStaff.filter(s => s.ID !== id);
            updateNurseDropdown();
            renderStaff();
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
}

function renderStaff() {
    staffList.innerHTML = allStaff.map(staff => `
        <tr>
            <td>${staff.Name}</td>
            <td>${staff.Role}</td>
            <td>${staff.Department}</td>
            <td>
                <button onclick="deleteStaff('${staff.ID}')" class="btn btn-danger btn-sm">ลบ</button>
            </td>
        </tr>
    `).join('');
}

// Shift Management
async function addShift(e) {
    e.preventDefault();
    const name = nurseSelect.value;
    const date = document.getElementById('shift-date-input').value;
    const type = document.getElementById('shift-type-select').value;

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'กำลังบันทึก...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'omit',
            body: JSON.stringify({
                action: 'addShift',
                Name: name,
                Date: date,
                ShiftType: type
            })
        });
        const result = await response.json();
        if (result.status === 'success') {
            allShifts.push({ Name: name, Date: date, ShiftType: type });
            renderCalendar();
            shiftModal.classList.add('hidden');
            addShiftForm.reset();
        }
    } catch (error) {
        alert('เกิดข้อผิดพลาดในการบันทึกเวร');
    } finally {
        btn.disabled = false;
        btn.textContent = 'บันทึกเวร';
    }
}

// Modal Logic
document.getElementById('open-add-shift').addEventListener('click', () => {
    shiftModal.classList.remove('hidden');
});

document.getElementById('close-modal').addEventListener('click', () => {
    shiftModal.classList.add('hidden');
});

window.onclick = (event) => {
    if (event.target == shiftModal) {
        shiftModal.classList.add('hidden');
    }
};

// Calendar Rendering
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthDisplay = document.getElementById('currentMonth');
    
    grid.innerHTML = '';
    
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
    
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell other-month';
        grid.appendChild(cell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        cell.innerHTML = `<span class="day-number ${isToday ? 'today' : ''}">${day}</span>`;

        const dayShifts = allShifts.filter(s => s.Date === dateStr);
        dayShifts.forEach(shift => {
            const shiftDiv = document.createElement('div');
            shiftDiv.className = `shift-item ${shift.ShiftType}`;
            const label = shift.ShiftType.substring(0, 1);
            shiftDiv.innerHTML = `<span class="shift-label">${label}</span> ${shift.Name}`;
            cell.appendChild(shiftDiv);
        });

        grid.appendChild(cell);
    }
}

// Event Listeners
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

addStaffForm.addEventListener('submit', addStaff);
addShiftForm.addEventListener('submit', addShift);

// Expose deleteStaff to global scope for onclick
window.deleteStaff = deleteStaff;

document.addEventListener('DOMContentLoaded', fetchData);