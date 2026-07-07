const COMPANY_PHONE = "17473674447";

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => navMenu.classList.toggle("show"));

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("show"));
});

function formMessage(form) {
  const data = new FormData(form);
  return [...data.entries()]
    .filter(([key, value]) => String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function sendWhatsApp(message) {
  window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

["estimateForm", "buyForm", "contactForm", "propertyForm"].forEach(id => {
  document.getElementById(id)?.addEventListener("submit", function(e) {
    e.preventDefault();
    sendWhatsApp("Hello DLCAO:\n\n" + formMessage(this));
  });
});

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
}

function calcFlip() {
  const arv = Number(document.getElementById("arv").value);
  const repairs = Number(document.getElementById("repairs").value);
  const profit = Number(document.getElementById("profit").value);
  const offer = (arv * 0.70) - repairs - profit;
  document.getElementById("flipResult").textContent = `${money(offer)} Max Offer`;
}
