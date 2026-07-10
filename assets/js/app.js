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


/* Enterprise v20 calculator */
function resetFlipDefaults(){
  setV20("arv",750000);
  setV20("purchasePrice",450000);
  setV20("repairs",85000);
  setV20("holdingCosts",25000);
  setV20("sellingPercent",7);
  setV20("profit",70000);
  calcFlip();
}
function setV20(id,value){
  const el=document.getElementById(id);
  if(el) el.value=value;
}
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
  setTxt("flipResult",money(maxOffer));
  setTxt("projectedProfit",money(profit));
  setTxt("roiResult",roi.toFixed(1)+"%");
  setTxt("rule70Result",money(rule70));
  const status=document.getElementById("dealStatus");
  const advice=document.getElementById("dealAdvice");
  if(status){
    status.classList.remove("good","warn","bad");
    if(profit>=target && roi>=15){
      status.textContent="Strong Deal";
      status.classList.add("good");
      if(advice) advice.textContent="This deal meets the target profit and shows strong ROI. Verify comps and repair scope before moving forward.";
    }else if(profit>0 && roi>=8){
      status.textContent="Review Deal";
      status.classList.add("warn");
      if(advice) advice.textContent="The deal has profit, but margin may be tight. Negotiate price, reduce repairs, or confirm ARV carefully.";
    }else{
      status.textContent="Pass / High Risk";
      status.classList.add("bad");
      if(advice) advice.textContent="The deal does not leave enough margin. Consider a lower purchase price or passing on the opportunity.";
    }
  }
}
function setTxt(id,value){
  const el=document.getElementById(id);
  if(el) el.textContent=value;
}
document.addEventListener("DOMContentLoaded",()=>{
  ["arv","purchasePrice","repairs","holdingCosts","sellingPercent","profit"].forEach(id=>{
    document.getElementById(id)?.addEventListener("input",calcFlip);
    document.getElementById(id)?.addEventListener("change",calcFlip);
  });
  calcFlip();
});


/* Enterprise v22 polish */
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".reveal-section, [data-reveal='true']");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    sections.forEach(s => obs.observe(s));
  } else {
    sections.forEach(s => s.classList.add("revealed"));
  }
  const menu = document.getElementById("navMenu");
  document.querySelectorAll("#navMenu a").forEach(a => {
    a.addEventListener("click", () => menu?.classList.remove("show"));
  });
});


/* V23 estimate dock smooth scroll */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href="#estimate"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById("estimate");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"center"});
    });
  });
});


/* V25 platform hooks */
const DLCAO_PLATFORM = {
  version: "v25",
  crmReady: true,
  futureIntegrations: ["Google Sheets", "CRM", "Calendly", "Client Portal", "Investor Dashboard"]
};


/* DLCAO Enterprise v26 App */
const DLCAO = {
  version: "Enterprise v26",
  phone: "+17473674447",
  email: "DLCAO@mail.com",
  instagram: "https://www.instagram.com/dlcaoholding"
};


/* DLCAO Enterprise v27 Production Release */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href="#estimate"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const target = document.getElementById("estimate");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"center"});
    });
  });
});


/* V28 Lead Machine */
function addChatMessage(text,type="bot"){
  const win=document.getElementById("chatWindow");
  if(!win)return;
  const div=document.createElement("div");
  div.className=type==="user"?"user-msg":"bot-msg";
  div.textContent=text;
  win.appendChild(div);
  win.scrollTop=win.scrollHeight;
}
function sendAIMessage(){
  const input=document.getElementById("aiInput");
  const text=input?.value?.trim();
  if(!text)return;
  addChatMessage(text,"user");
  input.value="";
  setTimeout(()=>addChatMessage("Great. Please send your property address, timeline, budget range, and best contact. DLCAO can review and follow up directly.","bot"),350);
}
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-chat]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const input=document.getElementById("aiInput");
      if(input)input.value=btn.dataset.chat;
      sendAIMessage();
    });
  });
});
function submitSmartEstimate(e){
  e.preventDefault();
  const msg=[
    "DLCAO Project Request",
    "Project: "+document.getElementById("projectType")?.value,
    "City: "+document.getElementById("projectCity")?.value,
    "Budget: "+document.getElementById("budgetRange")?.value,
    "Timeline: "+document.getElementById("timeline")?.value,
    "Address: "+document.getElementById("propertyAddress")?.value,
    "Contact: "+document.getElementById("contactInfo")?.value,
    "Details: "+document.getElementById("projectDetails")?.value
  ].join("\n");
  window.open("https://wa.me/17473674447?text="+encodeURIComponent(msg),"_blank");
}

/* DLCAO V30 Guided AI Assistant */
const aiState={flow:null,step:0,data:{},flows:{flip:["property address","purchase price","repair budget","expected ARV","holding costs","target profit"],adu:["property address","city","lot size","detached or attached ADU","budget range","best contact"],remodel:["property address","project type","square footage or rooms","budget range","timeline","best contact"],sell:["property address","reason for selling","occupied or vacant","desired timeline","price expectation","best contact"],rental:["property address","rental goal","repairs needed","target rent","timeline","best contact"]}};
function aiAdd(text,type="bot"){const win=document.getElementById("chatWindow");if(!win)return;const div=document.createElement("div");div.className=type==="user"?"user-msg":"bot-msg";div.textContent=text;win.appendChild(div);win.scrollTop=win.scrollHeight;}
function setAIProgress(){const label=document.getElementById("aiStepLabel");const bar=document.getElementById("aiProgressBar");const total=6;const step=Math.min(aiState.step+1,total);if(label)label.textContent="Step "+step+" of "+total;if(bar)bar.style.width=((step/total)*100)+"%";}
function startAIFlow(flow){aiState.flow=flow;aiState.step=0;aiState.data={};setAIProgress();const names={flip:"Fix & Flip",adu:"ADU",remodel:"Remodel",sell:"Sell",rental:"Rental"};aiAdd("Great. Let's start a "+names[flow]+" review. What is the "+aiState.flows[flow][0]+"?");}
function sendAIMessage(){const input=document.getElementById("aiInput");const text=input?.value?.trim();if(!text)return;aiAdd(text,"user");input.value="";if(!aiState.flow){const lower=text.toLowerCase();if(lower.includes("adu"))return startAIFlow("adu");if(lower.includes("flip")||lower.includes("arv"))return startAIFlow("flip");if(lower.includes("sell"))return startAIFlow("sell");if(lower.includes("rent"))return startAIFlow("rental");return startAIFlow("remodel");}const key=aiState.flows[aiState.flow][aiState.step];aiState.data[key]=text;aiState.step++;setAIProgress();if(aiState.step<aiState.flows[aiState.flow].length){aiAdd("Thanks. What is the "+aiState.flows[aiState.flow][aiState.step]+"?");}else{aiAdd(generateAIRecommendation());}}
function generateAIRecommendation(){if(aiState.flow==="flip"){const purchase=Number((aiState.data["purchase price"]||"").replace(/[^0-9.]/g,""));const repairs=Number((aiState.data["repair budget"]||"").replace(/[^0-9.]/g,""));const arv=Number((aiState.data["expected ARV"]||"").replace(/[^0-9.]/g,""));const holding=Number((aiState.data["holding costs"]||"").replace(/[^0-9.]/g,""));const target=Number((aiState.data["target profit"]||"").replace(/[^0-9.]/g,""))||70000;const selling=arv*.07;const profit=arv-purchase-repairs-holding-selling;const roi=(purchase+repairs+holding)>0?(profit/(purchase+repairs+holding))*100:0;const rating=profit>=target&&roi>=15?"Strong Deal":profit>0?"Review Deal":"High Risk";return "DLCAO Investment Review: Estimated profit "+money(profit)+", ROI "+roi.toFixed(1)+"%, Rating: "+rating+". Tap Send AI Summary to DLCAO to send this report.";}return "DLCAO Review Complete. I have enough information to create a project summary. Tap Send AI Summary to DLCAO.";}
function sendAIReport(){const lines=["DLCAO AI Lead Summary","Type: "+(aiState.flow||"General")];Object.keys(aiState.data).forEach(k=>lines.push(k+": "+aiState.data[k]));if(lines.length<3)lines.push("Client started a conversation but did not complete full intake.");window.open("https://wa.me/17473674447?text="+encodeURIComponent(lines.join("\n")),"_blank");}
document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("[data-flow]").forEach(btn=>{btn.addEventListener("click",()=>startAIFlow(btn.dataset.flow));});});


/* DLCAO V31 AI Analyzer - not a questionnaire */
function parseMoneyFromText(text, keywords){
  const lower = text.toLowerCase();
  for(const key of keywords){
    const idx = lower.indexOf(key);
    if(idx >= 0){
      const slice = lower.slice(idx, idx + 80);
      const match = slice.match(/\$?\s*([0-9][0-9,\.]*)(\s*k)?/);
      if(match){
        let n = Number(match[1].replace(/,/g,""));
        if(match[2]) n *= 1000;
        return n;
      }
    }
  }
  return null;
}
function extractAddressLike(text){
  const cleaned = text.replace(/\bfix\s*&?\s*flip\b/ig,"").replace(/\barv\b/ig,"").trim();
  const match = cleaned.match(/\d{3,6}\s+[a-zA-Z0-9\s\.]+?(?:ave|avenue|st|street|rd|road|dr|drive|blvd|way|ct|court|ln|lane)?(?:\s+[a-zA-Z\s]+)?(?:\s+ca)?(?:\s+\d{5})?/i);
  return match ? match[0].trim() : cleaned.slice(0,80);
}
function aiAnalyzeFreeText(text){
  const lower = text.toLowerCase();
  const isFlip = lower.includes("flip") || lower.includes("fix") || lower.includes("arv") || lower.includes("investment");
  const isADU = lower.includes("adu") || lower.includes("garage conversion");
  const isSell = lower.includes("sell") || lower.includes("venta") || lower.includes("vender");
  const isRemodel = lower.includes("remodel") || lower.includes("kitchen") || lower.includes("bath") || lower.includes("repair");

  if(isFlip){
    const address = extractAddressLike(text) || "Property address not confirmed";
    const purchase = parseMoneyFromText(text, ["purchase","buy","offer","precio","price"]) || 650000;
    const arv = parseMoneyFromText(text, ["arv","after repair","resale","value"]) || Math.round(purchase * 1.32);
    const repairs = parseMoneyFromText(text, ["repair","rehab","renovation","repairs"]) || Math.round(arv * 0.10);
    const holding = parseMoneyFromText(text, ["holding","closing","costs"]) || Math.round(arv * 0.035);
    const selling = Math.round(arv * 0.07);
    const targetProfit = parseMoneyFromText(text, ["profit","target"]) || 70000;
    const maxOffer = arv - repairs - holding - selling - targetProfit;
    const profit = arv - purchase - repairs - holding - selling;
    const roi = (profit / (purchase + repairs + holding)) * 100;
    const rating = profit >= targetProfit && roi >= 15 ? "🟢 STRONG DEAL" : profit > 0 && roi >= 8 ? "🟡 REVIEW / NEGOTIATE" : "🔴 HIGH RISK";
    const negotiate = Math.max(0, purchase - maxOffer);

    return [
      "DLCAO Fix & Flip AI Analysis",
      "",
      "Property: " + address,
      "",
      "Estimated numbers based on professional assumptions:",
      "• Purchase / Offer: " + money(purchase),
      "• Estimated ARV: " + money(arv),
      "• Repairs / Rehab: " + money(repairs),
      "• Holding + Closing: " + money(holding),
      "• Selling Costs (7%): " + money(selling),
      "• Target Profit: " + money(targetProfit),
      "",
      "Deal Results:",
      "• Maximum Allowable Offer: " + money(maxOffer),
      "• Estimated Profit: " + money(profit),
      "• Estimated ROI: " + roi.toFixed(1) + "%",
      "• Rating: " + rating,
      "",
      negotiate > 0 ? "Recommendation: Try to negotiate about " + money(negotiate) + " lower, or verify a higher ARV before moving forward." : "Recommendation: This appears within investment range, but DLCAO should verify comps, scope of work, permits and timeline.",
      "",
      "Next step: Send this report to DLCAO for a personal review."
    ].join("\n");
  }

  if(isADU){
    const address = extractAddressLike(text);
    return "DLCAO ADU AI Review\n\nProperty: " + address + "\n\nInitial estimate range: $120,000 - $350,000 depending on size, utilities, access, plans, permits and finish level.\n\nKey items to verify:\n• City and zoning\n• Lot size\n• Detached or attached ADU\n• Utility access\n• Parking and setbacks\n\nNext step: Send this to DLCAO for a property-specific ADU review.";
  }

  if(isSell){
    const address = extractAddressLike(text);
    return "DLCAO Property Sale Review\n\nProperty: " + address + "\n\nDLCAO can review selling strategy, needed repairs, rental potential, investor offer options and market preparation.\n\nRecommendation: Before listing, evaluate repairs that increase value without over-improving the property.";
  }

  if(isRemodel){
    const address = extractAddressLike(text);
    return "DLCAO Remodel AI Review\n\nProperty: " + address + "\n\nInitial ranges:\n• Bathroom: $12,000 - $35,000+\n• Kitchen: $25,000 - $75,000+\n• Full renovation: depends on square footage, scope, permits and finishes.\n\nRecommendation: DLCAO should review photos, scope, timeline and budget before creating a detailed estimate.";
  }

  return "I can analyze this for construction, ADU, remodel, sale, rental or Fix & Flip. Example: “7024 Eton Canoga Park CA 91303 Fix & Flip purchase 650k ARV 850k repairs 85k.”";
}

/* override previous sendAIMessage */
function sendAIMessage(){
  const input=document.getElementById("aiInput");
  const text=input?.value?.trim();
  if(!text)return;
  aiAdd(text,"user");
  input.value="";
  const response = aiAnalyzeFreeText(text);
  setTimeout(()=>aiAdd(response,"bot"),350);
  if(typeof aiState !== "undefined"){
    aiState.flow = "ai-analyzer";
    aiState.data = { "AI Analysis Input": text, "AI Analysis Result": response };
  }
}

/* override quick buttons to act like prompts */
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll("[data-flow]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const prompts = {
        flip: "7024 Eton Canoga Park CA 91303 Fix & Flip",
        adu: "I want to build an ADU",
        remodel: "I need a remodel estimate",
        sell: "I want to sell my property",
        rental: "I need help with a rental property"
      };
      const input=document.getElementById("aiInput");
      if(input){ input.value = prompts[btn.dataset.flow] || btn.dataset.flow; }
      sendAIMessage();
    });
  });
});
