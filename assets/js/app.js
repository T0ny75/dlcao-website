
"use strict";

const DLCAO_PHONE = "17473674447";
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function money(value) {
  return USD.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

function openWhatsApp(message) {
  window.open(
    `https://wa.me/${DLCAO_PHONE}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener"
  );
}

function formMessage(form, heading = "DLCAO Request") {
  const data = new FormData(form);
  const lines = [heading];
  for (const [key, rawValue] of data.entries()) {
    const value = String(rawValue).trim();
    if (value) lines.push(`${key}: ${value}`);
  }
  return lines.join("\n");
}

function initializeNavigation() {
  const menuBtn = document.getElementById("menuBtn");
  const navMenu = document.getElementById("navMenu");
  menuBtn?.addEventListener("click", () => navMenu?.classList.toggle("show"));
  document.querySelectorAll("#navMenu a").forEach((link) => {
    link.addEventListener("click", () => navMenu?.classList.remove("show"));
  });
}

function initializeForms() {
  const forms = {
    estimateForm: "DLCAO Estimate Request",
    buyForm: "DLCAO Buyer Request",
    contactForm: "DLCAO Contact Request",
    propertyForm: "DLCAO Property Request"
  };
  Object.entries(forms).forEach(([id, heading]) => {
    document.getElementById(id)?.addEventListener("submit", (event) => {
      event.preventDefault();
      openWhatsApp(formMessage(event.currentTarget, heading));
    });
  });
}

function calcFlip() {
  const arv = Number(document.getElementById("arv")?.value || 0);
  const purchase = Number(document.getElementById("purchasePrice")?.value || 0);
  const repairs = Number(document.getElementById("repairs")?.value || 0);
  const holding = Number(document.getElementById("holdingCosts")?.value || 0);
  const sellingRate = Number(document.getElementById("sellingPercent")?.value || 0) / 100;
  const targetProfit = Number(document.getElementById("profit")?.value || 0);

  const sellingCosts = arv * sellingRate;
  const maxOffer = arv - repairs - holding - sellingCosts - targetProfit;
  const projectedProfit = arv - purchase - repairs - holding - sellingCosts;
  const totalInvestment = purchase + repairs + holding;
  const roi = totalInvestment > 0 ? (projectedProfit / totalInvestment) * 100 : 0;
  const rule70 = arv * 0.70 - repairs;

  const set = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };
  set("flipResult", money(maxOffer));
  set("projectedProfit", money(projectedProfit));
  set("roiResult", `${roi.toFixed(1)}%`);
  set("rule70Result", money(rule70));

  const status = document.getElementById("dealStatus");
  const advice = document.getElementById("dealAdvice");
  if (!status) return;

  status.classList.remove("good", "warn", "bad");
  if (projectedProfit >= targetProfit && roi >= 15) {
    status.textContent = "Strong Deal";
    status.classList.add("good");
    if (advice) advice.textContent =
      "The model meets the selected profit target and estimated ROI threshold. Verify comparable sales, permits, financing and scope before proceeding.";
  } else if (projectedProfit > 0 && roi >= 8) {
    status.textContent = "Review / Negotiate";
    status.classList.add("warn");
    if (advice) advice.textContent =
      "The deal is positive but the margin may be thin. Negotiate the purchase price or confirm a stronger ARV.";
  } else {
    status.textContent = "High Risk";
    status.classList.add("bad");
    if (advice) advice.textContent =
      "The current assumptions do not leave enough margin. Reduce cost, increase verified value, or consider passing.";
  }
}

function initializeCalculator() {
  ["arv", "purchasePrice", "repairs", "holdingCosts", "sellingPercent", "profit"]
    .forEach((id) => {
      const element = document.getElementById(id);
      element?.addEventListener("input", calcFlip);
      element?.addEventListener("change", calcFlip);
    });
  if (document.getElementById("arv")) calcFlip();
}

function numberNearKeywords(text, keywords) {
  const lower = text.toLowerCase();
  for (const keyword of keywords) {
    const position = lower.indexOf(keyword);
    if (position === -1) continue;
    const segment = lower.slice(position, position + 90);
    const match = segment.match(/\$?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(k|m)?/i);
    if (!match) continue;
    let value = Number(match[1].replace(/,/g, ""));
    if (match[2]?.toLowerCase() === "k") value *= 1_000;
    if (match[2]?.toLowerCase() === "m") value *= 1_000_000;
    return value;
  }
  return null;
}

function extractAddress(text) {
  const cleaned = text
    .replace(/\b(fix\s*&?\s*flip|rental|rent|adu|remodel|sell|buy|construction)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const match = cleaned.match(
    /\b\d{2,6}\s+[A-Za-z0-9.' -]+?(?:Ave(?:nue)?|St(?:reet)?|Rd|Road|Dr(?:ive)?|Blvd|Way|Ct|Court|Ln|Lane)\b(?:[,\s]+[A-Za-z .'-]+)?(?:[,\s]+CA)?(?:[,\s]+\d{5})?/i
  );
  return match?.[0]?.trim() || cleaned.slice(0, 100) || "Address not confirmed";
}

function analysisHeader(title, address) {
  return [
    title,
    "",
    `Property: ${address}`,
    "",
    "PRELIMINARY MODEL — figures below are illustrative assumptions unless the client supplied them. They are not live MLS, Zillow, appraisal, permit or lending data.",
    ""
  ];
}

function analyzeFlip(text, address) {
  const purchase = numberNearKeywords(text, ["purchase", "buy", "offer", "price", "precio"]) ?? 650_000;
  const arv = numberNearKeywords(text, ["arv", "after repair", "resale", "value"]) ?? Math.round(purchase * 1.30);
  const repairs = numberNearKeywords(text, ["repair", "repairs", "rehab", "renovation"]) ?? Math.round(arv * 0.10);
  const holding = numberNearKeywords(text, ["holding", "closing", "carry"]) ?? Math.round(arv * 0.035);
  const selling = Math.round(arv * 0.07);
  const target = numberNearKeywords(text, ["target profit", "profit"]) ?? 70_000;
  const maxOffer = arv - repairs - holding - selling - target;
  const projectedProfit = arv - purchase - repairs - holding - selling;
  const invested = purchase + repairs + holding;
  const roi = invested > 0 ? projectedProfit / invested * 100 : 0;
  const rating = projectedProfit >= target && roi >= 15
    ? "STRONG DEAL"
    : projectedProfit > 0 && roi >= 8
      ? "REVIEW / NEGOTIATE"
      : "HIGH RISK";

  return [
    ...analysisHeader("DLCAO FIX & FLIP ANALYSIS", address),
    `Purchase / offer assumption: ${money(purchase)}`,
    `ARV assumption: ${money(arv)}`,
    `Repairs / rehab: ${money(repairs)}`,
    `Holding + closing: ${money(holding)}`,
    `Selling costs (7%): ${money(selling)}`,
    `Target profit: ${money(target)}`,
    "",
    `Maximum allowable offer: ${money(maxOffer)}`,
    `Projected profit: ${money(projectedProfit)}`,
    `Estimated ROI: ${roi.toFixed(1)}%`,
    `Rating: ${rating}`,
    "",
    "Confirm these inputs for a property-specific review: purchase price, verified comparable ARV, repair scope, financing, timeline and permits."
  ].join("\n");
}

function analyzeRental(text, address) {
  const monthlyRent = numberNearKeywords(text, ["monthly rent", "rent"]) ?? 3_500;
  const propertyValue = numberNearKeywords(text, ["property value", "purchase", "price", "value"]) ?? 750_000;
  const vacancyRate = 0.05;
  const operatingRate = 0.30;
  const grossAnnual = monthlyRent * 12;
  const vacancy = grossAnnual * vacancyRate;
  const operating = grossAnnual * operatingRate;
  const noi = grossAnnual - vacancy - operating;
  const capRate = propertyValue > 0 ? noi / propertyValue * 100 : 0;

  return [
    ...analysisHeader("DLCAO RENTAL PROPERTY ANALYSIS", address),
    `Monthly rent assumption: ${money(monthlyRent)}`,
    `Annual gross rent: ${money(grossAnnual)}`,
    `Vacancy allowance (5%): ${money(vacancy)}`,
    `Operating expenses (30%): ${money(operating)}`,
    `Estimated NOI before debt service: ${money(noi)}`,
    `Property value assumption: ${money(propertyValue)}`,
    `Illustrative cap rate: ${capRate.toFixed(2)}%`,
    "",
    "Cash flow cannot be finalized without mortgage payment, taxes, insurance, HOA, utilities, maintenance and management costs.",
    "Confirm actual rent/comps and all expenses before making an investment or listing decision."
  ].join("\n");
}

function analyzeADU(text, address) {
  const budget = numberNearKeywords(text, ["budget", "cost"]) ?? 220_000;
  return [
    ...analysisHeader("DLCAO ADU PRELIMINARY REVIEW", address),
    `Planning budget assumption: ${money(budget)}`,
    "Illustrative construction range: $120,000–$350,000+",
    "Typical variables: size, attached/detached design, site access, utilities, grading, plans, permits and finish level.",
    "",
    "Required verification: zoning, lot dimensions, setbacks, utility capacity, fire access, parking rules and city plan-check requirements.",
    "Next step: send property address, desired square footage, photos and budget to DLCAO."
  ].join("\n");
}

function analyzeRemodel(text, address) {
  return [
    ...analysisHeader("DLCAO REMODEL PRELIMINARY REVIEW", address),
    "Illustrative ranges:",
    "Bathroom: $12,000–$35,000+",
    "Kitchen: $25,000–$75,000+",
    "Full renovation: scope-dependent",
    "",
    "Major cost drivers: demolition, structural changes, electrical, plumbing, HVAC, permits, finish selections and access.",
    "Send photos, approximate square footage, desired finish level, timeline and budget for a closer review."
  ].join("\n");
}

function analyzeSale(text, address) {
  return [
    ...analysisHeader("DLCAO SALE STRATEGY REVIEW", address),
    "DLCAO can evaluate:",
    "• As-is sale versus renovation before listing",
    "• Repair priorities and likely buyer objections",
    "• Rental or investor alternatives",
    "• Timeline, carrying cost and preparation strategy",
    "",
    "A market value or net-proceeds estimate requires current comparable sales, liens/mortgage payoff, commissions, closing costs and confirmed property condition."
  ].join("\n");
}


function analyzeBuy(text, address) {
  const price = numberNearKeywords(text, ["purchase price", "price", "budget"]) ?? 750000;
  const downPercent = numberNearKeywords(text, ["down percent", "down payment percent"]) ?? 20;
  const downPayment = numberNearKeywords(text, ["down payment"]) ?? price * downPercent / 100;
  const loan = Math.max(price - downPayment, 0);
  const rate = numberNearKeywords(text, ["interest rate", "rate"]) ?? 7;
  const term = numberNearKeywords(text, ["term"]) ?? 30;
  const monthlyRate = rate / 100 / 12;
  const count = term * 12;
  const pi = monthlyRate > 0 ? loan * monthlyRate * Math.pow(1 + monthlyRate, count) / (Math.pow(1 + monthlyRate, count) - 1) : loan / count;
  const taxes = price * 0.0125 / 12;
  const insurance = 175;
  const closing = price * 0.03;
  const payment = pi + taxes + insurance;
  return [
    ...analysisHeader("DLCAO BUYER PRELIMINARY REVIEW", address),
    `Purchase price assumption: ${money(price)}`,
    `Down payment: ${money(downPayment)}`,
    `Estimated loan: ${money(loan)}`,
    `Interest rate assumption: ${rate.toFixed(2)}%`,
    `Term: ${term} years`,
    `Principal + interest: ${money(pi)}/month`,
    `Taxes + insurance assumption: ${money(taxes + insurance)}/month`,
    `Illustrative payment: ${money(payment)}/month`,
    `Closing costs assumption (3%): ${money(closing)}`,
    `Estimated cash needed: ${money(downPayment + closing)}`,
    "",
    "This is not a loan quote. Confirm credit, income, reserves, HOA, lender fees, taxes and insurance with licensed professionals."
  ].join("\\n");
}

function analyzeGeneral(text) {
  const address = extractAddress(text);
  const lower = text.toLowerCase();
  if (/(fix|flip|arv|rehab)/.test(lower)) return analyzeFlip(text, address);
  if (/(rental|rent|cash flow|cap rate)/.test(lower)) return analyzeRental(text, address);
  if (/(adu|garage conversion)/.test(lower)) return analyzeADU(text, address);
  if (/(remodel|kitchen|bath|repair|renovation)/.test(lower)) return analyzeRemodel(text, address);
  if (/(sell|sale|vender|venta)/.test(lower)) return analyzeSale(text, address);
  if (/(buy|purchase|buyer|comprar)/.test(lower)) return analyzeBuy(text, address);
  return [
    "DLCAO PROPERTY ASSISTANT",
    "",
    "Enter an address and a goal such as:",
    "• 7024 Eton Ave, Canoga Park — Fix & Flip",
    "• 18657 Runnymede St, Reseda — Rental",
    "• [address] — ADU",
    "• [address] — Remodel",
    "• [address] — Sell",
    "",
    "Add known numbers—purchase price, ARV, repairs, rent or budget—for a more useful preliminary model."
  ].join("\n");
}

let lastAIInput = "";
let lastAIAnalysis = "";

function addAIMessage(text, type = "bot") {
  const windowElement = document.getElementById("chatWindow");
  if (!windowElement) return;
  const message = document.createElement("div");
  message.className = type === "user" ? "user-msg" : "bot-msg";
  message.textContent = text;
  windowElement.appendChild(message);
  windowElement.scrollTop = windowElement.scrollHeight;
}

function sendAIMessage() {
  const input = document.getElementById("aiInput");
  const text = input?.value?.trim();
  if (!text) return;
  lastAIInput = text;
  addAIMessage(text, "user");
  input.value = "";
  lastAIAnalysis = analyzeGeneral(text);
  window.setTimeout(() => addAIMessage(lastAIAnalysis, "bot"), 250);
}

function sendAIReport() {
  const message = lastAIAnalysis
    ? `DLCAO AI Lead\n\nClient input:\n${lastAIInput}\n\n${lastAIAnalysis}`
    : "DLCAO AI Lead\n\nThe client opened the analyzer but has not entered a request.";
  openWhatsApp(message);
}

function initializeAI() {
  const prompts = {
    adu: "18659 Runnymede St, Reseda CA 91335 — ADU",
    remodel: "I need a remodel estimate at my property",
    sell: "I want to sell my property, expected price 750k, repairs 15k",
    buy: "I want to buy a property, budget 750k, down payment 20%, rate 7%",
    flip: "7024 Eton Ave, Canoga Park CA 91303 — Fix & Flip",
    rental: "18657 Runnymede St, Reseda CA 91335 — Rental"
  };
  document.querySelectorAll("[data-flow]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById("aiInput");
      if (input) input.value = prompts[button.dataset.flow] || "";
      sendAIMessage();
    });
  });
  document.querySelectorAll("[data-ai-jump]").forEach((link) => {
    link.addEventListener("click", () => {
      const input = document.getElementById("aiInput");
      if (input) input.value = prompts[link.dataset.aiJump] || "";
      window.setTimeout(() => input?.focus(), 300);
    });
  });

  document.getElementById("aiInput")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendAIMessage();
    }
  });
}

function submitSmartEstimate(event) {
  event.preventDefault();
  const get = (id) => document.getElementById(id)?.value?.trim() || "Not provided";
  openWhatsApp([
    "DLCAO Smart Estimate Request",
    `Project: ${get("projectType")}`,
    `City: ${get("projectCity")}`,
    `Budget: ${get("budgetRange")}`,
    `Timeline: ${get("timeline")}`,
    `Address: ${get("propertyAddress")}`,
    `Contact: ${get("contactInfo")}`,
    `Details: ${get("projectDetails")}`
  ].join("\n"));
}

function initializeReveals() {
  const elements = document.querySelectorAll(".reveal-section, [data-reveal='true']");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("revealed"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach((element) => observer.observe(element));
}

document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  initializeForms();
  initializeCalculator();
  initializeAI();
  initializeReveals();
});
