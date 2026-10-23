let measuring = false;
let dataLog = [];
const MAX_POINTS = 300;

// Chart.js 初期化
const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      { label: "X", borderColor: "red", data: [], pointRadius: 0 },
      { label: "Y", borderColor: "green", data: [], pointRadius: 0 },
      { label: "Z", borderColor: "blue", data: [], pointRadius: 0 }
    ]
  },
  options: {
    animation: false,
    responsive: true,
    scales: {
      x: { display: false },
      y: { title: { display: true, text: "加速度 (m/s²)" } }
    }
  }
});

// 状態表示
function setStatus(s) {
  document.getElementById("status").textContent = "状態: " + s;
}

// iOS向けセンサー許可
async function requestPermission() {
  if (DeviceMotionEvent.requestPermission) {
    const res = await DeviceMotionEvent.requestPermission();
    setStatus(res === "granted" ? "センサー許可OK" : "拒否されました");
  } else {
    setStatus("許可不要");
  }
}

// 計測開始
function startMeasuring() {
  if (measuring) return;
  measuring = true;
  setStatus("計測中");
  window.addEventListener("devicemotion", onMotion);
}

// 計測停止
function stopMeasuring() {
  measuring = false;
  setStatus("停止");
  window.removeEventListener("devicemotion", onMotion);
}

// 波形更新
function updateChart(x, y, z) {
  const labels = chart.data.labels;
  const dx = chart.data.datasets[0].data;
  const dy = chart.data.datasets[1].data;
  const dz = chart.data.datasets[2].data;

  labels.push("");
  dx.push(x);
  dy.push(y);
  dz.push(z);

  if (dx.length > MAX_POINTS) {
    labels.shift();
    dx.shift();
    dy.shift();
    dz.shift();
  }

  chart.update();
}

// センサーイベント
function onMotion(e) {
  const acc = e.accelerationIncludingGravity || e.acceleration;
  if (!acc) return;

  const ts = performance.now();
  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  updateChart(x, y, z);
  dataLog.push({ ts, x, y, z });
}

// CSV保存
function exportCSV() {
  if (dataLog.length === 0) {
    setStatus("データなし");
    return;
  }

  let csv = "time_ms,x,y,z\n";
  dataLog.forEach(d => {
    csv += `${d.ts},${d.x},${d.y},${d.z}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "accel_data.csv";
  a.click();
  URL.revokeObjectURL(url);

  setStatus("CSV保存完了");
}

// カメラ開始
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" } // 背面カメラ
    });

    const video = document.getElementById("camera");
    video.srcObject = stream;

    setStatus("カメラ起動中");
  } catch (err) {
    setStatus("カメラ起動失敗: " + err);
  }
}

// ボタン紐付け
document.getElementById("btnPermission").onclick = requestPermission;
document.getElementById("btnStart").onclick = startMeasuring;
document.getElementById("btnStop").onclick = stopMeasuring;
document.getElementById("btnExport").onclick = exportCSV;
document.getElementById("btnCamera").onclick = startCamera;
