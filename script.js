const COMPANY_PHONE = "17473674447";

const properties = {
  sale: {
    type: "For Sale",
    title: "15627 Vintage St",
    address: "North Hills, CA 91343",
    image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85",
    description: "Current DLCAO sale property. Contact DLCAO for photos, pricing, showing details and full information.",
    action: "Hello DLCAO, I want information about 15627 Vintage St, North Hills, CA 91343."
  },
  rent: {
    type: "For Rent",
    title: "9327 Woodley Ave",
    address: "North Hills, CA 91343",
    image: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=85",
    description: "Current DLCAO rental property. Contact DLCAO for availability, rent terms, photos and showing details.",
    action: "Hello DLCAO, I want information about the rental property at 9327 Woodley Ave, North Hills, CA 91343."
  }
};

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn?.addEventListener("click", () => navMenu.classList.toggle("show"));

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("show"));
});

document.querySelectorAll("[data-scroll]").forEach(button => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
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

["estimateForm", "buyForm", "contactForm"].forEach(id => {
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

function openProperty(type) {
  const property = properties[type];
  if (!property) return;
  const content = `
    <div class="modal-hero" style="background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.5)),url('${property.image}')"></div>
    <div class="modal-content">
      <span class="tag">${property.type}</span>
      <h2>${property.title}</h2>
      <p><strong>${property.address}</strong></p>
      <p>${property.description}</p>
      <div class="modal-actions">
        <a class="btn gold" href="https://wa.me/${COMPANY_PHONE}?text=${encodeURIComponent(property.action)}" target="_blank" rel="noopener">Request Info</a>
        <a class="btn black" href="tel:+${COMPANY_PHONE}">Call DLCAO</a>
      </div>
    </div>
  `;
  document.getElementById("modalContent").innerHTML = content;
  document.getElementById("propertyModal").classList.add("show");
}

function closeProperty() {
  document.getElementById("propertyModal").classList.remove("show");
}

document.getElementById("propertyModal")?.addEventListener("click", (e) => {
  if (e.target.id === "propertyModal") closeProperty();
});
