
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
  const url = `https://wa.me/${DLCAO_PHONE}?text=${encodeURIComponent(message)}`;
  const popup = window.open(url, "_blank", "noopener");
  if (!popup) window.location.href = url;
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
  if (!menuBtn || !navMenu) return;

  const setMenuState = (isOpen, returnFocus = false) => {
    navMenu.classList.toggle("show", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
    menuBtn.textContent = isOpen ? "×" : "☰";
    if (returnFocus) menuBtn.focus();
  };

  menuBtn.addEventListener("click", () => {
    setMenuState(!navMenu.classList.contains("show"));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("show") &&
      !navMenu.contains(event.target) &&
      !menuBtn.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("show")) {
      setMenuState(false, true);
    }
  });

  const mobileNavigation = window.matchMedia("(max-width: 1050px)");
  mobileNavigation.addEventListener("change", (event) => {
    if (!event.matches) setMenuState(false);
  });

  setMenuState(false);
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


function resetFlipDefaults() {
  const fieldIds = [
    "arv",
    "purchasePrice",
    "repairs",
    "holdingCosts",
    "sellingPercent",
    "profit"
  ];

  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.value = "";
  });

  const values = {
    flipResult: "$0",
    projectedProfit: "$0",
    roiResult: "0.0%",
    rule70Result: "$0"
  };

  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  const status = document.getElementById("dealStatus");
  if (status) {
    status.textContent = "Enter Deal Information";
    status.classList.remove("good", "warn", "bad");
  }

  const advice = document.getElementById("dealAdvice");
  if (advice) {
    advice.textContent =
      "Enter the property numbers above to generate a preliminary deal review.";
  }

  document.getElementById("arv")?.focus();
}

function initializeCalculator() {
  const fieldIds = [
    "arv",
    "purchasePrice",
    "repairs",
    "holdingCosts",
    "sellingPercent",
    "profit"
  ];

  const updateCalculator = () => {
    const hasDealInformation = fieldIds.some((id) => {
      const field = document.getElementById(id);
      return String(field?.value || "").trim() !== "";
    });

    if (hasDealInformation) {
      calcFlip();
    } else {
      resetFlipDefaults();
    }
  };

  fieldIds.forEach((id) => {
    const element = document.getElementById(id);
    element?.addEventListener("input", updateCalculator);
    element?.addEventListener("change", updateCalculator);
  });

  if (document.getElementById("arv")) resetFlipDefaults();
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
  const monthlyRent = numberNearKeywords(text, ["monthly rent", "rent"]) ?? 3500;
  const propertyValue = numberNearKeywords(text, ["property value", "purchase", "price", "value"]) ?? 750000;
  const mortgage = numberNearKeywords(text, ["mortgage", "loan payment", "debt service", "payment"]) ?? 0;
  const taxes = numberNearKeywords(text, ["property taxes", "taxes", "tax"]) ?? Math.round(propertyValue * 0.0125 / 12);
  const insurance = numberNearKeywords(text, ["insurance"]) ?? 175;
  const hoa = numberNearKeywords(text, ["hoa"]) ?? 0;
  const utilities = numberNearKeywords(text, ["utilities"]) ?? 0;
  const vacancy = monthlyRent * 0.05;
  const maintenance = monthlyRent * 0.08;
  const management = monthlyRent * 0.08;
  const monthlyNOI = monthlyRent - vacancy - maintenance - management - taxes - insurance - hoa - utilities;
  const cashFlow = monthlyNOI - mortgage;
  const annualNOI = monthlyNOI * 12;
  const capRate = propertyValue > 0 ? annualNOI / propertyValue * 100 : 0;

  return [
    ...analysisHeader("DLCAO RENTAL PROPERTY ANALYSIS", address),
    `Monthly rent assumption: ${money(monthlyRent)}`,
    `Vacancy reserve (5%): ${money(vacancy)}`,
    `Maintenance reserve (8%): ${money(maintenance)}`,
    `Management reserve (8%): ${money(management)}`,
    `Property taxes monthly: ${money(taxes)}`,
    `Insurance monthly: ${money(insurance)}`,
    `HOA monthly: ${money(hoa)}`,
    `Utilities paid by owner: ${money(utilities)}`,
    `Mortgage / debt service: ${money(mortgage)}`,
    "",
    `Estimated NOI before debt: ${money(monthlyNOI)}/month`,
    `Estimated cash flow after debt: ${money(cashFlow)}/month`,
    `Illustrative cap rate: ${capRate.toFixed(2)}%`,
    "",
    "Confirm actual rent comps, loan payment, taxes, insurance, HOA, utilities, repairs and management before making a decision."
  ].join("\n");
}

function analyzeADU(text, address) {
  const sqft = numberNearKeywords(text, ["square feet", "sqft", "sf"]) ?? 750;
  const costPerSqft = numberNearKeywords(text, ["cost per sqft", "per sqft"]) ?? 300;
  const construction = sqft * costPerSqft;
  const softCosts = construction * 0.15;
  const contingency = construction * 0.10;
  const total = construction + softCosts + contingency;
  const rent = numberNearKeywords(text, ["monthly rent", "rent"]) ?? 2500;
  const annualGrossRent = rent * 12;
  const grossYield = total > 0 ? annualGrossRent / total * 100 : 0;

  return [
    ...analysisHeader("DLCAO ADU PRELIMINARY ANALYSIS", address),
    `Size assumption: ${sqft.toLocaleString()} sq ft`,
    `Construction assumption: ${money(costPerSqft)} per sq ft`,
    `Construction subtotal: ${money(construction)}`,
    `Plans, permits and soft costs (15%): ${money(softCosts)}`,
    `Contingency reserve (10%): ${money(contingency)}`,
    `Illustrative total project budget: ${money(total)}`,
    "",
    `Monthly rent assumption: ${money(rent)}`,
    `Annual gross rent: ${money(annualGrossRent)}`,
    `Illustrative gross yield on project cost: ${grossYield.toFixed(1)}%`,
    "",
    "Confirm zoning, lot dimensions, setbacks, utility capacity, access, parking, fire requirements and city plan-check rules."
  ].join("\n");
}

function analyzeRemodel(text, address) {
  const sqft = numberNearKeywords(text, ["square feet", "sqft", "sf"]) ?? 1000;
  const baseBudget = numberNearKeywords(text, ["budget", "cost"]) ?? Math.round(sqft * 125);
  const contingency = baseBudget * 0.12;
  const total = baseBudget + contingency;
  const timeline = sqft <= 500 ? "4–8 weeks" : sqft <= 1500 ? "8–16 weeks" : "16–28+ weeks";

  return [
    ...analysisHeader("DLCAO REMODEL PRELIMINARY ANALYSIS", address),
    `Scope-size assumption: ${sqft.toLocaleString()} sq ft`,
    `Base budget assumption: ${money(baseBudget)}`,
    `Contingency reserve (12%): ${money(contingency)}`,
    `Illustrative project budget: ${money(total)}`,
    `Illustrative timeline: ${timeline}`,
    "",
    "Likely cost drivers: demolition, structural work, electrical, plumbing, HVAC, permits, finish selections, occupancy and site access.",
    "Confirm photos, exact scope, finish level, permit requirements, timeline and budget before receiving a contractor proposal."
  ].join("\n");
}

function analyzeSale(text, address) {
  const salePrice = numberNearKeywords(text, ["sale price", "sell price", "expected price", "price", "value"]) ?? 750000;
  const repairs = numberNearKeywords(text, ["repairs", "repair", "renovation"]) ?? 15000;
  const mortgagePayoff = numberNearKeywords(text, ["mortgage payoff", "payoff", "loan balance"]) ?? 0;
  const commission = salePrice * 0.05;
  const closingCosts = salePrice * 0.02;
  const estimatedNet = salePrice - repairs - commission - closingCosts - mortgagePayoff;

  return [
    ...analysisHeader("DLCAO SELLER STRATEGY REVIEW", address),
    `Sale price assumption: ${money(salePrice)}`,
    `Pre-sale repairs assumption: ${money(repairs)}`,
    `Commission assumption (5%): ${money(commission)}`,
    `Other closing costs assumption (2%): ${money(closingCosts)}`,
    `Mortgage payoff entered: ${money(mortgagePayoff)}`,
    `Illustrative net proceeds: ${money(estimatedNet)}`,
    "",
    "Compare three strategies: sell as-is, complete targeted improvements before listing, or evaluate rental/investor alternatives.",
    "Confirm current comparable sales, title/liens, taxes, commissions, payoff amount and property condition."
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
  ].join("\n");
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
    "• [address] — Buy",
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


/* DLCAO Phase 2 — Professional Project Review */
const DLCAO_PHASE2 = {
  current: null,
  prompts: {
    remodel: "I want to remodel my property. Address: 18657 Runnymede St, Reseda CA 91335. Area: 1,000 sqft. Budget: $125,000.",
    sell: "I want to sell my property. Address: 18657 Runnymede St, Reseda CA 91335. Expected price: $750,000. Repairs: $15,000. Mortgage payoff: $300,000.",
    buy: "I want to buy a property. Budget: $750,000. Down payment: 20%. Interest rate: 7%. Term: 30 years.",
    flip: "7024 Eton Ave, Canoga Park CA 91303. Fix & Flip. Purchase: $650,000. ARV: $850,000. Repairs: $85,000. Holding costs: $30,000.",
    rental: "18657 Runnymede St, Reseda CA 91335. Rental. Rent: $3,500. Property value: $750,000. Mortgage payment: $2,800. Taxes: $800. Insurance: $175.",
    adu: "18659 Runnymede St, Reseda CA 91335. ADU. Size: 750 sqft. Cost per sqft: $300. Expected rent: $2,500."
  }
};

function p2Money(value) {
  return new Intl.NumberFormat("en-US", {
    style:"currency",
    currency:"USD",
    maximumFractionDigits:0
  }).format(Number(value || 0));
}

function p2Number(text, labels) {
  const lower = text.toLowerCase();
  for (const label of labels) {
    const index = lower.indexOf(label.toLowerCase());
    if (index < 0) continue;
    const segment = text.slice(index + label.length, index + label.length + 80);
    const match = segment.match(/[:\s$]*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(k|m|%)?/i);
    if (!match) continue;
    let value = Number(match[1].replace(/,/g,""));
    const suffix = (match[2] || "").toLowerCase();
    if (suffix === "k") value *= 1000;
    if (suffix === "m") value *= 1000000;
    return value;
  }
  return null;
}

function p2Address(text) {
  const match = text.match(/\b\d{2,6}\s+[A-Za-z0-9.' -]+?(?:Ave(?:nue)?|St(?:reet)?|Rd|Road|Dr(?:ive)?|Blvd|Way|Ct|Court|Ln|Lane)\b(?:[,\s]+[A-Za-z .'-]+)?(?:[,\s]+CA)?(?:[,\s]+\d{5})?/i);
  return match ? match[0].trim() : "Address not provided";
}

function p2ProjectType(text) {
  const lower = text.toLowerCase();
  if (/(fix\s*&?\s*flip|\bflip\b|arv|rehab)/.test(lower)) return "Fix & Flip";
  if (/(rental|rent|cash flow|cap rate)/.test(lower)) return "Rental";
  if (/(adu|garage conversion)/.test(lower)) return "ADU";
  if (/(remodel|renovation|kitchen|bathroom|bath|repair)/.test(lower)) return "Remodel";
  if (/(sell|sale|seller|vender|venta)/.test(lower)) return "Sell";
  if (/(buy|buyer|purchase|comprar)/.test(lower)) return "Buy";
  return "General Project";
}

function p2Reference(text) {
  const now = new Date();
  const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
  let hash = 0;
  for (let i=0; i<text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return `DL-${date}-${String(Math.abs(hash) % 10000).padStart(4,"0")}`;
}

function p2Confidence(provided, required) {
  const count = required.filter(key => provided[key] !== null && provided[key] !== undefined && provided[key] !== "").length;
  const ratio = required.length ? count / required.length : 0;
  if (ratio >= .75) return {label:"High", className:"confidence-high"};
  if (ratio >= .4) return {label:"Medium", className:"confidence-medium"};
  return {label:"Low", className:"confidence-low"};
}

function p2Base(text, type) {
  return {
    type,
    address:p2Address(text),
    reference:p2Reference(text),
    provided:{},
    assumptions:[],
    metrics:[],
    risks:[],
    opportunities:[],
    missing:[],
    summary:"",
    nextStep:"",
    nextStepNote:""
  };
}

function p2AnalyzeFlip(text) {
  const r = p2Base(text, "Fix & Flip");
  const p = r.provided;
  p.purchase = p2Number(text, ["purchase", "offer", "buy price", "price"]);
  p.arv = p2Number(text, ["arv", "after repair value", "resale value"]);
  p.repairs = p2Number(text, ["repairs", "repair", "rehab", "renovation"]);
  p.holding = p2Number(text, ["holding costs", "holding", "carrying costs"]);
  p.targetProfit = p2Number(text, ["target profit", "profit target"]);

  const purchase = p.purchase ?? 650000;
  const arv = p.arv ?? Math.round(purchase * 1.30);
  const repairs = p.repairs ?? Math.round(arv * .10);
  const holding = p.holding ?? Math.round(arv * .035);
  const targetProfit = p.targetProfit ?? 70000;
  const selling = Math.round(arv * .07);
  const maxOffer = arv - repairs - holding - selling - targetProfit;
  const profit = arv - purchase - repairs - holding - selling;
  const invested = purchase + repairs + holding;
  const roi = invested > 0 ? profit / invested * 100 : 0;

  if (p.purchase == null) r.assumptions.push(`Purchase price assumed at ${p2Money(purchase)}.`);
  if (p.arv == null) r.assumptions.push(`ARV assumed at ${p2Money(arv)}; this is not based on live comparable sales.`);
  if (p.repairs == null) r.assumptions.push(`Rehab assumed at ${p2Money(repairs)}.`);
  if (p.holding == null) r.assumptions.push(`Holding and carrying costs assumed at ${p2Money(holding)}.`);
  if (p.targetProfit == null) r.assumptions.push(`Target profit assumed at ${p2Money(targetProfit)}.`);
  r.assumptions.push(`Selling costs modeled at 7% of ARV (${p2Money(selling)}).`);

  r.metrics = [
    ["Purchase / Offer", p2Money(purchase)],
    ["ARV", p2Money(arv)],
    ["Repairs", p2Money(repairs)],
    ["Holding Costs", p2Money(holding)],
    ["Selling Costs", p2Money(selling)],
    ["Maximum Offer", p2Money(maxOffer)],
    ["Projected Profit", p2Money(profit)],
    ["Estimated ROI", `${roi.toFixed(1)}%`],
    ["Deal Signal", profit >= targetProfit && roi >= 15 ? "Strong" : profit > 0 && roi >= 8 ? "Review" : "High Risk"]
  ];
  r.risks = ["Unverified comparable sales and ARV", "Unknown permit or code issues", "Rehab scope could expand after inspection", "Financing and timeline may change holding costs"];
  r.opportunities = ["Negotiate below the modeled maximum offer", "Increase value through targeted improvements", "Reduce timeline and carrying costs", "Confirm multiple exit strategies"];
  r.missing = [
    ...(p.purchase == null ? ["Actual purchase or offer price"] : []),
    ...(p.arv == null ? ["Verified comparable sales and ARV"] : []),
    ...(p.repairs == null ? ["Detailed rehab scope and contractor estimate"] : []),
    "Financing terms", "Project timeline", "Permit and title review"
  ];
  r.summary = `This preliminary model compares acquisition, improvement, carrying and selling costs against the expected resale value. The current assumptions produce an estimated profit of ${p2Money(profit)} and an ROI of ${roi.toFixed(1)}%.`;
  r.nextStep = "Verify ARV and complete a site-specific scope review";
  r.nextStepNote = "DLCAO should review comparable sales, property condition, permit requirements and the rehab scope before an investment decision.";
  r.confidence = p2Confidence(p, ["purchase","arv","repairs","holding"]);
  return r;
}

function p2AnalyzeRental(text) {
  const r = p2Base(text, "Rental");
  const p = r.provided;
  p.rent = p2Number(text, ["monthly rent", "rent"]);
  p.value = p2Number(text, ["property value", "purchase price", "value", "price"]);
  p.mortgage = p2Number(text, ["mortgage payment", "mortgage", "debt service"]);
  p.taxes = p2Number(text, ["property taxes", "taxes", "tax"]);
  p.insurance = p2Number(text, ["insurance"]);
  p.hoa = p2Number(text, ["hoa"]);
  p.utilities = p2Number(text, ["utilities"]);

  const rent = p.rent ?? 3500;
  const value = p.value ?? 750000;
  const mortgage = p.mortgage ?? 0;
  const taxes = p.taxes ?? Math.round(value * .0125 / 12);
  const insurance = p.insurance ?? 175;
  const hoa = p.hoa ?? 0;
  const utilities = p.utilities ?? 0;
  const vacancy = rent * .05;
  const maintenance = rent * .08;
  const management = rent * .08;
  const noi = rent - vacancy - maintenance - management - taxes - insurance - hoa - utilities;
  const cashFlow = noi - mortgage;
  const capRate = value > 0 ? noi * 12 / value * 100 : 0;

  if (p.rent == null) r.assumptions.push(`Monthly rent assumed at ${p2Money(rent)}.`);
  if (p.value == null) r.assumptions.push(`Property value assumed at ${p2Money(value)}.`);
  if (p.mortgage == null) r.assumptions.push("No mortgage payment was provided; cash flow assumes $0 debt service.");
  if (p.taxes == null) r.assumptions.push(`Taxes assumed at ${p2Money(taxes)} per month.`);
  if (p.insurance == null) r.assumptions.push(`Insurance assumed at ${p2Money(insurance)} per month.`);
  r.assumptions.push("Vacancy modeled at 5%; maintenance and management modeled at 8% each.");

  r.metrics = [
    ["Monthly Rent", p2Money(rent)],
    ["Vacancy Reserve", p2Money(vacancy)],
    ["Maintenance", p2Money(maintenance)],
    ["Management", p2Money(management)],
    ["NOI Before Debt", `${p2Money(noi)}/mo`],
    ["Mortgage", `${p2Money(mortgage)}/mo`],
    ["Cash Flow", `${p2Money(cashFlow)}/mo`],
    ["Cap Rate", `${capRate.toFixed(2)}%`],
    ["Annual Gross Rent", p2Money(rent*12)]
  ];
  r.risks = ["Rent may differ from verified local comparables", "Unexpected repairs or turnover", "Vacancy and collection risk", "Insurance, taxes or HOA may increase"];
  r.opportunities = ["Increase rent after targeted improvements", "Reduce owner-paid utilities", "Improve tenant retention", "Evaluate ADU or additional income potential"];
  r.missing = [
    ...(p.rent == null ? ["Verified market rent"] : []),
    ...(p.mortgage == null ? ["Actual mortgage/debt service"] : []),
    ...(p.taxes == null ? ["Actual property taxes"] : []),
    ...(p.insurance == null ? ["Actual insurance"] : []),
    "Repair history", "Lease terms", "Utility responsibility", "Property-management plan"
  ];
  r.summary = `The preliminary rental model estimates NOI before debt at ${p2Money(noi)} per month and cash flow after entered debt service at ${p2Money(cashFlow)} per month.`;
  r.nextStep = "Confirm market rent and all recurring expenses";
  r.nextStepNote = "DLCAO should compare actual rent comps, condition, financing, taxes, insurance and owner-paid expenses.";
  r.confidence = p2Confidence(p, ["rent","value","mortgage","taxes","insurance"]);
  return r;
}

function p2AnalyzeADU(text) {
  const r = p2Base(text, "ADU");
  const p = r.provided;
  p.sqft = p2Number(text, ["square feet", "sqft", "size"]);
  p.costPerSqft = p2Number(text, ["cost per sqft", "per sqft"]);
  p.rent = p2Number(text, ["expected rent", "monthly rent", "rent"]);
  p.budget = p2Number(text, ["budget"]);

  const sqft = p.sqft ?? 750;
  const cpsf = p.costPerSqft ?? 300;
  const construction = p.budget ?? sqft * cpsf;
  const soft = construction * .15;
  const contingency = construction * .10;
  const total = construction + soft + contingency;
  const rent = p.rent ?? 2500;
  const grossYield = total > 0 ? rent*12/total*100 : 0;

  if (p.sqft == null) r.assumptions.push(`ADU size assumed at ${sqft} sq ft.`);
  if (p.costPerSqft == null && p.budget == null) r.assumptions.push(`Construction assumed at ${p2Money(cpsf)} per sq ft.`);
  if (p.rent == null) r.assumptions.push(`Monthly rent assumed at ${p2Money(rent)}.`);
  r.assumptions.push("Soft costs modeled at 15% and contingency at 10%.");

  r.metrics = [
    ["Size", `${sqft.toLocaleString()} sq ft`],
    ["Construction", p2Money(construction)],
    ["Plans / Soft Costs", p2Money(soft)],
    ["Contingency", p2Money(contingency)],
    ["Total Budget", p2Money(total)],
    ["Expected Rent", `${p2Money(rent)}/mo`],
    ["Annual Gross Rent", p2Money(rent*12)],
    ["Gross Yield", `${grossYield.toFixed(1)}%`]
  ];
  r.risks = ["Zoning or setback restrictions", "Utility capacity and connection cost", "Site access or grading complexity", "Plan-check and permitting delays"];
  r.opportunities = ["Create new rental income", "Increase property utility and value", "House family members or staff", "Improve long-term property flexibility"];
  r.missing = [
    ...(p.sqft == null ? ["Desired ADU size"] : []),
    "Lot dimensions and zoning", "Attached or detached design", "Utility locations", "Site photographs", "Finish level", "Verified rental comparables"
  ];
  r.summary = `The preliminary ADU model estimates a total project budget of ${p2Money(total)} and annual gross rent of ${p2Money(rent*12)} under the current assumptions.`;
  r.nextStep = "Complete a zoning and site-feasibility review";
  r.nextStepNote = "DLCAO should review lot dimensions, access, utilities, desired size, finish level and city requirements.";
  r.confidence = p2Confidence(p, ["sqft","costPerSqft","rent"]);
  return r;
}

function p2AnalyzeRemodel(text) {
  const r = p2Base(text, "Remodel");
  const p = r.provided;
  p.sqft = p2Number(text, ["square feet", "sqft", "area"]);
  p.budget = p2Number(text, ["budget", "cost"]);
  const sqft = p.sqft ?? 1000;
  const base = p.budget ?? sqft * 125;
  const contingency = base * .12;
  const total = base + contingency;
  const timeline = sqft <= 500 ? "4–8 weeks" : sqft <= 1500 ? "8–16 weeks" : "16–28+ weeks";

  if (p.sqft == null) r.assumptions.push(`Scope size assumed at ${sqft} sq ft.`);
  if (p.budget == null) r.assumptions.push(`Base construction budget assumed at ${p2Money(base)}.`);
  r.assumptions.push("Contingency modeled at 12%.");

  r.metrics = [
    ["Scope Size", `${sqft.toLocaleString()} sq ft`],
    ["Base Budget", p2Money(base)],
    ["Contingency", p2Money(contingency)],
    ["Total Budget", p2Money(total)],
    ["Timeline", timeline]
  ];
  r.risks = ["Hidden damage after demolition", "Structural or code upgrades", "Material lead times", "Scope changes during construction"];
  r.opportunities = ["Improve functionality", "Increase market appeal", "Correct deferred maintenance", "Coordinate value-focused finish selections"];
  r.missing = [
    ...(p.sqft == null ? ["Approximate project area"] : []),
    "Rooms and scope", "Photos and existing conditions", "Finish level", "Permit requirements", "Desired completion date"
  ];
  r.summary = `The preliminary remodel model estimates a total working budget of ${p2Money(total)} and an illustrative timeline of ${timeline}.`;
  r.nextStep = "Schedule a scope and site-condition review";
  r.nextStepNote = "DLCAO should inspect the property, confirm dimensions, define finishes and determine permit requirements.";
  r.confidence = p2Confidence(p, ["sqft","budget"]);
  return r;
}

function p2AnalyzeSell(text) {
  const r = p2Base(text, "Sell");
  const p = r.provided;
  p.price = p2Number(text, ["expected price", "sale price", "sell price", "value"]);
  p.repairs = p2Number(text, ["repairs", "repair", "renovation"]);
  p.payoff = p2Number(text, ["mortgage payoff", "payoff", "loan balance"]);

  const price = p.price ?? 750000;
  const repairs = p.repairs ?? 15000;
  const payoff = p.payoff ?? 0;
  const commission = price * .05;
  const closing = price * .02;
  const net = price - repairs - commission - closing - payoff;

  if (p.price == null) r.assumptions.push(`Sale price assumed at ${p2Money(price)}.`);
  if (p.repairs == null) r.assumptions.push(`Pre-sale repairs assumed at ${p2Money(repairs)}.`);
  if (p.payoff == null) r.assumptions.push("Mortgage payoff assumed at $0.");
  r.assumptions.push("Commission modeled at 5% and other closing costs at 2%.");

  r.metrics = [
    ["Sale Price", p2Money(price)],
    ["Repairs", p2Money(repairs)],
    ["Commission", p2Money(commission)],
    ["Closing Costs", p2Money(closing)],
    ["Mortgage Payoff", p2Money(payoff)],
    ["Estimated Net", p2Money(net)]
  ];
  r.risks = ["Sale price not supported by current verified comparables", "Repairs may not produce equal value", "Title, tax or payoff adjustments", "Market timing and carrying costs"];
  r.opportunities = ["Compare as-is and improved-sale strategies", "Complete only high-return repairs", "Evaluate rental or investor alternatives", "Improve presentation and buyer confidence"];
  r.missing = [
    ...(p.price == null ? ["Verified comparable sales"] : []),
    "Property condition", "Title and lien information", "Actual commission agreement", "Taxes and escrow adjustments", "Desired sale timeline"
  ];
  r.summary = `The preliminary seller model estimates net proceeds of ${p2Money(net)} before income-tax considerations under the entered and assumed costs.`;
  r.nextStep = "Compare as-is, improved-sale and rental strategies";
  r.nextStepNote = "DLCAO should review property condition, current comparables, payoff, timeline and the highest-return repairs.";
  r.confidence = p2Confidence(p, ["price","repairs","payoff"]);
  return r;
}

function p2AnalyzeBuy(text) {
  const r = p2Base(text, "Buy");
  const p = r.provided;
  p.price = p2Number(text, ["purchase price", "budget", "price"]);
  p.down = p2Number(text, ["down payment"]);
  p.rate = p2Number(text, ["interest rate", "rate"]);
  p.term = p2Number(text, ["term"]);

  const price = p.price ?? 750000;
  let down = p.down ?? 20;
  if (down <= 100) down = price * down / 100;
  const rate = p.rate ?? 7;
  const term = p.term ?? 30;
  const loan = Math.max(price-down,0);
  const monthlyRate = rate/100/12;
  const count = term*12;
  const pi = monthlyRate > 0 ? loan*monthlyRate*Math.pow(1+monthlyRate,count)/(Math.pow(1+monthlyRate,count)-1) : loan/count;
  const taxes = price*.0125/12;
  const insurance = 175;
  const closing = price*.03;
  const payment = pi+taxes+insurance;

  if (p.price == null) r.assumptions.push(`Purchase budget assumed at ${p2Money(price)}.`);
  if (p.down == null) r.assumptions.push("Down payment assumed at 20%.");
  if (p.rate == null) r.assumptions.push("Interest rate assumed at 7%.");
  if (p.term == null) r.assumptions.push("Loan term assumed at 30 years.");
  r.assumptions.push("Taxes assumed at 1.25% annually, insurance at $175/month and closing costs at 3%.");

  r.metrics = [
    ["Purchase Price", p2Money(price)],
    ["Down Payment", p2Money(down)],
    ["Loan Amount", p2Money(loan)],
    ["Interest Rate", `${rate.toFixed(2)}%`],
    ["Principal + Interest", `${p2Money(pi)}/mo`],
    ["Taxes + Insurance", `${p2Money(taxes+insurance)}/mo`],
    ["Estimated Payment", `${p2Money(payment)}/mo`],
    ["Closing Costs", p2Money(closing)],
    ["Cash Needed", p2Money(down+closing)]
  ];
  r.risks = ["Not a lender quote or approval", "Taxes, insurance and HOA can vary", "Repairs and reserves may increase cash needed", "Rate or loan program may change"];
  r.opportunities = ["Compare financing programs", "Negotiate credits or repairs", "Evaluate rental or ADU potential", "Match property condition to available reserves"];
  r.missing = [
    "Credit and income qualification", "Actual loan program", "HOA and insurance quote", "Property condition", "Repair budget", "Desired monthly payment"
  ];
  r.summary = `The preliminary buyer model estimates a monthly payment of ${p2Money(payment)} and total initial cash of approximately ${p2Money(down+closing)} before reserves and repairs.`;
  r.nextStep = "Confirm financing and property-specific carrying costs";
  r.nextStepNote = "Work with licensed financing and real-estate professionals to verify eligibility, payment, taxes, insurance, HOA and closing costs.";
  r.confidence = p2Confidence(p, ["price","down","rate","term"]);
  return r;
}

function p2Analyze(text) {
  const type = p2ProjectType(text);
  if (type === "Fix & Flip") return p2AnalyzeFlip(text);
  if (type === "Rental") return p2AnalyzeRental(text);
  if (type === "ADU") return p2AnalyzeADU(text);
  if (type === "Remodel") return p2AnalyzeRemodel(text);
  if (type === "Sell") return p2AnalyzeSell(text);
  if (type === "Buy") return p2AnalyzeBuy(text);
  const r = p2Base(text, "General Project");
  r.confidence = {label:"Low",className:"confidence-low"};
  r.summary = "DLCAO needs one clear goal to create a useful project review.";
  r.assumptions = ["No project type was detected."];
  r.metrics = [];
  r.risks = ["Insufficient project information"];
  r.opportunities = ["Select Remodel, Sell, Buy, Fix & Flip, Rental or ADU"];
  r.missing = ["Project type", "Property address", "Known budget or financial inputs"];
  r.nextStep = "Select a project type and add an address";
  r.nextStepNote = "Use one of the six project buttons to start.";
  return r;
}

function p2Label(key) {
  const labels = {
    purchase:"Purchase / Offer", arv:"ARV", repairs:"Repairs / Rehab", holding:"Holding Costs", targetProfit:"Target Profit",
    rent:"Monthly Rent", value:"Property Value", mortgage:"Mortgage / Debt Service", taxes:"Taxes", insurance:"Insurance", hoa:"HOA", utilities:"Utilities",
    sqft:"Square Footage", costPerSqft:"Cost per Sq Ft", budget:"Budget", price:"Price / Budget", payoff:"Mortgage Payoff", down:"Down Payment", rate:"Interest Rate", term:"Loan Term"
  };
  return labels[key] || key;
}

function p2DisplayValue(key, value) {
  if (value == null) return "";
  if (key === "rate") return `${value}%`;
  if (key === "term") return `${value} years`;
  if (key === "sqft") return `${Number(value).toLocaleString()} sq ft`;
  if (key === "down" && value <= 100) return `${value}%`;
  return p2Money(value);
}

function p2List(containerId, items, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const values = items && items.length ? items : [emptyText];
  values.forEach(item => {
    const div = document.createElement("div");
    div.textContent = item;
    container.appendChild(div);
  });
}

function p2Render(result) {
  DLCAO_PHASE2.current = result;
  document.getElementById("reportEmpty").hidden = true;
  document.getElementById("reportContent").hidden = false;
  document.getElementById("reportTitle").textContent = `${result.type} Project Review`;
  document.getElementById("projectReference").textContent = result.reference;
  document.getElementById("reportProjectType").textContent = result.type;
  document.getElementById("reportAddress").textContent = result.address;
  const confidence = document.getElementById("reportConfidence");
  confidence.textContent = result.confidence.label;
  confidence.className = result.confidence.className;
  document.getElementById("reportExecutiveSummary").textContent = result.summary;

  const provided = Object.entries(result.provided)
    .filter(([,value]) => value !== null && value !== undefined)
    .map(([key,value]) => `${p2Label(key)}: ${p2DisplayValue(key,value)}`);
  p2List("reportProvidedData", provided, "No financial inputs were detected.");
  p2List("reportAssumptions", result.assumptions, "No assumptions were required.");
  p2List("reportRisks", result.risks, "No risks listed.");
  p2List("reportOpportunities", result.opportunities, "No opportunities listed.");
  p2List("reportMissing", result.missing, "No additional information requested.");

  const metrics = document.getElementById("reportMetrics");
  metrics.innerHTML = "";
  result.metrics.forEach(([label,value]) => {
    const card = document.createElement("div");
    card.className = "report-metric";
    const span = document.createElement("span");
    span.textContent = label;
    const strong = document.createElement("strong");
    strong.textContent = value;
    card.append(span,strong);
    metrics.appendChild(card);
  });

  document.getElementById("reportNextStep").textContent = result.nextStep;
  document.getElementById("reportNextStepNote").textContent = result.nextStepNote;
  document.getElementById("projectReport").scrollIntoView({behavior:"smooth",block:"start"});
}

function p2ProjectMessage() {
  const r = DLCAO_PHASE2.current;
  if (!r) return "";
  const name = document.getElementById("leadName")?.value.trim() || "Not provided";
  const phone = document.getElementById("leadPhone")?.value.trim() || "Not provided";
  const email = document.getElementById("leadEmail")?.value.trim() || "Not provided";
  const metrics = r.metrics.map(([label,value]) => `${label}: ${value}`).join("\n");
  const missing = r.missing.map(x => `- ${x}`).join("\n");
  return [
    "DLCAO Project Review",
    `Reference: ${r.reference}`,
    `Project: ${r.type}`,
    `Address: ${r.address}`,
    `Confidence: ${r.confidence.label}`,
    "",
    `Client: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    "",
    "Executive Summary:",
    r.summary,
    "",
    "Preliminary Metrics:",
    metrics || "No metrics available.",
    "",
    "Information Needed:",
    missing || "None listed.",
    "",
    `Recommended Next Step: ${r.nextStep}`,
    r.nextStepNote
  ].join("\n");
}

function initializePhase2Analysis() {
  const input = document.getElementById("analysisInput");
  const run = document.getElementById("runAnalysisBtn");
  const clear = document.getElementById("clearAnalysisBtn");
  const send = document.getElementById("sendProjectBtn");

  document.querySelectorAll("[data-analysis-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      input.value = DLCAO_PHASE2.prompts[button.dataset.analysisPrompt] || "";
      input.focus();
    });
  });

  run?.addEventListener("click", () => {
    const text = input?.value.trim();
    if (!text) {
      input?.focus();
      return;
    }
    p2Render(p2Analyze(text));
  });

  clear?.addEventListener("click", () => {
    if (input) input.value = "";
    DLCAO_PHASE2.current = null;
    document.getElementById("reportContent").hidden = true;
    document.getElementById("reportEmpty").hidden = false;
    ["leadName","leadPhone","leadEmail"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  });

  input?.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") run?.click();
  });

  send?.addEventListener("click", () => {
    if (!DLCAO_PHASE2.current) return;
    const phone = document.getElementById("leadPhone")?.value.trim();
    if (!phone) {
      document.getElementById("leadPhone")?.focus();
      return;
    }
    const message = p2ProjectMessage();
    const url = `https://wa.me/17473674447?text=${encodeURIComponent(message)}`;
    const popup = window.open(url,"_blank","noopener");
    if (!popup) window.location.href = url;
  });
}

document.addEventListener("DOMContentLoaded", initializePhase2Analysis);


function initializeServiceAreaSearch() {
  const input = document.getElementById("serviceAreaSearch");
  const grid = document.getElementById("serviceAreaGrid");
  if (!input || !grid) return;

  const cards = Array.from(grid.querySelectorAll("a"));

  const filterAreas = () => {
    const query = input.value.trim().toLocaleLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const match = card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      if (match) visibleCount += 1;
    });

    let message = document.getElementById("serviceAreaNoResults");
    if (!message) {
      message = document.createElement("p");
      message.id = "serviceAreaNoResults";
      message.setAttribute("role", "status");
      message.style.marginTop = "16px";
      message.style.fontWeight = "800";
      message.style.color = "#76500f";
      grid.insertAdjacentElement("afterend", message);
    }

    message.textContent =
      query && visibleCount === 0
        ? "No exact match was found. Contact DLCAO to confirm service availability."
        : "";
  };

  input.addEventListener("input", filterAreas);
  input.addEventListener("search", filterAreas);
  filterAreas();
}

function initializeOperationsDashboard() {
  const cards = Array.from(
    document.querySelectorAll("#dashboard-preview .dashboard-card > div")
  );
  if (!cards.length) return;

  const destinations = [
    { selector: "#estimate", label: "Open new lead intake" },
    { selector: "#projects", label: "Open project showcase" },
    { selector: "#investor-access, #investors, #investor-center", label: "Open investor center" },
    { selector: "#platform, #contact", label: "Open automation and operations information" }
  ];

  cards.forEach((card, index) => {
    const destination = destinations[index];
    if (!destination) return;

    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", destination.label);
    card.style.cursor = "pointer";

    const activate = () => {
      const target = document.querySelector(destination.selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    card.addEventListener("click", activate);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeServiceAreaSearch();
  initializeOperationsDashboard();
});
