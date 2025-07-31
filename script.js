

// --- Log Parser ---
// --- 展平 JSON ---
function flattenJSON(obj, prefix = '', res = {}) {
  if (typeof obj !== 'object' || obj === null) {
    res[prefix] = obj;
    return res;
  }

  if (Array.isArray(obj)) {
    obj.forEach((v, i) => {
      flattenJSON(v, `${prefix}[${i}]`, res);
    });
  } else {
    Object.entries(obj).forEach(([k, v]) => {
      const newPrefix = prefix ? `${prefix}.${k}` : k;
      flattenJSON(v, newPrefix, res);
    });
  }

  return res;
}

// --- 生成表格 ---
function createTableFromObjects(dataArray) {
  if (!dataArray.length) return "<div>無資料</div>";

  const allKeys = [...new Set(dataArray.flatMap(obj => Object.keys(obj)))];

  let html = "<table class='log-table'><thead><tr>";
  html += "<th>#</th>";
  allKeys.forEach(k => { html += `<th>${k}</th>`; });
  html += "</tr></thead><tbody>";

  dataArray.forEach((obj, idx) => {
    html += `<tr><td>${idx+1}</td>`;
    allKeys.forEach(k => {
      html += `<td>${obj[k] !== undefined ? obj[k] : ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

// --- Log Parser ---
document.getElementById("parseBtn").addEventListener("click", () => {
  const input = document.getElementById("logInput").value.trim();
  const rows = input.split("\n").filter(r => r.trim());

  // 🔹 略過第一行標題
  if (rows.length && rows[0].toLowerCase().includes("request.uri")) {
    rows.shift();
  }

  const reqTable = document.getElementById("requestTable");
  const resTable = document.getElementById("responseTable");
  const errLog = document.getElementById("errorLog");

  reqTable.innerHTML = "";
  resTable.innerHTML = "";
  errLog.innerHTML = "";

  const reqFlattened = [];
  const resFlattened = [];

  rows.forEach((row, idx) => {
    const cols = row.split("\t");
    if (cols.length < 3) {
      errLog.innerHTML += `<div>第 ${idx+1} 行格式不正確</div>`;
      return;
    }

    const [uri, req, res] = cols;

    try {
      const reqObj = req ? JSON.parse(req) : {};
      const resObj = res ? JSON.parse(res) : {};
      reqFlattened.push(flattenJSON(reqObj));
      resFlattened.push(flattenJSON(resObj));
    } catch (e) {
      errLog.innerHTML += `<div>第 ${idx+1} 行解析失敗: ${e.message}</div>`;
    }
  });

  reqTable.innerHTML = createTableFromObjects(reqFlattened);
  resTable.innerHTML = createTableFromObjects(resFlattened);
});


const scrollTopBtn = document.getElementById("scrollTopBtn");

// 滾動時顯示或隱藏按鈕
window.onscroll = function() {
  if (document.documentElement.scrollTop > 100) {
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
};

// 按下按鈕，平滑回到頂端
scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// --- Tab 切換 ---
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // 切換按鈕 active 狀態
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 切換內容區塊
    const targetId = btn.getAttribute("data-target");
    document.querySelectorAll(".tab-content").forEach(div => div.classList.remove("active"));
    document.getElementById(targetId).classList.add("active");

    // 🔹 自動捲到可見範圍
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
// 工具頁面切換
document.querySelectorAll(".tool-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tool-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tool-content").forEach(div => div.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// JSON Beautifier
document.getElementById("beautifyBtn").addEventListener("click", () => {
  const input = document.getElementById("jsonInput").value;
  try {
    const parsed = JSON.parse(input);
    document.getElementById("beautifyResult").textContent = JSON.stringify(parsed, null, 2);
  } catch (err) {
    document.getElementById("beautifyResult").textContent = "❌ JSON 解析失敗";
  }
});
