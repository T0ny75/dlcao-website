const COMPANY_PHONE = "17473674447";
const COMPANY_EMAIL = "DLCAO@mail.com";

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => {
  navMenu.classList.toggle("show");
});

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

document.getElementById("estimateForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  sendWhatsApp("Hello DLCAO, I want a free estimate:\n\n" + formMessage(this));
});

document.getElementById("buyerForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  sendWhatsApp("Hello DLCAO, I need help buying a property:\n\n" + formMessage(this));
});

document.getElementById("newsletterForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  alert("Thank you. Your email is ready to be added to the DLCAO newsletter list.");
  this.reset();
});

function sendHomeValuation() {
  const address = document.getElementById("homeValueAddress").value || "No address entered";
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

function calcMortgage() {
  const price = Number(document.getElementById("homePrice").value);
  const down = Number(document.getElementById("downPayment").value);
  const rate = Number(document.getElementById("rate").value) / 100 / 12;
  const years = Number(document.getElementById("years").value);
  const months = years * 12;
  const principal = price - down;

  let payment = principal / months;
  if (rate > 0) {
    payment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
  }

  document.getElementById("mortgageResult").textContent = `${money(payment)} Monthly Estimate`;
}

function calcAffordability() {
  const income = Number(document.getElementById("income").value);
  const debts = Number(document.getElementById("debts").value);
  const dti = Number(document.getElementById("dti").value) / 100;
  const maxPayment = (income * dti) - debts;

  document.getElementById("affordResult").textContent = `${money(maxPayment)} Max Payment`;
}

function calcRentBuy() {
  const rent = Number(document.getElementById("rent").value);
  const buyPayment = Number(document.getElementById("buyPayment").value);
  const difference = buyPayment - rent;
  const text = difference >= 0
    ? `Buying costs ${money(difference)} more per month`
    : `Buying saves ${money(Math.abs(difference))} per month`;

  document.getElementById("rentBuyResult").textContent = text;
}
