const COMPANY_PHONE = "17473674447";
const COMPANY_EMAIL = "DLCAO@mail.com";

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => navMenu.classList.toggle("show"));

function money(value){
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formMessage(form){
  const data = new FormData(form);
  return [...data.entries()]
    .filter(([key, value]) => String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

function sendWhatsApp(message){
  window.open(`https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(message)}`, "_blank");
}

function emailForm(subject, message){
  window.location.href = `mailto:${COMPANY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

["heroForm", "buyerForm", "valuationForm"].forEach(id => {
  document.getElementById(id)?.addEventListener("submit", function(e){
    e.preventDefault();
    sendWhatsApp(`Hello DLCAO Belles Elites,\n\n${formMessage(this)}`);
  });
});

function sendAppointmentWhatsApp(){
  const form = document.getElementById("appointmentForm");
  sendWhatsApp("Hello DLCAO Belles Elites, I want to book a consultation:\n\n" + formMessage(form));
}

function sendAppointmentEmail(){
  const form = document.getElementById("appointmentForm");
  emailForm("DLCAO Consultation Request", "Hello DLCAO,\n\nI want to book a consultation:\n\n" + formMessage(form));
}

function calcFlip(){
  const arv = Number(document.getElementById("arv").value);
  const repairs = Number(document.getElementById("repairs").value);
  const profit = Number(document.getElementById("profit").value);
  const offer = (arv * 0.70) - repairs - profit;
  document.getElementById("flipResult").textContent = `${money(offer)} estimated max offer`;
}

function calcMortgage(){
  const price = Number(document.getElementById("homePrice").value);
  const down = Number(document.getElementById("downPayment").value);
  const rate = Number(document.getElementById("rate").value) / 100 / 12;
  const years = Number(document.getElementById("years").value);
  const n = years * 12;
  const principal = price - down;
  const payment = principal * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  document.getElementById("mortgageResult").textContent = `${money(payment)} estimated principal & interest`;
}

function calcAffordability(){
  const income = Number(document.getElementById("income").value);
  const debts = Number(document.getElementById("debts").value);
  const dti = Number(document.getElementById("dti").value) / 100;
  const maxPayment = (income * dti) - debts;
  document.getElementById("affordResult").textContent = `${money(maxPayment)} estimated max monthly payment`;
}
