
"use strict";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

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

function initializeEntryPosition() {
  if (window.location.hash) return;

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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

  document.getElementById("smartEstimateForm")?.addEventListener("submit", submitSmartEstimate);
}

function initializeCapitalPartnerApplication() {
  const form = document.getElementById("capitalPartnerForm");
  const status = document.getElementById("partnerApplicationStatus");
  if (!form || !status) return;

  const freeEmailDomains = new Set([
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"
  ]);
  const requiredFields = Array.from(form.querySelectorAll("[required]"));

  const updateStatus = () => {
    const completed = requiredFields.filter((field) => {
      if (field.type === "checkbox") return field.checked;
      return String(field.value || "").trim() !== "" && field.checkValidity();
    }).length;
    const percent = Math.round((completed / requiredFields.length) * 100);
    const message = status.querySelector("span");
    status.style.setProperty("--partner-progress", `${percent}%`);
    status.dataset.ready = String(percent === 100);
    if (message) {
      message.textContent = percent === 100
        ? "Ready to request manual DLCAO review. Approval and project access are not automatic."
        : `${percent}% complete — finish all required business and consent fields.`;
    }
  };

  form.addEventListener("input", updateStatus);
  form.addEventListener("change", updateStatus);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const email = String(new FormData(form).get("Email") || "").trim().toLowerCase();
    const domain = email.split("@")[1] || "";
    if (freeEmailDomains.has(domain)) {
      const emailField = form.elements.Email;
      emailField.setCustomValidity("Use a corporate email connected to the company domain.");
      emailField.reportValidity();
      emailField.addEventListener("input", () => emailField.setCustomValidity(""), { once: true });
      return;
    }

    openWhatsApp(formMessage(form,
      "DLCAO Capital Partner Application — Manual Review Required"));
  });

  updateStatus();
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

  document.getElementById("resetFlipBtn")?.addEventListener("click", resetFlipDefaults);
  document.getElementById("calculateFlipBtn")?.addEventListener("click", calcFlip);

  if (document.getElementById("arv")) resetFlipDefaults();
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
  initializeEntryPosition();
  initializeNavigation();
  initializeForms();
  initializeCalculator();
  initializeReveals();
});

window.addEventListener("pageshow", initializeEntryPosition);


/* DLCAO Phase 2 — Professional Project Review */
const DLCAO_PHASE2 = {
  current: null,
  selectedType: null,
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
  const numberPattern = "([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*(k|m|%)?";
  const orderedLabels = [...labels].sort((a, b) => b.length - a.length);
  for (const label of orderedLabels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const afterLabel = new RegExp(
      `${escapedLabel}\\s*(?:is|of)?\\s*[:=]?\\s*\\$?${numberPattern}`,
      "i"
    );
    const beforeLabel = new RegExp(
      `\\$?${numberPattern}\\s*${escapedLabel}`,
      "i"
    );
    const match = text.match(afterLabel) || text.match(beforeLabel);
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
  const streetPattern = "\\b\\d{2,6}\\s+[A-Za-zÀ-ÿ0-9.' -]+?(?:Ave(?:nue)?|Avenida|St(?:reet)?|Calle|Rd|Road|Camino|Dr(?:ive)?|Blvd|Boulevard|Way|Ct|Court|Ln|Lane)\\b";
  const patterns = [
    new RegExp(`${streetPattern}\\s*,?\\s*[A-Za-zÀ-ÿ .'-]+?\\s*,?\\s*CA\\s+\\d{5}\\b`, "i"),
    new RegExp(`${streetPattern}\\s*,?\\s*[A-Za-zÀ-ÿ .'-]+?\\s*,?\\s*CA\\b`, "i"),
    new RegExp(streetPattern, "i")
  ];
  const match = patterns.map(pattern => text.match(pattern)).find(Boolean);
  return match ? match[0].trim() : "Address not provided";
}

function p2ProjectType(text) {
  const lower = text.toLowerCase();
  if (/(fix\s*&?\s*flip|\bflip\b|arv|rehab|reparar\s+y\s+vender|reventa)/.test(lower)) return "Fix & Flip";
  if (/(rental|\brent\b|cash flow|cap rate|renta|rentar|alquiler|flujo de caja|tasa de capitalizaci[oó]n)/.test(lower)) return "Rental";
  if (/(\badu\b|garage conversion|conversi[oó]n (?:de )?(?:garage|garaje)|unidad adicional)/.test(lower)) return "ADU";
  if (/(\bsell\b|\bsale\b|seller|vender|venta)/.test(lower)) return "Sell";
  if (/(\bbuy\b|buyer|purchase|comprar|compra)/.test(lower)) return "Buy";
  if (/(remodel|renovation|kitchen|bathroom|\bbath\b|repair|remodelar|remodelaci[oó]n|renovar|renovaci[oó]n|cocina|ba[ñn]o|reparaci[oó]n)/.test(lower)) return "Remodel";
  return "General Project";
}

function p2TypeFromKey(key) {
  return {
    remodel: "Remodel",
    sell: "Sell",
    buy: "Buy",
    flip: "Fix & Flip",
    rental: "Rental",
    adu: "ADU"
  }[key] || null;
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
    dataStatus:"User data + disclosed assumptions",
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

function p2IsSpanish(text) {
  return /\b(quiero|necesito|propiedad|direcci[oó]n|presupuesto|renta|alquiler|vender|comprar|remodelar|reparaciones|hipoteca|impuestos|seguro|enganche|tasa|plazo)\b/i.test(text);
}

function p2ApplyDataGuardrails(result, text) {
  const requirements = {
    "Fix & Flip": {
      all: ["purchase", "arv", "repairs"],
      names: ["purchase price / precio de compra", "ARV", "repair budget / presupuesto de reparaciones"]
    },
    Rental: {
      all: ["rent", "value"],
      names: ["monthly rent / renta mensual", "property value / valor de la propiedad"]
    },
    Sell: {
      all: ["price"],
      names: ["expected sale price / precio esperado de venta"]
    },
    Buy: {
      all: ["price"],
      names: ["purchase price or budget / precio de compra o presupuesto"]
    },
    Remodel: {
      any: ["sqft", "budget"],
      names: ["project area / área del proyecto", "verified budget / presupuesto verificado"]
    },
    ADU: {
      any: ["sqft", "budget"],
      names: ["planned ADU size / tamaño del ADU", "verified budget / presupuesto verificado"]
    }
  };
  const requirement = requirements[result.type];
  if (!requirement) return result;

  const provided = result.provided;
  const hasRequiredData = requirement.all
    ? requirement.all.every(key => provided[key] != null)
    : requirement.any.some(key => provided[key] != null);

  if (hasRequiredData) return result;

  const spanish = p2IsSpanish(text);
  result.dataStatus = spanish
    ? "Sin fuente de datos en vivo"
    : "Live property data not connected";
  result.confidence = { label: spanish ? "No verificado" : "Unverified", className: "confidence-low" };
  result.assumptions = [];
  result.metrics = [];
  result.summary = spanish
    ? `DLCAO reconoció la dirección y el patrón ${result.type}, pero no generó valores de la propiedad. La website todavía no tiene una fuente inmobiliaria en vivo y no usará cifras inventadas como si fueran datos reales.`
    : `DLCAO recognized the address and ${result.type} pattern, but did not generate property values. The website does not yet have a live property-data source and will not present invented figures as real property facts.`;
  result.risks = spanish
    ? [
        "Precio, pies cuadrados, habitaciones y baños no verificados",
        "No se consultaron MLS, registros públicos ni comparables en vivo",
        "No debe tomarse una decisión financiera con información incompleta"
      ]
    : [
        "Price, square footage, bedrooms and bathrooms are unverified",
        "No live MLS, public-record or comparable-property source was queried",
        "A financial decision should not be made from incomplete information"
      ];
  result.opportunities = spanish
    ? [
        `Completar los datos requeridos para el análisis ${result.type}`,
        "Verificar registros, comparables y condición de la propiedad",
        "Solicitar una revisión personal de DLCAO"
      ]
    : [
        `Complete the required inputs for the ${result.type} analysis`,
        "Verify property records, comparables and physical condition",
        "Request a personal DLCAO review"
      ];
  result.missing = [
    ...requirement.names,
    ...(spanish
      ? ["pies cuadrados, habitaciones, baños y año de construcción verificados", "fuentes y fecha de actualización"]
      : ["verified square footage, bedrooms, bathrooms and year built", "sources and last-updated date"])
  ];
  result.nextStep = spanish
    ? "Agregar datos verificados o solicitar revisión de DLCAO"
    : "Add verified inputs or request a DLCAO review";
  result.nextStepNote = spanish
    ? "Cuando se conecte la fuente de datos en vivo, este reporte separará datos externos, datos del cliente, estimaciones y supuestos."
    : "When the live data source is connected, this report will separate external facts, client inputs, estimates and assumptions.";
  return result;
}

function p2AnalyzeFlip(text) {
  const r = p2Base(text, "Fix & Flip");
  const p = r.provided;
  p.purchase = p2Number(text, ["purchase", "offer", "buy price", "purchase price", "precio de compra", "oferta", "compra", "price"]);
  p.arv = p2Number(text, ["arv", "after repair value", "resale value", "valor después de reparar", "valor de reventa"]);
  p.repairs = p2Number(text, ["repairs", "repair", "rehab", "renovation", "reparaciones", "reparación", "rehabilitación", "renovación"]);
  p.holding = p2Number(text, ["holding costs", "holding", "carrying costs", "costos de tenencia", "costos de mantenimiento"]);
  p.targetProfit = p2Number(text, ["target profit", "profit target", "ganancia objetivo", "utilidad objetivo"]);

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
  p.rent = p2Number(text, ["monthly rent", "renta mensual", "alquiler mensual", "renta", "rent", "alquiler"]);
  p.value = p2Number(text, ["property value", "valor de la propiedad", "purchase price", "precio de compra", "value", "valor", "price", "precio"]);
  p.mortgage = p2Number(text, ["mortgage payment", "pago de hipoteca", "mortgage", "hipoteca", "debt service", "servicio de deuda"]);
  p.taxes = p2Number(text, ["property taxes", "impuestos de la propiedad", "taxes", "impuestos", "tax"]);
  p.insurance = p2Number(text, ["insurance", "seguro"]);
  p.hoa = p2Number(text, ["hoa"]);
  p.utilities = p2Number(text, ["utilities", "servicios"]);

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
  p.sqft = p2Number(text, ["square feet", "pies cuadrados", "sqft", "size", "tamaño"]);
  p.costPerSqft = p2Number(text, ["cost per sqft", "costo por pie cuadrado", "per sqft"]);
  p.rent = p2Number(text, ["expected rent", "renta esperada", "monthly rent", "renta mensual", "rent", "renta"]);
  p.budget = p2Number(text, ["budget", "presupuesto"]);

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
  p.sqft = p2Number(text, ["square feet", "pies cuadrados", "sqft", "area", "área"]);
  p.budget = p2Number(text, ["budget", "presupuesto", "cost", "costo"]);
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
  p.price = p2Number(text, ["expected price", "precio esperado", "sale price", "precio de venta", "sell price", "value", "valor"]);
  p.repairs = p2Number(text, ["repairs", "repair", "renovation", "reparaciones", "reparación", "renovación"]);
  p.payoff = p2Number(text, ["mortgage payoff", "saldo de hipoteca", "liquidación de hipoteca", "payoff", "loan balance", "saldo del préstamo"]);

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
  p.price = p2Number(text, ["purchase price", "precio de compra", "budget", "presupuesto", "price", "precio"]);
  p.down = p2Number(text, ["down payment", "pago inicial", "enganche"]);
  p.rate = p2Number(text, ["interest rate", "tasa de interés", "rate", "tasa"]);
  p.term = p2Number(text, ["loan term", "plazo del préstamo", "term", "plazo"]);

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

function p2Analyze(text, preferredType = null) {
  const type = preferredType || p2ProjectType(text);
  let result = null;
  if (type === "Fix & Flip") result = p2AnalyzeFlip(text);
  if (type === "Rental") result = p2AnalyzeRental(text);
  if (type === "ADU") result = p2AnalyzeADU(text);
  if (type === "Remodel") result = p2AnalyzeRemodel(text);
  if (type === "Sell") result = p2AnalyzeSell(text);
  if (type === "Buy") result = p2AnalyzeBuy(text);
  if (result) return p2ApplyDataGuardrails(result, text);
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
  document.getElementById("reportDataStatus").textContent = result.dataStatus;
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
  const financialSection = document.getElementById("reportFinancialSection");
  metrics.innerHTML = "";
  financialSection.hidden = result.metrics.length === 0;
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

function p2ResetReport() {
  DLCAO_PHASE2.current = null;
  const reportContent = document.getElementById("reportContent");
  const reportEmpty = document.getElementById("reportEmpty");
  if (reportContent) reportContent.hidden = true;
  if (reportEmpty) reportEmpty.hidden = false;
}

function initializePhase2Analysis() {
  const input = document.getElementById("analysisInput");
  const run = document.getElementById("runAnalysisBtn");
  const clear = document.getElementById("clearAnalysisBtn");
  const send = document.getElementById("sendProjectBtn");
  const promptButtons = Array.from(
    document.querySelectorAll("[data-analysis-prompt]")
  );
  const defaultPlaceholder = input?.getAttribute("placeholder") || "";

  promptButtons.forEach(button => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const promptKey = button.dataset.analysisPrompt;
      DLCAO_PHASE2.selectedType = p2TypeFromKey(promptKey);
      promptButtons.forEach(item => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      p2ResetReport();
      input.value = "";
      const example = DLCAO_PHASE2.prompts[promptKey] || "";
      input.placeholder = `Enter a new ${DLCAO_PHASE2.selectedType} project in English or Spanish. Example: ${example}`;
      input.focus();
    });
  });

  run?.addEventListener("click", () => {
    const text = input?.value.trim();
    if (!text) {
      input?.focus();
      return;
    }
    p2Render(p2Analyze(text, DLCAO_PHASE2.selectedType));
  });

  clear?.addEventListener("click", () => {
    if (input) input.value = "";
    if (input) input.placeholder = defaultPlaceholder;
    DLCAO_PHASE2.selectedType = null;
    p2ResetReport();
    promptButtons.forEach(button => {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    });
    ["leadName","leadPhone","leadEmail"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
  });

  input?.addEventListener("input", () => {
    if (DLCAO_PHASE2.current) p2ResetReport();
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

function initializePartnerProtectionDetails() {
  const details = document.getElementById("partnerProtectionDetails");
  const buttons = Array.from(
    document.querySelectorAll("[data-partner-info]")
  );
  if (!details || !buttons.length) return;

  const protectionInformation = {
    approval: {
      title: "Manual partner approval",
      description:
        "Applications are reviewed by DLCAO before a company receives access to project opportunities. Submitting the form does not create automatic approval or access."
    },
    verification: {
      title: "Company verification",
      description:
        "DLCAO reviews the legal company name, corporate contact, business domain, markets served and applicable licensing information before establishing a capital relationship."
    },
    access: {
      title: "Controlled project access",
      description:
        "Approved partners receive only the project information authorized for their role. Private client, borrower and project documents are not published on the public website."
    },
    risk: {
      title: "Clear risk disclosures",
      description:
        "Project summaries distinguish known information from assumptions and risks. DLCAO does not promise funding, approval, property values or investment returns."
    }
  };

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const information = protectionInformation[button.dataset.partnerInfo];
      if (!information) return;

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      details.replaceChildren();
      const title = document.createElement("strong");
      const description = document.createElement("p");
      title.textContent = information.title;
      description.textContent = information.description;
      details.append(title, description);
    });
  });
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
  initializePartnerProtectionDetails();
  initializeCapitalPartnerApplication();
  initializeOperationsDashboard();
});
