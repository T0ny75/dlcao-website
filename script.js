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




function initFlipAnalyzer() {
  document.querySelectorAll(".step").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      const step = Number(btn.dataset.step || 0);
      if (!target) return;
      const value = Number(target.value || 0) + step;
      target.value = Math.max(0, value);
      calcFlip();
    });
  });

  document.querySelectorAll("[data-set]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.set);
      if (!target) return;
      target.value = btn.dataset.value;
      calcFlip();
    });
  });

  document.querySelectorAll(".calc-tabs .tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".calc-tabs .tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const preset = tab.dataset.preset;
      if (preset === "conservative") {
        setValue("sellingPercent", 8);
        setValue("profit", 100000);
        setValue("holdingCosts", 35000);
      }
      if (preset === "balanced") {
        setValue("sellingPercent", 7);
        setValue("profit", 75000);
        setValue("holdingCosts", 25000);
      }
      if (preset === "aggressive") {
        setValue("sellingPercent", 5);
        setValue("profit", 50000);
        setValue("holdingCosts", 15000);
      }
      calcFlip();
    });
  });

  ["arv","purchasePrice","repairs","holdingCosts","sellingPercent","profit"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcFlip);
  });

  calcFlip();
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function calcFlip() {
  const arv = Number(document.getElementById("arv")?.value || 0);
  const purchase = Number(document.getElementById("purchasePrice")?.value || 0);
  const repairs = Number(document.getElementById("repairs")?.value || 0);
  const holding = Number(document.getElementById("holdingCosts")?.value || 0);
  const sellingPercent = Number(document.getElementById("sellingPercent")?.value || 0) / 100;
  const targetProfit = Number(document.getElementById("profit")?.value || 0);

  const sellingCosts = arv * sellingPercent;
  const maxOffer = arv - repairs - holding - sellingCosts - targetProfit;
  const rule70 = (arv * 0.70) - repairs;
  const projectedProfit = arv - purchase - repairs - holding - sellingCosts;
  const totalInvested = purchase + repairs + holding;
  const roi = totalInvested > 0 ? (projectedProfit / totalInvested) * 100 : 0;

  updateText("flipResult", money(maxOffer));
  updateText("projectedProfit", money(projectedProfit));
  updateText("roiResult", roi.toFixed(1) + "%");
  updateText("rule70Result", money(rule70));
  updateText("totalInvested", money(totalInvested));
  updateText("sellingCostResult", money(sellingCosts));

  const statusEl = document.getElementById("dealStatus");
  const adviceEl = document.getElementById("dealAdvice");
  if (statusEl) {
    statusEl.classList.remove("good", "warn", "bad");
    if (projectedProfit >= targetProfit && roi >= 15) {
      statusEl.textContent = "Strong Deal";
      statusEl.classList.add("good");
      if (adviceEl) adviceEl.textContent = "This deal meets or beats your target profit and shows a strong estimated ROI. Review comps, permits and repair scope before moving forward.";
    } else if (projectedProfit > 0 && roi >= 8) {
      statusEl.textContent = "Review Deal";
      statusEl.classList.add("warn");
      const gap = Math.max(0, targetProfit - projectedProfit);
      if (adviceEl) adviceEl.textContent = gap > 0 ? `Consider negotiating approximately ${money(gap)} lower or reducing costs to hit your target profit.` : "Profit is positive, but ROI is moderate. Review risk, timeline and repair budget.";
    } else {
      statusEl.textContent = "Risky Deal";
      statusEl.classList.add("bad");
      if (adviceEl) adviceEl.textContent = "This deal may not leave enough margin. Consider a lower purchase price, lower repair budget, or passing on the deal.";
    }
  }
}

function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

document.addEventListener("DOMContentLoaded", initFlipAnalyzer);


/* V13 premium motion */
document.addEventListener("DOMContentLoaded", () => {
  const backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) backTop.classList.add("show");
      else backTop.classList.remove("show");
    });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  const revealItems = document.querySelectorAll("[data-reveal='true'], .reveal-section");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("revealed"));
  }
});


/* V14 visible floating actions */
document.addEventListener("DOMContentLoaded", () => {
  const backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 450) backTop.classList.add("show");
      else backTop.classList.remove("show");
    });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
});


/* V15 back to top visibility */
document.addEventListener("DOMContentLoaded", () => {
  const backTop = document.getElementById("backTop");
  if (!backTop) return;
  const toggleTop = () => {
    if (window.scrollY > 450) backTop.classList.add("show");
    else backTop.classList.remove("show");
  };
  window.addEventListener("scroll", toggleTop);
  toggleTop();
  backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
});
