const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const setpoint = document.getElementById('setpoint');
const KpInput = document.getElementById('Kp');
const KiInput = document.getElementById('Ki');
const KdInput = document.getElementById('Kd');

const noiseInput = document.getElementById('noise');
let noiseAmplitude = parseFloat(noiseInput.value);

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

function drawLine(data, color) {
    if (data.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - data[0] * 4);
    
    for (let i = 1; i < data.length; i++) {
        ctx.lineTo(i * T_WIDTH, canvas.height - data[i] * 4);
    }
    
    ctx.strokeStyle = color;
    ctx.stroke();
}

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
    
    currentValue += output + noise; // Adding noise to the current value

    // Ensure values remain within canvas bounds
    currentValue = Math.max(0, Math.min(canvas.height / 4, currentValue));

    // Record data
    targetHistory.push(targetValue); // Saving original target value
    values.push(currentValue);
    noiseHistory.push(currentValue + noise);  // This is now redundant, but kept for consistency. You can remove if not needed.
    
    if (values.length > canvas.width / T_WIDTH) {
        values.shift();
        targetHistory.shift();
        noiseHistory.shift();
    }

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes();
    
    if (document.getElementById('showTarget').checked) {
        drawLine(targetHistory, "red");
    }
    if (document.getElementById('showCurrent').checked) {
        drawLine(values, "blue");
    }
    if (document.getElementById('showNoise').checked) {
        drawLine(noiseHistory, "orange");
    }

    lastError = error;
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
