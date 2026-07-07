
function money(n){
  return Number(n || 0).toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
}
function resetFlipDefaults(){
  setV26("arv",750000);
  setV26("purchasePrice",450000);
  setV26("repairs",85000);
  setV26("holdingCosts",25000);
  setV26("sellingPercent",7);
  setV26("profit",70000);
  calcFlip();
}
function setV26(id,value){
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
  if(document.getElementById("arv")) calcFlip();
});
