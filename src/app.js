const API_URL = 'https://script.google.com/macros/s/AKfycbx2jtCg7tbkSslyIPh7Vd00r0JSIxZBf5Uxkvj6fSkdq_I-fGyFjucFX9zr2DhBDA3_/exec';

async function fetchShifts() {
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('shift-container');

    try {
        // ใช้ fetch แบบปกติ แต่เพิ่ม credentials: 'omit' เพื่อแก้ปัญหา CORS กับ Google Apps Script ในบางกรณี
        const response = await fetch(API_URL, {
            method: 'GET',
            credentials: 'omit'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const shifts = await response.json();

        loadingElement.style.display = 'none';
        renderShifts(shifts);
    } catch (error) {
        console.error('Error fetching shifts:', error);
        loadingElement.innerHTML = `
            <div style="color: #e74c3c; padding: 20px; text-align: center; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p><strong>🏥 ไม่สามารถดึงข้อมูลจาก Google Sheets ได้</strong></p>
                <p style="font-size: 0.9rem; color: #666;">อาจเกิดจาก Google Apps Script ยังไม่ได้รับอนุญาตให้เข้าถึงแบบสาธารณะค่ะ</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
                <p style="font-size: 0.85rem; text-align: left;"><strong>วิธีแก้ไขสำหรับคุณบีม:</strong><br>
                1. ไปที่หน้า Google Apps Script<br>
                2. กด <strong>Deploy > Manage Deployments</strong><br>
                3. กดแก้ไข (รูปดินสอ) เลือก Version เป็น <strong>New Version</strong><br>
                4. ตรวจสอบว่า Who has access เป็น <strong>Anyone</strong> (สำคัญมากค่ะ!)<br>
                5. กด Deploy แล้วลองรีเฟรชหน้านี้อีกรอบนะค</p>
            </div>
        `;
    }
}
function renderShifts(shifts) {
    const container = document.getElementById('shift-container');
    container.innerHTML = '';

    shifts.forEach(shift => {
        const card = document.createElement('div');
        card.className = 'shift-card';

        const shiftClass = getShiftClass(shift.ShiftType);

        card.innerHTML = `
            <h3>${shift.Name}</h3>
            <p><strong>วันที่:</strong> ${shift.Date}</p>
            <p><strong>เวร:</strong> <span class="shift-type ${shiftClass}">${shift.ShiftType}</span></p>
        `;
        container.appendChild(card);
    });
}

function getShiftClass(type) {
    switch (type.toLowerCase()) {
        case 'เช้า':
        case 'morning':
            return 'shift-morning';
        case 'บ่าย':
        case 'afternoon':
            return 'shift-afternoon';
        case 'ดึก':
        case 'night':
            return 'shift-night';
        default:
            return '';
    }
}

document.addEventListener('DOMContentLoaded', fetchShifts);