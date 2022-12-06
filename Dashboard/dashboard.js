document.addEventListener("DOMContentLoaded", function () {
  // chart.js const setting
  const labels = ["啟動", "暫停", "待機"];
  const data = {
    labels: labels,
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(255, 0, 0, 0.2)",
          "rgba(255, 165, 0, 0.2)",
          "rgba(0, 128, 0, 0.2)",
        ],
        borderColor: ["#ff0000", "#ffa500", "#008000"],
        borderWidth: 1,
      },
    ],
  };
  const config = {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: "#2f0000",
          },
          max: Math.max(...data.datasets[0].data) + 1,
          grid: {
            color: "#e0e0e0",
          },
        },
        x: {
          ticks: {
            color: "#2f0000",
          },
          grid: {
            color: "#e0e0e0",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      layout: {
        padding: 15,
      },
    },
  };

  // variable declaration
  let timerList = [];
  let timerIdList = [];
  let stopwatchCount = 0;
  let recordNum = 0;
  let recordIdList = [];
  let countdownTimerInit = 0;
  let countdownTimerCount = 0;
  let lastTimerCount = { activation: 0, suspension: 0, standby: 0 };

  // object declaration
  let ringtone = new Audio(
    "https://tadralling.com/dist/dashboard/digital-alarm.mp3"
  );
  ringtone.loop = true;
  let statusChart = new Chart(document.getElementById("status-chart"), config);
  Chart.defaults.font.size = 20;
  class Timer {
    constructor(name) {
      this.id = Date.now();
      this.name = name;
      this.count = 0;
    }
  }

  // function declaration
  function doubleDigit(num) {
    let output = num < 10 ? "0" + `${num}` : `${num}`;
    return output;
  }

  function enterClicker(ele, btn) {
    document.querySelector(ele).addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        document.querySelector(btn).click();
      }
    });
  }

  function fixHeight(parentId, sublevelId) {
    let screenWidth = window.screen.width;
    let parentEle = document.querySelector(parentId);
    let sublevelEle = document.querySelector(sublevelId);
    let height = parentEle.clientHeight;
    if (screenWidth <= 768) {
      sublevelEle.setAttribute(
        "style",
        `height: ${0.8 * window.screen.height}px;`
      );
    } else if (screenWidth <= 1200 && parentId === "#timer-area") {
      sublevelEle.setAttribute(
        "style",
        `height: ${0.8 * window.screen.height}px;`
      );
    } else {
      sublevelEle.setAttribute("style", `height: ${height - 120}px;`);
    }
  }

  function timePrinter() {
    let time = new Date();
    let hrs = 0;
    let session = "";
    let weeks = "";
    if (time.getHours() < 12) {
      session = "AM";
      hrs = time.getHours();
    } else if (time.getHours() === 12) {
      session = "PM";
      hrs = time.getHours();
    } else {
      session = "PM";
      hrs = time.getHours() - 12;
    }
    if (time.getDay() === 0) {
      weeks = "星期日";
    }
    if (time.getDay() === 1) {
      weeks = "星期一";
    }
    if (time.getDay() === 2) {
      weeks = "星期二";
    }
    if (time.getDay() === 3) {
      weeks = "星期三";
    }
    if (time.getDay() === 4) {
      weeks = "星期四";
    }
    if (time.getDay() === 5) {
      weeks = "星期五";
    }
    if (time.getDay() === 6) {
      weeks = "星期六";
    }
    document.querySelector("#hrs").innerHTML = doubleDigit(hrs);
    document.querySelector("#min").innerHTML = doubleDigit(time.getMinutes());
    document.querySelector("#sec").innerHTML = doubleDigit(time.getSeconds());
    document.querySelector("#session").innerHTML = session;
    document.querySelector("#yer").innerHTML = time.getFullYear();
    document.querySelector("#mon").innerHTML = time.getMonth() + 1;
    document.querySelector("#day").innerHTML = time.getDate();
    document.querySelector("#weeks").innerHTML = weeks;
  }

  function timerPrinter(id, count) {
    let c = count;
    let s = Math.floor(c / 100);
    let sec = s % 60;
    let min = Math.floor((s / 60) % 60);
    let hrs = Math.floor((s / 3600) % 100);
    document.querySelector(`#t-sec-${id}`).innerHTML = doubleDigit(sec);
    document.querySelector(`#t-min-${id}`).innerHTML = doubleDigit(min);
    document.querySelector(`#t-hrs-${id}`).innerHTML = doubleDigit(hrs);
    timerList[timerIdList.indexOf(parseInt(id))].count = count;
  }

  function timerStartFun(start) {
    start.addEventListener("click", (e) => {
      let btn = e.target.dataset.id;
      let index = timerIdList.indexOf(parseInt(btn));
      if (start.innerHTML === "開始") {
        let counter = new Worker(
          "https://tadralling.com/dist/dashboard/counter.min.js"
        );
        counter.postMessage({ count: timerList[index].count });
        counter.onmessage = function (e) {
          let count = e.data.count;
          timerPrinter(btn, count);
        };
        start.addEventListener(
          "click",
          () => {
            counter.terminate();
          },
          { once: true }
        );
        start.innerHTML = "暫停";
      } else {
        start.innerHTML = "開始";
      }
    });
  }

  function timerResetFun(reset, start) {
    reset.addEventListener("click", (e) => {
      let btn = e.target.dataset.id;
      let index = timerIdList.indexOf(parseInt(btn));
      if (start.innerHTML !== "開始") {
        start.click();
      }
      timerList[index].count = 0;
      timerPrinter(btn, timerList[index].count);
    });
  }

  function timerDeleFun(dele, start) {
    dele.addEventListener("click", (e) => {
      let btn = e.target.dataset.id;
      let index = timerIdList.indexOf(parseInt(btn));
      let timerDele = document.getElementById(btn);
      if (start.innerHTML !== "開始") {
        start.click();
      }
      timerList.splice(index, 1);
      timerIdList.splice(index, 1);
      timerDele.remove();
    });
  }

  function stopwatchPrinter(count) {
    let c = Math.floor(count / 100);
    let tms = count % 100;
    let sec = c % 60;
    let min = Math.floor((c / 60) % 60);
    let hrs = Math.floor((c / 3600) % 100);
    document.querySelector("#s-tms").innerHTML = doubleDigit(tms);
    document.querySelector("#s-sec").innerHTML = doubleDigit(sec);
    document.querySelector("#s-min").innerHTML = doubleDigit(min);
    document.querySelector("#s-hrs").innerHTML = doubleDigit(hrs);
    stopwatchCount = count;
  }

  function recordDeleFun(dele) {
    dele.addEventListener("click", (e) => {
      let btn = e.target.dataset.id;
      let index = recordIdList.indexOf(parseInt(btn));
      let recordDele = document.getElementById(btn);
      recordIdList.splice(index, 1);
      recordDele.remove();
    });
  }

  function inputConverter(input) {
    let count = Math.abs(parseInt(input, 10));
    if (isNaN(count) === true) {
      return 0;
    } else {
      return count;
    }
  }

  function countdownTimerPrinter(count) {
    let c = Math.floor(count / 100);
    let hrs = Math.floor(c / 3600);
    let min = Math.floor((c % 3600) / 60);
    let sec = Math.floor((c % 3600) % 60);
    document.querySelector("#c-sec").innerHTML = doubleDigit(sec);
    document.querySelector("#c-min").innerHTML = doubleDigit(min);
    document.querySelector("#c-hrs").innerHTML = doubleDigit(hrs);
    countdownTimerCount = count;
  }

  function percentagePrinter(count, init) {
    let percentage = Math.floor((count / init) * 100);
    if (isNaN(percentage) === true) {
      percentage = 0;
    }
    document.querySelector("#percent-number").innerHTML =
      doubleDigit(percentage);
    document.querySelector("#graph-percent").style.strokeDashoffset = `${
      ((100 - percentage) / 100) * 2 * 70 * 3.1416
    }`;
  }

  function status() {
    let element = document.querySelector("#status-area");
    let recordCount = 0;
    let timerCount = { activation: 0, suspension: 0, standby: 0 };
    let stopwatchStatus = 0;
    let countdownTimerStatus = 0;

    function recordCheck() {
      document.querySelectorAll(".record").forEach((ele) => {
        recordCount++;
      });
    }

    function timerStatusCheck() {
      document.querySelectorAll(".timer").forEach((ele) => {
        let timeStatus = 0;
        ele.querySelectorAll("span").forEach((span) => {
          if (span.innerHTML !== "00") {
            timeStatus++;
          }
        });
        if (ele.querySelector("#t-start-pause").innerHTML !== "開始") {
          timerCount.activation++;
        } else if (timeStatus !== 0) {
          timerCount.suspension++;
        } else {
          timerCount.standby++;
        }
      });
    }

    function stopwatchStatusCheck() {
      let target = document.querySelector("#stopwatch-area");
      let timeStatus = 0;
      target.querySelectorAll("span").forEach((span) => {
        if (span.innerHTML !== "00") {
          timeStatus++;
        }
      });
      if (target.querySelector("#s-start-pause").innerHTML !== "開始") {
        stopwatchStatus = 2;
      } else if (timeStatus !== 1) {
        stopwatchStatus = 1;
      } else {
        stopwatchStatus = 0;
      }
    }

    function countdownTimerStatusCheck() {
      let controls = document
        .querySelector("#countdown-timer-area")
        .querySelector("#c-start-pause");
      if (controls.innerHTML !== "開始") {
        countdownTimerStatus = 2;
      } else if (countdownTimerCount !== countdownTimerInit) {
        countdownTimerStatus = 1;
      } else {
        countdownTimerStatus = 0;
      }
    }

    function classAdder(ele, status) {
      let target = element.querySelector(ele);
      if (status === 0) {
        target.querySelector(".standby").classList.add("show");
        target.querySelector(".suspension").classList.remove("show");
        target.querySelector(".activation").classList.remove("show");
        target.querySelector(".light").classList.add("green");
        target.querySelector(".light").classList.remove("orange");
        target.querySelector(".light").classList.remove("red");
      }
      if (status === 1) {
        target.querySelector(".standby").classList.remove("show");
        target.querySelector(".suspension").classList.add("show");
        target.querySelector(".activation").classList.remove("show");
        target.querySelector(".light").classList.remove("green");
        target.querySelector(".light").classList.add("orange");
        target.querySelector(".light").classList.remove("red");
      }
      if (status === 2) {
        target.querySelector(".standby").classList.remove("show");
        target.querySelector(".suspension").classList.remove("show");
        target.querySelector(".activation").classList.add("show");
        target.querySelector(".light").classList.remove("green");
        target.querySelector(".light").classList.remove("orange");
        target.querySelector(".light").classList.add("red");
      }
    }

    recordCheck();
    timerStatusCheck();
    stopwatchStatusCheck();
    countdownTimerStatusCheck();
    classAdder(".stopwatch", stopwatchStatus);
    classAdder(".countdown-timer", countdownTimerStatus);
    element.querySelector("#stopwatch-record-count").innerHTML = recordCount;
    element.querySelector("#countdown-timer-percent").innerHTML =
      document.querySelector("#percent-number").innerHTML;
    element.querySelector("#timer-count").innerHTML =
      timerCount.activation + timerCount.suspension + timerCount.standby;
    if (
      lastTimerCount.activation === timerCount.activation &&
      lastTimerCount.suspension === timerCount.suspension &&
      lastTimerCount.standby === timerCount.standby
    ) {
      return;
    } else {
      statusChart.data.datasets[0].data[0] = timerCount.activation;
      statusChart.data.datasets[0].data[1] = timerCount.suspension;
      statusChart.data.datasets[0].data[2] = timerCount.standby;
      statusChart.options.scales.y.max = Math.max(...data.datasets[0].data) + 1;
      statusChart.update();
      lastTimerCount = timerCount;
    }
  }

  // fixed box height
  fixHeight("#stopwatch-record-area", "#stopwatch-records");
  fixHeight("#timer-area", "#timer-columns");

  // read local storage data
  if (localStorage.getItem("timerList")) {
    timerList = JSON.parse(localStorage.getItem("timerList"));
  }
  if (localStorage.getItem("timerIdList")) {
    timerIdList = JSON.parse(localStorage.getItem("timerIdList"));
  }
  if (localStorage.getItem("timerHTML")) {
    document.querySelector("#timer-columns").innerHTML =
      localStorage.getItem("timerHTML");
    document.querySelectorAll(".timer").forEach((timer) => {
      let start = timer.querySelector("#t-start-pause");
      let reset = timer.querySelector("#t-reset");
      let dele = timer.querySelector("#t-delete");
      timerStartFun(start);
      timerResetFun(reset, start);
      timerDeleFun(dele, start);
    });
  }
  if (localStorage.getItem("stopwatchCount")) {
    stopwatchCount = parseInt(localStorage.getItem("stopwatchCount"), 10);
    stopwatchPrinter(stopwatchCount);
  }
  if (localStorage.getItem("recordNum")) {
    recordNum = parseInt(localStorage.getItem("recordNum"), 10);
  }
  if (localStorage.getItem("recordIdList")) {
    recordIdList = JSON.parse(localStorage.getItem("recordIdList"));
  }
  if (localStorage.getItem("recordHTML")) {
    document.querySelector("#stopwatch-records").innerHTML =
      localStorage.getItem("recordHTML");
    document.querySelectorAll(".record").forEach((record) => {
      let dele = record.querySelector("#s-delete");
      recordDeleFun(dele);
    });
  }
  if (
    localStorage.getItem("countdownTimerInit") &&
    localStorage.getItem("countdownTimerCount")
  ) {
    countdownTimerInit = parseInt(
      localStorage.getItem("countdownTimerInit"),
      10
    );
    countdownTimerCount = parseInt(
      localStorage.getItem("countdownTimerCount"),
      10
    );
    countdownTimerPrinter(countdownTimerCount);
    percentagePrinter(countdownTimerCount, countdownTimerInit);
  }

  // run regular updates
  timePrinter();
  status();
  setInterval(timePrinter, 1000);
  setInterval(status, 100);

  // write local storage data
  window.addEventListener("unload", () => {
    localStorage.clear();
    let darkMode = document.querySelector("#mode-toggle").checked;
    localStorage.setItem("darkMode", darkMode);
    document.querySelectorAll(".timer").forEach((timer) => {
      let start = timer.querySelector("#t-start-pause");
      if (start.innerHTML !== "開始") {
        start.innerHTML = "開始";
      }
    });
    let timerHTML = document.querySelector("#timer-columns");
    localStorage.setItem("timerList", JSON.stringify(timerList));
    localStorage.setItem("timerIdList", JSON.stringify(timerIdList));
    localStorage.setItem("timerHTML", timerHTML.innerHTML);
    let recordHTML = document.querySelector("#stopwatch-records");
    localStorage.setItem("recordIdList", JSON.stringify(recordIdList));
    localStorage.setItem("stopwatchCount", stopwatchCount);
    localStorage.setItem("recordNum", recordNum);
    localStorage.setItem("recordHTML", recordHTML.innerHTML);
    localStorage.setItem("countdownTimerInit", countdownTimerInit);
    localStorage.setItem("countdownTimerCount", countdownTimerCount);
  });

  // theme switching
  document
    .querySelector("#mode-toggle")
    .addEventListener("change", function () {
      if (this.checked) {
        document.querySelector("body").classList.add("dark-mode");
        document.querySelector("#mode-status").classList.add("dark");
        document.querySelector("#mode-status").classList.remove("light");
        statusChart.config.options.scales.y.ticks.color = "#e0e0e0";
        statusChart.config.options.scales.x.ticks.color = "#e0e0e0";
        statusChart.config.options.scales.y.grid.color = "#3c3c3c";
        statusChart.config.options.scales.x.grid.color = "#3c3c3c";
        statusChart.data.datasets[0].backgroundColor[0] =
          "rgba(246, 121, 194, 0.3)";
        statusChart.data.datasets[0].backgroundColor[1] =
          "rgba(243, 157, 104, 0.3)";
        statusChart.data.datasets[0].backgroundColor[2] =
          "rgba(185, 210, 177, 0.3)";
        statusChart.data.datasets[0].borderColor[0] = "#f679c2";
        statusChart.data.datasets[0].borderColor[1] = "#f39d68";
        statusChart.data.datasets[0].borderColor[2] = "#b9d2b1";
      } else {
        document.querySelector("body").classList.remove("dark-mode");
        document.querySelector("#mode-status").classList.remove("dark");
        document.querySelector("#mode-status").classList.add("light");
        statusChart.config.options.scales.y.ticks.color = "#2f0000";
        statusChart.config.options.scales.x.ticks.color = "#2f0000";
        statusChart.config.options.scales.y.grid.color = "#e0e0e0";
        statusChart.config.options.scales.x.grid.color = "#e0e0e0";
        statusChart.data.datasets[0].backgroundColor[0] =
          "rgba(255, 0, 0, 0.2)";
        statusChart.data.datasets[0].backgroundColor[1] =
          "rgba(255, 160, 66, 0.2)";
        statusChart.data.datasets[0].backgroundColor[2] =
          "rgba(0, 128, 0, 0.2)";
        statusChart.data.datasets[0].borderColor[0] = "#ff0000";
        statusChart.data.datasets[0].borderColor[1] = "#ffa042";
        statusChart.data.datasets[0].borderColor[2] = "#008000";
      }
      statusChart.update();
    });
  if (localStorage.getItem("darkMode") === "true") {
    document.querySelector("#mode-toggle").click();
  } else if (localStorage.getItem("darkMode") === "false") {
    return;
  } else {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.querySelector("#mode-toggle").click();
    }
  }

  // timer
  enterClicker("#input-timer-name", "#t-build");

  document.querySelector("#t-build").onclick = function () {
    if (document.querySelector("#input-timer-name").value !== "") {
      let lastTimerId = Math.max(...timerIdList);
      let lastTimerWrap = document.getElementById(lastTimerId);
      let name = document.querySelector("#input-timer-name").value;
      document.querySelector("#input-timer-name").value = "";
      let newTimer = new Timer(name);
      timerList.push(newTimer);
      timerIdList.push(newTimer.id);
      let timerWrap = document.createElement("div");
      timerWrap.setAttribute("class", "timer");
      timerWrap.setAttribute("id", newTimer.id);
      timerWrap.innerHTML =
        '<div class="title"><h3>' +
        newTimer.name +
        '</h3></div><div class="times"><p><span id="t-hrs-' +
        newTimer.id +
        '">00</span> 時 <span id="t-min-' +
        newTimer.id +
        '">00</span> 分 <span id="t-sec-' +
        newTimer.id +
        '">00</span> 秒</p></div><div class="controls"><button id="t-start-pause" data-id="' +
        newTimer.id +
        '">開始</button><button id="t-reset" data-id="' +
        newTimer.id +
        '">歸零</button><button id="t-delete" data-id="' +
        newTimer.id +
        '">刪除</button></div>';
      if (document.querySelector("#timer-columns").innerHTML === "") {
        document.querySelector("#timer-columns").appendChild(timerWrap);
      } else {
        document
          .querySelector("#timer-columns")
          .insertBefore(timerWrap, lastTimerWrap);
      }
      let wrap = document.getElementById(newTimer.id);
      let start = wrap.querySelector("#t-start-pause");
      let reset = wrap.querySelector("#t-reset");
      let dele = wrap.querySelector("#t-delete");
      timerStartFun(start);
      timerResetFun(reset, start);
      timerDeleFun(dele, start);
    }
  };

  document.querySelector("#t-clean").onclick = function () {
    document.querySelectorAll(".timer").forEach((timer) => {
      let start = timer.querySelector("#t-start-pause");
      if (start.innerHTML !== "開始") {
        start.click();
      }
    });
    document.querySelector("#timer-columns").innerHTML = "";
    timerList = [];
    timerIdList = [];
  };

  // stopwatch
  document.querySelector("#s-start-pause").onclick = function () {
    if (document.querySelector("#s-start-pause").innerHTML === "開始") {
      let counter = new Worker(
        "https://tadralling.com/dist/dashboard/counter.min.js"
      );
      counter.postMessage({ count: stopwatchCount });
      counter.onmessage = function (e) {
        let count = e.data.count;
        stopwatchPrinter(count);
      };
      document.querySelector("#s-start-pause").addEventListener(
        "click",
        () => {
          counter.terminate();
        },
        { once: true }
      );
      document.querySelector("#s-start-pause").innerHTML = "暫停";
    } else {
      document.querySelector("#s-start-pause").innerHTML = "開始";
    }
  };

  document.querySelector("#s-reset").onclick = function () {
    if (document.querySelector("#s-start-pause").innerHTML !== "開始") {
      document.querySelector("#s-start-pause").click();
    }
    stopwatchCount = 0;
    stopwatchPrinter(stopwatchCount);
  };

  document.querySelector("#s-record").onclick = function () {
    recordNum++;
    let lastRecordId = Math.max(...recordIdList);
    let lastRecordWrap = document.getElementById(lastRecordId);
    let tms = document.querySelector("#s-tms").innerHTML;
    let sec = document.querySelector("#s-sec").innerHTML;
    let min = document.querySelector("#s-min").innerHTML;
    let hrs = document.querySelector("#s-hrs").innerHTML;
    let newId = Date.now();
    recordIdList.push(newId);
    let newRecordWrap = document.createElement("div");
    newRecordWrap.setAttribute("class", "record");
    newRecordWrap.setAttribute("id", newId);
    newRecordWrap.innerHTML =
      '<div class="times"><p>#' +
      recordNum +
      "&emsp;&emsp;" +
      hrs +
      " 時 " +
      min +
      " 分 " +
      sec +
      " 秒<span> " +
      tms +
      '</span></p></div><div class="record-controls"><button id="s-delete" data-id="' +
      newId +
      '">刪除</button></div>';
    if (document.querySelector("#stopwatch-records").innerHTML === "") {
      document.querySelector("#stopwatch-records").appendChild(newRecordWrap);
    } else {
      document
        .querySelector("#stopwatch-records")
        .insertBefore(newRecordWrap, lastRecordWrap);
    }
    let wrap = document.querySelector("#stopwatch-records");
    let dele = wrap.querySelector("#s-delete");
    recordDeleFun(dele);
  };

  document.querySelector("#s-clean").onclick = function () {
    document.querySelector("#stopwatch-records").innerHTML = "";
    recordNum = 0;
    recordIdList = [];
  };

  // countdownTimer
  enterClicker("#input-c-sec", "#send");
  enterClicker("#input-c-min", "#send");
  enterClicker("#input-c-hrs", "#send");

  document.querySelector("#send").onclick = function () {
    let count = 0;
    let sec = document.querySelector("#input-c-sec").value;
    let min = document.querySelector("#input-c-min").value;
    let hrs = document.querySelector("#input-c-hrs").value;
    if (sec !== "") {
      count = count + inputConverter(sec) * 100;
    }
    if (min !== "") {
      count = count + inputConverter(min) * 100 * 60;
    }
    if (hrs !== "") {
      count = count + inputConverter(hrs) * 100 * 3600;
    }
    if (count > 35999900) {
      countdownTimerCount = 35999900;
      countdownTimerInit = 35999900;
    } else {
      countdownTimerCount = count;
      countdownTimerInit = count;
    }
    countdownTimerPrinter(countdownTimerCount);
    percentagePrinter(countdownTimerCount, countdownTimerInit);
    document.querySelector("#input-c-sec").value = "";
    document.querySelector("#input-c-min").value = "";
    document.querySelector("#input-c-hrs").value = "";
  };

  document.querySelector("#c-start-pause").onclick = function () {
    if (countdownTimerCount !== 0) {
      if (document.querySelector("#c-start-pause").innerHTML === "開始") {
        let countdown = new Worker(
          "https://tadralling.com/dist/dashboard/countdown.min.js"
        );
        countdown.postMessage({ count: countdownTimerCount });
        countdown.onmessage = function (e) {
          let count = e.data.count;
          countdownTimerPrinter(count);
          percentagePrinter(countdownTimerCount, countdownTimerInit);
          if (count === 0) {
            ringtone.play();
          }
        };
        document.querySelector("#c-start-pause").addEventListener(
          "click",
          () => {
            countdown.terminate();
          },
          { once: true }
        );
        document.querySelector("#c-start-pause").innerHTML = "暫停";
      } else {
        document.querySelector("#c-start-pause").innerHTML = "開始";
      }
    } else {
      ringtone.pause();
      ringtone.currentTime = 0;
      countdownTimerCount = countdownTimerInit;
      countdownTimerPrinter(countdownTimerCount);
      percentagePrinter(countdownTimerCount, countdownTimerInit);
      document.querySelector("#c-start-pause").innerHTML = "開始";
    }
  };

  document.querySelector("#c-reset").onclick = function () {
    if (document.querySelector("#c-start-pause").innerHTML !== "開始") {
      document.querySelector("#c-start-pause").click();
    }
    ringtone.pause();
    ringtone.currentTime = 0;
    countdownTimerCount = countdownTimerInit;
    countdownTimerPrinter(countdownTimerCount);
    percentagePrinter(countdownTimerCount, countdownTimerInit);
  };
});
