const API_URL = 'https://script.google.com/macros/s/AKfycbx2jtCg7tbkSslyIPh7Vd00r0JSIxZBf5Uxkvj6fSkdq_I-fGyFjucFX9zr2DhBDA3_/exec';

async function fetchShifts() {
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('shift-container');

    try {
        // ใช้ fetch แบบปกติ แต่ Google Apps Script จะมีการ Redirect (302)
        // Browser ส่วนใหญ่จะจัดการให้ถ้าเราเรียกผ่าน Server (เช่น Live Server)
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const shifts = await response.json();

        loadingElement.style.display = 'none';
        renderShifts(shifts);
    } catch (error) {
        console.error('Error fetching shifts:', error);
        loadingElement.innerHTML = `
            <div style="color: #e74c3c; padding: 20px; text-align: center;">
                <p><strong>เกิดข้อผิดพลาดในการเชื่อมต่อ (CORS Error)</strong></p>
                <p style="font-size: 0.9rem;">ลีนุกส์แนะนำให้คุณบีมลองเปิดหน้าเว็บผ่าน <strong>VS Code Live Server</strong> นะคะ <br> 
                การเปิดไฟล์ HTML ตรงๆ ในเครื่อง (file://) มักจะถูก Browser บล็อกความปลอดภัยค่ะ</p>
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