let measuring = false;
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

  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;

  updateChart(x, y, z);
}

// カメラ開始
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    const video = document.getElementById("camera");
    video.srcObject = stream;

    setStatus("カメラ起動中");
  } catch (err) {
    setStatus("カメラ起動失敗: " + err);
  }
}

// ボタン紐付け
document.getElementById("btnStart").onclick = () => {
  startCamera();
  startMeasuring();
};

document.getElementById("btnStop").onclick = stopMeasuring;
