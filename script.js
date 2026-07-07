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


/* V16 compact flip analyzer controls */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-adjust]").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.adjust);
      if (!input) return;
      input.value = Math.max(0, Number(input.value || 0) + Number(btn.dataset.step || 0));
      calcFlip();
    });
  });

  document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.preset === "safe") {
        setCalc("sellingPercent", 8); setCalc("profit", 100000); setCalc("holdingCosts", 35000);
      } else if (btn.dataset.preset === "fast") {
        setCalc("sellingPercent", 5); setCalc("profit", 50000); setCalc("holdingCosts", 15000);
      } else {
        setCalc("sellingPercent", 7); setCalc("profit", 70000); setCalc("holdingCosts", 25000);
      }
      calcFlip();
    });
  });

  document.querySelectorAll("[data-set]").forEach(btn => {
    btn.addEventListener("click", () => {
      setCalc(btn.dataset.set, btn.dataset.value);
      calcFlip();
    });
  });

  ["arv","purchasePrice","repairs","holdingCosts","sellingPercent","profit"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", calcFlip);
  });

  calcFlip();

  const backTop = document.getElementById("backTop");
  if (backTop) {
    const showTop = () => backTop.classList.toggle("show", window.scrollY > 450);
    window.addEventListener("scroll", showTop);
    showTop();
    backTop.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
  }
});

function setCalc(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}


/* V17 professional contact rail back-top */
document.addEventListener("DOMContentLoaded", () => {
  const topBtn = document.getElementById("backTop");
  if (!topBtn) return;
  const toggleTop = () => topBtn.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", toggleTop);
  toggleTop();
  topBtn.addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));
});


/* DLCAO Enterprise v22 calculator + menu */
function resetFlipDefaults(){setV22("arv",750000);setV22("purchasePrice",450000);setV22("repairs",85000);setV22("holdingCosts",25000);setV22("sellingPercent",7);setV22("profit",70000);calcFlip();}
function setV22(id,value){const el=document.getElementById(id);if(el) el.value=value;}
function calcFlip(){
  const arv=Number(document.getElementById("arv")?.value||0);
  const purchase=Number(document.getElementById("purchasePrice")?.value||0);
  const repairs=Number(document.getElementById("repairs")?.value||0);
  const holding=Number(document.getElementById("holdingCosts")?.value||0);
  const sellingPct=Number(document.getElementById("sellingPercent")?.value||0)/100;
  const target=Number(document.getElementById("profit")?.value||0);
  const selling=arv*sellingPct;
  const maxOffer=arv-repairs-holding-selling-target;
  const profit=arv-purchase-repairs-holding-selling;
  const rule70=(arv*.70)-repairs;
  const invested=purchase+repairs+holding;
  const roi=invested>0?(profit/invested)*100:0;
  setTextV22("flipResult",money(maxOffer));setTextV22("projectedProfit",money(profit));setTextV22("roiResult",roi.toFixed(1)+"%");setTextV22("rule70Result",money(rule70));
  const status=document.getElementById("dealStatus"), advice=document.getElementById("dealAdvice");
  if(status){status.classList.remove("good","warn","bad");
    if(profit>=target&&roi>=15){status.textContent="Strong Deal";status.classList.add("good");if(advice)advice.textContent="Meets target profit and strong ROI. Verify comps and repair scope.";}
    else if(profit>0&&roi>=8){status.textContent="Review Deal";status.classList.add("warn");if(advice)advice.textContent="Profitable but margin may be tight. Negotiate price or verify ARV carefully.";}
    else{status.textContent="Pass / High Risk";status.classList.add("bad");if(advice)advice.textContent="Not enough margin. Consider a lower price or passing on this deal.";}
  }
}
function setTextV22(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
document.addEventListener("DOMContentLoaded",()=>{
  const menu=document.getElementById("navMenu"), btn=document.getElementById("menuBtn");
  if(btn&&menu){btn.addEventListener("click",()=>menu.classList.toggle("show"));menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("show")));}
  ["arv","purchasePrice","repairs","holdingCosts","sellingPercent","profit"].forEach(id=>{document.getElementById(id)?.addEventListener("input",calcFlip);document.getElementById(id)?.addEventListener("change",calcFlip);});
  calcFlip();
});
