let header = document.querySelector("header");
document.addEventListener("DOMContentLoaded", () => {
  openFeatures();
  todoList();
  dailyPlaner();
  motivationalQuote();
  pomodoroTimer();
  weatherFunctionality();
  changeThemeFuncionality();
});

function openFeatures() {
  let allElems = document.querySelectorAll(".elem");
  let pages = document.querySelectorAll(".fullElems");
  let pagesBackBtn = document.querySelectorAll(".fullElems .back");

  // Reload ke baad last opened page open karne ka logic
  let lastPageId = localStorage.getItem("lastPageId");
  if (lastPageId !== null) {
    pages[lastPageId].style.display = "block";
    document.body.style.overflow = "hidden";
  }

  allElems.forEach(function (elem) {
    elem.addEventListener("click", function () {
      pages[elem.id].style.display = "block";
      document.body.style.overflow = "hidden";

      // Save last opened page id
      localStorage.setItem("lastPageId", elem.id);
    });
  });

  pagesBackBtn.forEach(function (back) {
    back.addEventListener("click", function () {
      pages[back.id].style.display = "none";
      document.body.style.overflow = "";

      // Clear last opened page id
      localStorage.removeItem("lastPageId");
    });
  });
}
openFeatures();

function todoList() {
  var currentTask = [];
  if (localStorage.getItem("currentTask")) {
    currentTask = JSON.parse(localStorage.getItem("currentTask"));
  } else {
    console.error("empty list");
  }

  function renderTask() {
    let alltask = document.querySelector(".all-task");
    let clutter = "";

    currentTask.forEach(function (elem, idx) {
      clutter += `<div class="task">
              <h2>${elem.task} <span class=${elem.imp}>imp</span></h2>
              <button id=${idx}>Mark as Completed</button>
            </div>`;
    });
    alltask.innerHTML = clutter;
    localStorage.setItem("currentTask", JSON.stringify(currentTask));

    document.querySelectorAll(".task button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentTask.splice(btn.id, 1);
        renderTask();
      });
    });
  }
  renderTask();

  let form = document.querySelector(".add-task form");
  let taskInput = document.querySelector(".add-task form #task-input");
  let taskDetailsInput = document.querySelector(".add-task form textarea");
  let taskCheckBox = document.querySelector(".add-task form #check");

  // Create error message element
  let errorMsg = document.createElement("p");
  errorMsg.style.color = "red";
  errorMsg.style.backgroundColor = "var(--pri)";
  errorMsg.style.fontSize = "1.2rem";
  errorMsg.style.margin = "0";
  errorMsg.style.padding = "10px";
  errorMsg.style.borderRadius = "5px";
  errorMsg.style.display = "none";
  form.insertBefore(errorMsg, form.firstChild); // error top me dikhega

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Reset previous error styles
    taskInput.style.border = "";
    taskDetailsInput.style.border = "";
    errorMsg.style.display = "none";

    if (taskInput.value.trim() === "" || taskDetailsInput.value.trim() === "") {
      errorMsg.innerText = "⚠ Please fill in both task name and details.";
      errorMsg.style.display = "block";

      if (taskInput.value.trim() === "") {
        taskInput.style.border = "2px solid red";
      }
      if (taskDetailsInput.value.trim() === "") {
        taskDetailsInput.style.border = "2px solid red";
      }
      return; // Stop here
    }

    currentTask.push({
      task: taskInput.value.trim(),
      details: taskDetailsInput.value.trim(),
      imp: taskCheckBox.checked,
    });

    renderTask();
    taskInput.value = "";
    taskDetailsInput.value = "";
    taskCheckBox.checked = false;
  });
}
todoList();

function dailyPlaner() {
  let dailyPlanner = document.querySelector(".dialy-planner-container");

  // Get today's date in YYYY-MM-DD format
  let today = new Date().toISOString().split("T")[0];

  // Get saved data from localStorage
  let storedData = JSON.parse(localStorage.getItem("dailyPlannerData")) || {};
  let savedDate = localStorage.getItem("dailyPlannerDate");

  // If date mismatch → clear old data
  if (savedDate !== today) {
    storedData = {}; // clear old entries
    localStorage.setItem("dailyPlannerData", JSON.stringify({}));
    localStorage.setItem("dailyPlannerDate", today);
  }

  // Hours from 6AM to midnight
  let hours = Array.from(
    { length: 18 },
    (_, idx) => `${6 + idx}:00 - ${7 + idx}:00`
  );

  let wholeDaySum = "";
  hours.forEach(function (elem, idx) {
    let savedData = storedData[idx] || "";
    wholeDaySum += `
      <div class="daily-planner-time">
        <p>${elem}</p>
        <input id=${idx} type="text" placeholder="..." value="${savedData}" />
        <span class="save-status" style="display:none;font-size:0.8rem;color:green;">Saved ✅</span>
      </div>`;
  });
  dailyPlanner.innerHTML = wholeDaySum;

  // Input listeners
  document
    .querySelectorAll(".dialy-planner-container input")
    .forEach(function (elem) {
      let statusElem = elem.parentElement.querySelector(".save-status");

      elem.addEventListener("input", function () {
        storedData[elem.id] = elem.value;

        // Show "Saving..."
        statusElem.style.display = "inline";
        statusElem.style.color = "orange";
        statusElem.textContent = "Saving...";

        // Save after a short delay
        setTimeout(() => {
          localStorage.setItem("dailyPlannerData", JSON.stringify(storedData));
          localStorage.setItem("dailyPlannerDate", today);
          statusElem.style.color = "green";
          statusElem.textContent = "Saved ✅";
        }, 400);
      });
    });
}
dailyPlaner();

function motivationalQuote() {
  document.addEventListener("DOMContentLoaded", () => {
    let motivationQuote = document.querySelector(".motivation-2 p");
    let motivationAuthor = document.querySelector(".motivation-3 h2");

    // Loading message dikhana
    motivationQuote.textContent = "⚡ Charging your inspiration...";
    motivationAuthor.textContent = "";

    async function fetchQuote() {
      try {
        let response = await fetch("https://api.quotable.io/random");
        let data = await response.json();

        // Data set karna
        motivationQuote.textContent = data.content;
        motivationAuthor.textContent = `– ${data.author}`;
      } catch (error) {
        // Agar API fail ho jaaye to fallback text
        motivationQuote.textContent = "🚀 Unable to load a quote right now.";
        motivationAuthor.textContent = "";
      }
    }

    fetchQuote();
  });
}
motivationalQuote();

function pomodoroTimer() {
  let timer = document.querySelector(".pomo-timer h1");
  let startBtn = document.querySelector(".pomo-timer .start-timer");
  let pauseBtn = document.querySelector(".pomo-timer .pause-timer");
  let resetBtn = document.querySelector(".pomo-timer .reset-timer");
  let session = document.querySelector(".pomo-timer-fullPage .session");

  let totalSeconds = 25 * 60;
  var isWorkSession = true;
  let timerInterval = null;

  function updateTimer() {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    timer.innerHTML = `${String(minutes).padStart("2", "0")}:${String(
      seconds
    ).padStart("2", "0")}`;
  }

  function startTimer() {
    clearInterval(timerInterval);

    if (isWorkSession) {
      timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
          totalSeconds--;
          updateTimer();
        } else {
          isWorkSession = false;
          clearInterval(timerInterval);
          timer.innerHTML = "05:00";
          session.innerHTML = "Take a Break";
          session.style.backgroundColor = "var(--blue)";
          totalSeconds = 5 * 60;
        }
      }, 1000);
    } else {
      timerInterval = setInterval(() => {
        if (totalSeconds > 0) {
          totalSeconds--;
          updateTimer();
        } else {
          isWorkSession = true;
          clearInterval(timerInterval);
          timer.innerHTML = "25:00";
          session.innerHTML = "Work Session";
          session.style.backgroundColor = "var(--green)";
          totalSeconds = 25 * 60;
        }
      }, 1000);
    }
  }

  function pauseTimer() {
    clearInterval(timerInterval);
  }

  function resetTimer() {
    totalSeconds = 25 * 60;
    clearInterval(timerInterval);
    updateTimer();
  }

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);
}
pomodoroTimer();

function weatherFunctionality() {
  let apikey = "58ef33da401d49a48c063728250908";
  let city = "Mumbai"; // fallback city if location fails

  let temprature = document.querySelector(".header-2 #temprature");
  let condition = document.querySelector(".header-2 #condition");
  let humidity = document.querySelector(".header-2 #Humidity");
  let feelsLike = document.querySelector(".header-2 #feelsLike");
  let wind = document.querySelector(".header-2 #Wind");
  let cityInput = document.querySelector("#cityInput"); // add input in HTML for user

  // Show loading text initially
  temprature.innerHTML = "Loading weather...";
  condition.innerHTML = "";
  humidity.innerHTML = "";
  feelsLike.innerHTML = "";
  wind.innerHTML = "";

  async function weatherApiCall(selectedCity) {
    try {
      let response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apikey}&q=${selectedCity}`
      );
      let data = await response.json();

      temprature.innerHTML = `${Math.round(data.current.temp_c)} °C`;
      condition.innerHTML = `${data.current.condition.text}`;
      humidity.innerHTML = `Humidity: ${data.current.humidity}%`;
      feelsLike.innerHTML = `Feels Like: ${Math.round(
        data.current.feelslike_c
      )}°C`;
      wind.innerHTML = `Wind: ${data.current.wind_kph} KpH`;
    } catch (error) {
      temprature.innerHTML = "❌ Failed to load weather";
      console.error("Weather API error:", error);
    }
  }

  // Detect location automatically
  function getLocationAndFetch() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let lat = position.coords.latitude;
          let lon = position.coords.longitude;
          weatherApiCall(`${lat},${lon}`);
        },
        () => {
          console.warn("Location access denied, using default city.");
          weatherApiCall(city);
        }
      );
    } else {
      console.warn("Geolocation not supported, using default city.");
      weatherApiCall(city);
    }
  }

  // Allow user to change city manually
  if (cityInput) {
    cityInput.addEventListener("change", () => {
      let newCity = cityInput.value.trim();
      if (newCity) {
        weatherApiCall(newCity);
      }
    });
  }

  getLocationAndFetch();

  // Time update
  let header1Time = document.querySelector(".header-1 #time");
  let header1Date = document.querySelector(".header-1 #date");

  function time() {
    const totalDaysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const totalMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let date = new Date();
    let dayOfWeek = totalDaysOfWeek[date.getDay()];
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let currentDate = date.getDate();
    let month = totalMonths[date.getMonth()];
    let year = date.getFullYear();

    header1Date.innerHTML = `${String(currentDate).padStart(
      2,
      "0"
    )} ${month}, ${year}`;

    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    header1Time.innerHTML = `${dayOfWeek}, ${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )} ${period}`;
  }

  setInterval(time, 1000);
}
weatherFunctionality();

function updateHeaderBasedOnTime() {
  const header = document.querySelector("header");
  const hour = new Date().getHours();
  let imageUrl = "";

  if (hour >= 6 && hour < 17) {
    // Morning
    imageUrl =
      "https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=1600&auto=format&fit=crop&q=80";
  } else if (hour >= 17 && hour < 19) {
    // Evening
    imageUrl =
      "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?fm=jpg&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3Vuc2V0c3xlbnwwfHwwfHx8MA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000";
  } else {
    // Night
    imageUrl =
      "https://images.unsplash.com/photo-1514912885225-5c9ec8507d68?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fG5pZ2h0JTIwc2t5fGVufDB8MHwwfHx8MA%3D%3D";
  }

  header.style.backgroundImage = `url("${imageUrl}")`;
  header.style.backgroundSize = "cover";
  header.style.backgroundPosition = "center";
}

document.addEventListener("DOMContentLoaded", updateHeaderBasedOnTime);

setInterval(updateHeaderBasedOnTime, 15 * 60 * 1000);

function changeThemeFuncionality() {
  let theme = document.querySelector("#theme");
  let rootElement = document.documentElement;

  let flag = 0;
  theme.addEventListener("click", function () {
    if (flag == 0) {
      rootElement.style.setProperty("--pri", "#f1dec9");
      rootElement.style.setProperty("--sec", "#c8b6a6");
      rootElement.style.setProperty("--ter1", "#a4907c");
      rootElement.style.setProperty("--ter2", "#8d7b68");
      flag = 1;
    } else if (flag == 1) {
      rootElement.style.setProperty("--pri", "#DDE6ED");
      rootElement.style.setProperty("--sec", "#9DB2BF");
      rootElement.style.setProperty("--ter1", "#526D82");
      rootElement.style.setProperty("--ter2", "#27374D");
      flag = 2;
    } else if (flag == 2) {
      rootElement.style.setProperty("--pri", "#D0C9C0");
      rootElement.style.setProperty("--sec", "#EFEAD8");
      rootElement.style.setProperty("--ter1", "#6D8B74");
      rootElement.style.setProperty("--ter2", "#5F7161");
      flag = 0;
    }
  });
}
changeThemeFuncionality();
