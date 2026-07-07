const COMPANY_PHONE = "17473674447";
const COMPANY_EMAIL = "DLCAO@mail.com";

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

function formMessage(form) {
  const data = new FormData(form);
  return [...data.entries()]
    .filter(([k, v]) => String(v).trim() !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function sendWhatsApp(message) {
  window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

document.getElementById("mainForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  sendWhatsApp("Hello DLCAO, I want to start a project:\n\n" + formMessage(this));
});

function sendValuation() {
  const address = document.getElementById("valueAddress").value || "No address entered";
  sendWhatsApp("Hello DLCAO, I want a home valuation for:\n\n" + address);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function calcFlip() {
  const arv = Number(document.getElementById("arv").value);
  const repairs = Number(document.getElementById("repairs").value);
  const profit = Number(document.getElementById("profit").value);
  const offer = (arv * 0.70) - repairs - profit;
  document.getElementById("flipResult").textContent = `${money(offer)} Max Offer`;
}
