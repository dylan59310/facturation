document.addEventListener("DOMContentLoaded", function () {
  const clientSelect = document.getElementById("clientSelect");
  const monthSelect = document.getElementById("monthSelect");
  const invoiceElement = document.getElementById("invoice");
  let clientsData = null;

  fetch("clients.json")
    .then((response) => response.json())
    .then((data) => {
      clientsData = data;
      clientsData.forEach((client) => {
        const option = document.createElement("option");
        option.value = client.id;
        option.textContent = client.name;
        clientSelect.appendChild(option);
      });
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des clients : ", error)
    );

  document
    .getElementById("generateInvoice")
    .addEventListener("click", function () {
      if (clientsData) {
        const selectedClient = clientSelect.value;
        const selectedMonth = monthSelect.value;
        const client = clientsData.find((item) => item.id === selectedClient);

        if (client) {
          const daysInMonth = calculateDaysInMonth(selectedMonth, client.days);
          console.log(daysInMonth);
          const invoiceHTML = generateInvoiceHTML(
            monthSelect.options[monthSelect.selectedIndex].text,
            client,
            daysInMonth
          );
          invoiceElement.innerHTML = invoiceHTML;

          const quantity1_6Input = document.getElementById("quantity1.6");
          const quantity2_1Input = document.getElementById("quantity2.1");
          const vdsInput = document.getElementById("vds");

          quantity1_6Input.addEventListener("input", recalculateTotal);
          quantity2_1Input.addEventListener("input", recalculateTotal);
          vdsInput.addEventListener("input", recalculateTotal);
        } else {
          alert("Client non trouvé.");
        }
      }
    });

  function generateInvoiceHTML(month, client, daysInMonth) {
    const totalAmount = calculateTotalAmount(daysInMonth);
    const quantity1_6 =
      daysInMonth["dimanche"] +
      daysInMonth["lundi"] +
      daysInMonth["mardi"] +
      daysInMonth["mercredi"] +
      daysInMonth["jeudi"];
    const quantity2_1 = daysInMonth["vendredi"] + daysInMonth["samedi"];
    const vds = 0;

    const totalAmountFormatted = totalAmount.toFixed(2);
    const subTotal1Formatted = (quantity1_6 * 1.6).toFixed(2) + " €";
    const subTotal2Formatted = (quantity2_1 * 2.1).toFixed(2) + " €";
    const subTotal3Formatted = (vds * 2.9).toFixed(2) + " €";
    console.log(totalAmount);
    const invoiceHTML = `
      <h1>Facture du mois de ${month}</h1>
      <h2>La Voix du Nord</h2>
      <div class="parent">
        <p class="p1">
          MME Lemire Isabelle<br>
          27 allée des érables<br>
          59310 Orchies<br>
          TEL: 06/06/83/57/62
        </p>
        <p class="p2">
          ${client.name}<br>
        </p>
      </div>
      <div class="parent1">
        <li>Quantité</li>
        <li>Nom</li>
        <li>Prix unitaire</li>
        <li>Sous-total catégorie</li>
        <input type="number" id="quantity1.6" class="quantity space div5" value="${quantity1_6}" min="0">
        <label for="quantity1.6" class="space div6">PRIX VDN villeneuve d'ascq (dimanche a jeudi)</label>
        <span class="space div7">1.6€</span>
        <span id="sous-total-1" class="space div8">${subTotal1Formatted}</span>
        <input type="number" id="quantity2.1" class="quantity space div9" value="${quantity2_1}" min="0">
        <label for="quantity2.1" class="space div10">PRIX VDN villeneuve d'ascq (vendredi & samedi)</label>
        <span class="space div11">2.1€</span>
        <span id="sous-total-2" class="space div12">${subTotal2Formatted}</span>
        <input type="number" id="vds" class="quantity space div13" value="${vds}" min="0">
        <label for="vds" class="space div14">LA VOIX DES SPORT</label>
        <span class="space div15">2.9€</span>
        <span id="sous-total-3" class="space div16">${subTotal3Formatted}</span>
        <table class="style-table div20">
          <tr>
            <th>Total</th>
          </tr>
          <tr>
            <td id="totalAmount">${totalAmountFormatted} €</td>
          </tr>
        </table>
      </div>
    `;

    return invoiceHTML;
  }

  function calculateDaysInMonth(month, clientDays) {
    console.log(month);
    const daysInMonth = {
      lundi: 0,
      mardi: 0,
      mercredi: 0,
      jeudi: 0,
      vendredi: 0,
      samedi: 0,
      dimanche: 0,
    };

    const daysCount = new Date(
      new Date().getFullYear(),
      parseInt(month) + 1,
      0
    ).getDate();
    console.log(daysCount);

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(new Date().getFullYear(), parseInt(month), day);
      const dayName = date
        .toLocaleDateString("fr-FR", { weekday: "long" })
        .toLowerCase();

      if (clientDays[dayName]) {
        daysInMonth[dayName]++;
      }
    }

    return daysInMonth;
  }

  function calculateTotalAmount(
    daysInMonth,
    q1_6 = undefined,
    q2_1 = undefined,
    Vds = undefined
  ) {
    const quantity1_6 =
      q1_6 ??
      daysInMonth["dimanche"] +
        daysInMonth["lundi"] +
        daysInMonth["mardi"] +
        daysInMonth["mercredi"] +
        daysInMonth["jeudi"];
    const quantity2_1 = q2_1 ?? daysInMonth["vendredi"] + daysInMonth["samedi"];
    const vds = Vds !== undefined ? Vds : 0;
    // const vds = Vds ?? daysInMonth;
// ["lundi"]
    const totalAmount = quantity1_6 * 1.6 + quantity2_1 * 2.1 + vds * 2.9;

    return totalAmount;
  }

  function recalculateTotal() {
    const quantity1_6Input = document.getElementById("quantity1.6");
    const quantity2_1Input = document.getElementById("quantity2.1");
    const vdsInput = document.getElementById("vds");
    const totalAmountElement = document.getElementById("totalAmount");
    const subTotal1Element = document.querySelector("#sous-total-1");
    const subTotal2Element = document.querySelector("#sous-total-2");
    const subTotal3Element = document.querySelector("#sous-total-3");

    const quantity1_6 = parseFloat(quantity1_6Input.value) || 0;
    const quantity2_1 = parseFloat(quantity2_1Input.value) || 0;
    const vds = parseFloat(vdsInput.value) || 0;

    const totalAmount = calculateTotalAmount({}, quantity1_6, quantity2_1, vds);
    console.log(totalAmount);
    const totalAmountFormatted = totalAmount.toFixed(2);
    const subTotal1Formatted = (quantity1_6 * 1.6).toFixed(2) + " €";
    const subTotal2Formatted = (quantity2_1 * 2.1).toFixed(2) + " €";
    const subTotal3Formatted = (vds * 2.9).toFixed(2) + " €";

    subTotal1Element.textContent = subTotal1Formatted;
    subTotal2Element.textContent = subTotal2Formatted;
    subTotal3Element.textContent = subTotal3Formatted;
    totalAmountElement.textContent = ` ${totalAmountFormatted} €`;
  }

  const printButton = document.getElementById("printInvoice");

  printButton.addEventListener("click", function () {
    const invoiceElement = document.getElementById("invoice");
    window.print();
  });
});
