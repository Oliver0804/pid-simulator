const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const setpoint = document.getElementById('setpoint');

let currentValue = 50;
let targetValue = parseFloat(setpoint.value);
let lastError = 0;
let integral = 0;

// PID 參數
const Kp = 1;
const Ki = 0.1;
const Kd = 0.01;

function update() {
    const error = targetValue - currentValue;
    integral += error;
    const derivative = error - lastError;
    
    const output = Kp * error + Ki * integral + Kd * derivative;
    
    currentValue += output;

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - targetValue * 4);
    ctx.lineTo(canvas.width, canvas.height - targetValue * 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - currentValue * 4, 5, 0, 2 * Math.PI);
    ctx.fill();
    
    lastError = error;
    requestAnimationFrame(update);
}

setpoint.addEventListener('input', () => {
    targetValue = parseFloat(setpoint.value);
});

update();

