const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const setpoint = document.getElementById('setpoint');
const KpInput = document.getElementById('Kp');
const KiInput = document.getElementById('Ki');
const KdInput = document.getElementById('Kd');

const noiseInput = document.getElementById('noise');
let noiseAmplitude = parseFloat(noiseInput.value);
const plotInterval = 2; // 每隔2個像素更新一次資料和繪圖

let currentValue = 50;
let targetValue = parseFloat(setpoint.value);
let lastError = 0;
let integral = 0;
let time = 0;

let Kp = parseFloat(KpInput.value);
let Ki = parseFloat(KiInput.value);
let Kd = parseFloat(KdInput.value);

const history = [];
let targetHistory = [];

let values = [];
let timeStep = 0;
let pidOutputs = [];
let noiseHistory = [];

const T_WIDTH = 2; // 這表示每個T的間隔為2像素。您可以根據需要更改此值。


const resetBtn = document.getElementById('resetBtn');



function reset() {
    currentValue = 50;
    targetValue = 50;
    lastError = 0;
    integral = 0;
    time = 0;
    history.length = 0;
    setpoint.value = "50";
    KpInput.value = "1";
    KiInput.value = "0.1";
    KdInput.value = "0.01";
    Kp = 1;
    Ki = 0.1;
    Kd = 0.01;
}
function drawCurrentValues() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - values[0] * 4);
    for(let i = 1; i < values.length; i++) {
        ctx.lineTo(i, canvas.height - values[i] * 4);
    }
    ctx.strokeStyle = "blue"; // Color for the current value line
    ctx.stroke();
}
function drawPidOutputs() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - pidOutputs[0] * 4);
    for(let i = 1; i < pidOutputs.length; i++) {
        ctx.lineTo(i, canvas.height - pidOutputs[i] * 4);
    }
    ctx.strokeStyle = "green"; // Color for the PID output line
    ctx.stroke();
}

function drawAxes() {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    let yInterval = canvas.height / 10;
    let xInterval = canvas.width / 10;

    // Draw Y-Axis lines and labels
    for(let i = 0; i <= 10; i++) {
        let y = yInterval * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
       // ctx.fillText((10 - i) * 10, 0, y); // Adjust this for your range and scale
    }

    // Draw X-Axis lines and labels (assuming it's time and max is 10)
    for(let i = 0; i <= 10; i++) {
        let x = xInterval * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
       // ctx.fillText(i, x, canvas.height); 
    }
}

resetBtn.addEventListener('click', reset);

function update() {
    const error = targetValue - currentValue;
    integral += error;
    const derivative = error - lastError;
    
    const output = Kp * error + Ki * integral + Kd * derivative;
    const noise = (Math.random() * 2 - 1) * noiseAmplitude;
    if (time % plotInterval === 0) {

    // Record noise data
    noiseHistory.push(noise);
    if (noiseHistory.length > canvas.width) {
        noiseHistory.shift();
    }

    currentValue += output + noise;

    // Ensure currentValue remains within canvas bounds
    currentValue = Math.max(0, Math.min(canvas.height / 4, currentValue));

    // Store data
    if (timeStep < canvas.width) {
        if (values.length <= timeStep) {
            values.push(currentValue);
        } else {
            values[timeStep] = currentValue;
        }
        timeStep++;
    } else {
        values.shift();
        values.push(currentValue);
    }
    
    pidOutputs.push(output);
    if (pidOutputs.length > canvas.width) {
        pidOutputs.shift();
    }

    // Record history
    history.push({ time, targetValue, currentValue });
    if (history.length > canvas.width) {
        history.shift();
    }
    // Record target data
    targetHistory.push(targetValue);
    if (targetHistory.length > canvas.width) {
        targetHistory.shift();
    }
    
    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawAxes();
    drawCurrentValues();

    // Draw target value curve
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - targetHistory[0] * 4);
    for(let i = 1; i < targetHistory.length; i++) {
        ctx.lineTo(i, canvas.height - targetHistory[i] * 4);
    }
    ctx.strokeStyle = "red";
    ctx.stroke();
    
    // Draw noise effect
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - (values[0] + noiseHistory[0]) * 4);
    for(let i = 1; i < values.length; i++) {
        ctx.lineTo(i, canvas.height - (values[i] + noiseHistory[i]) * 4);
    }
    ctx.strokeStyle = "orange";
    ctx.stroke();
    }
    lastError = error;
    time = (time + timeIncrement) % canvas.width;
    requestAnimationFrame(update);
}

// Existing event listeners
setpoint.addEventListener('input', () => {
    targetValue = parseFloat(setpoint.value);
});
setpoint.addEventListener('input', () => {
    targetValue = parseFloat(setpoint.value);
    document.getElementById('setpointValue').textContent = targetValue.toFixed(2);
});

KpInput.addEventListener('input', () => {
    Kp = parseFloat(KpInput.value);
    document.getElementById('KpValue').textContent = Kp.toFixed(2);
});

KiInput.addEventListener('input', () => {
    Ki = parseFloat(KiInput.value);
    document.getElementById('KiValue').textContent = Ki.toFixed(2);
});

KdInput.addEventListener('input', () => {
    Kd = parseFloat(KdInput.value);
    document.getElementById('KdValue').textContent = Kd.toFixed(2);
});

noiseInput.addEventListener('input', () => {
    noiseAmplitude = parseFloat(noiseInput.value);
    document.getElementById('noiseValue').textContent = noiseAmplitude.toFixed(2);
});
[KpInput, KiInput, KdInput].forEach(input => {
    input.addEventListener('input', () => {
        Kp = parseFloat(KpInput.value);
        Ki = parseFloat(KiInput.value);
        Kd = parseFloat(KdInput.value);
    });
});

setpoint.addEventListener('input', () => {
    targetValue = parseFloat(setpoint.value);
    document.getElementById('setpointValue').textContent = targetValue.toFixed(2);
});


// Start the animation loop
update();
