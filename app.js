const form = document.getElementById("employee-form");
const table = document.getElementById("employee-table");
const clearBtn = document.getElementById("clear-btn");
const publicVapidKey = "BFX60-6BG7NRB2-3vR8LqrWcs3PO4S5ZBbuXb1000nyPow6CqiH6GgPwZqfuenlPHBFcH6yaeuMAekC62KKfXrE";

// Registrar Service Worker y suscribir al usuario
async function subscribeUserToPush() {
  if (!("serviceWorker" in navigator)) {
    console.error("Service Workers no están soportados en este navegador.");
    return;
  }

  const registration = await navigator.serviceWorker.register("/service-worker.js");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  // Enviar suscripción al servidor
  await fetch("/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });

  alert("Usuario suscrito a notificaciones push.");
}

// Convertir clave VAPID a formato Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Botón para activar notificaciones
document.getElementById("enable-push-btn").addEventListener("click", subscribeUserToPush);

// Función para mostrar notificaciones locales
function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();

  if (name && role) {
    addEmployeeToTable(name, role);
    saveEmployee(name, role);
    form.reset();
    showNotification("Employee Added", `${name} was successfully added.`);
  }
});

// Add employee to the table
function addEmployeeToTable(name, role) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td class="py-2 px-4">${name}</td>
    <td class="py-2 px-4">${role}</td>
  `;
  table.appendChild(row);
}

// Save employee to localStorage
function saveEmployee(name, role) {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  employees.push({ name, role });
  localStorage.setItem("employees", JSON.stringify(employees));
}

// Load employees on page load
window.addEventListener("load", () => {
  const employees = JSON.parse(localStorage.getItem("employees")) || [];
  employees.forEach((employee) => addEmployeeToTable(employee.name, employee.role));

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});

// Clear table and localStorage
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all records?")) {
    localStorage.removeItem("employees");
    table.innerHTML = "";
    showNotification("Records Cleared", "All employee records have been deleted.");
  }
});
