// ==========================================
// ABHI'S MARKET - BILLING SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Store current bill items
    let billItems = [];

    // ------------------------------------------
    // BILLING ELEMENTS
    // ------------------------------------------

    const productInput = document.getElementById("productName");
    const quantityInput = document.getElementById("quantity");
    const priceInput = document.getElementById("price");
    const customerInput = document.getElementById("customerName");

    const addProductButton = document.getElementById("addProduct");
    const generateBillButton = document.getElementById("generateBill");

    const billTable = document.getElementById("billTable");
    const totalAmount = document.getElementById("totalAmount");


    // ------------------------------------------
    // ADD PRODUCT TO BILL
    // ------------------------------------------

    if (addProductButton) {

        addProductButton.addEventListener("click", function () {

            const product = productInput.value.trim();
            const quantity = Number(quantityInput.value);
            const price = Number(priceInput.value);

            // Check product
            if (product === "") {
                alert("Please enter product name.");
                return;
            }

            // Check quantity
            if (quantity <= 0 || isNaN(quantity)) {
                alert("Please enter a valid quantity.");
                return;
            }

            // Check price
            if (price <= 0 || isNaN(price)) {
                alert("Please enter a valid price.");
                return;
            }


            // Calculate amount
            const amount = quantity * price;


            // Add product
            billItems.push({
                product: product,
                quantity: quantity,
                price: price,
                amount: amount
            });


            // Display product
            displayBill();


            // Clear product fields
            productInput.value = "";
            quantityInput.value = "1";
            priceInput.value = "";

        });

    }


    // ------------------------------------------
    // DISPLAY BILL
    // ------------------------------------------

    function displayBill() {

        if (!billTable) {
            return;
        }

        billTable.innerHTML = "";

        let total = 0;

        billItems.forEach(function (item, index) {

            total += item.amount;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>
                    <button onclick="removeProduct(${index})">
                        Remove
                    </button>
                </td>
            `;

            billTable.appendChild(row);

        });


        // Display total
        if (totalAmount) {
            totalAmount.innerText = "₹" + total.toFixed(2);
        }

    }


    // ------------------------------------------
    // REMOVE PRODUCT
    // ------------------------------------------

    window.removeProduct = function (index) {

        billItems.splice(index, 1);

        displayBill();

    };


    // ------------------------------------------
    // GENERATE BILL
    // ------------------------------------------

    if (generateBillButton) {

        generateBillButton.addEventListener("click", async function () {

            const customer = customerInput
                ? customerInput.value.trim()
                : "Walk-in Customer";


            // Check bill
            if (billItems.length === 0) {

                alert("Please add at least one product.");

                return;

            }


            // Calculate total
            let total = 0;

            billItems.forEach(function (item) {

                total += item.amount;

            });


            // Generate Bill ID
            const billID =
                "B" +
                Date.now().toString().slice(-6);


           // Create transaction
const transaction = {
    billID: billID,
    customer: customer,
    mobile: document.getElementById("customerMobile").value.trim(),
    date: new Date().toLocaleString("en-IN"),
    items: billItems.map(function(item) {
        return {
            product: item.product,
            quantity: item.quantity,
            unit: item.unit || "Piece",
            price: item.price,
            amount: item.amount
        };
    }),
    total: total,
    paymentType: document.getElementById("paymentType").value
};

// Send bill to Java Backend
try {

    const response = await fetch("http://localhost:8080/api/bills", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(transaction)
    });

    const result = await response.text();

    if (!response.ok) {
        throw new Error(result);
    }

    alert(
        "Bill Generated Successfully!\n\n" +
        "Bill ID: " + billID + "\n" +
        "Customer: " + customer + "\n" +
        "Total: ₹" + total.toFixed(2) + "\n\n" +
        "Bill saved to Excel successfully!"
    );

    console.log("Saved Transaction:", transaction);

    // Clear bill
    billItems = [];
    displayBill();

    if (customerInput) {
        customerInput.value = "";
    }

    document.getElementById("customerMobile").value = "";

} catch (error) {

    console.error("Billing Error:", error);

    alert("Could not save bill. Check whether Java backend is running.");

}


            // Save transaction temporarily
            let transactions =
                JSON.parse(
                    localStorage.getItem("transactions")
                ) || [];


            transactions.push(transaction);


            localStorage.setItem(
                "transactions",
                JSON.stringify(transactions)
            );


            // Show bill
            alert(
                "Bill Generated Successfully!\n\n" +
                "Bill ID: " + billID + "\n" +
                "Customer: " + customer + "\n" +
                "Total: ₹" + total.toFixed(2)
            );


            // Show in console
            console.log("New Transaction:", transaction);


            // Clear bill
            billItems = [];

            displayBill();

            if (customerInput) {
                customerInput.value = "";
            }

        });

    }


    // ------------------------------------------
    // LOAD PREVIOUS TRANSACTIONS
    // ------------------------------------------

    const savedTransactions =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];


    console.log(
        "Previous Transactions:",
        savedTransactions
    );


});
// =====================================================
// MARKET BASKET ANALYSIS - FP-GROWTH
// =====================================================

async function runMarketBasket() {

    const support =
        Number(document.getElementById("minSupport").value);

    const confidence =
        Number(document.getElementById("minConfidence").value);

    const resultsDiv =
        document.getElementById("marketBasketResults");

    resultsDiv.innerHTML = `
        <p>⏳ Loading FP-Growth results...</p>
    `;

    try {

        const response =
            await fetch("http://localhost:8080/api/market-basket");

        if (!response.ok) {
            throw new Error("API connection failed");
        }

        const data =
            await response.json();

        const rules =
            data.associationRules || [];
            const itemsets =
    data.frequentItemsets || [];

const highestConfidence =
    rules.length > 0
        ? Math.max(...rules.map(rule => rule.confidence))
        : 0;

        const filteredRules =
            rules.filter(function(rule) {

                return (
                    rule.support >= support &&
                    rule.confidence >= confidence
                );

            });

        if (filteredRules.length === 0) {

            resultsDiv.innerHTML = `
                <div class="product-pair">
                    <h3>🔍 No Rules Found</h3>
                    <p>
                        Try lowering the support or confidence values.
                    </p>
                </div>
            `;

            return;
        }

        let html = `
            <h3>📊 FP-Growth Association Rules</h3>

            <div class="basket-results-grid">
        `;

        filteredRules.forEach(function(rule) {

            const antecedents =
                rule.antecedents.join(" + ");

            const consequents =
                rule.consequents.join(" + ");

            html += `
                <div class="product-pair">

                    <h3>
                        🛒 ${antecedents}
                        → ${consequents}
                    </h3>

                    <p>
                        Customers who buy
                        <strong>${antecedents}</strong>
                        may also buy
                        <strong>${consequents}</strong>.
                    </p>

                    <div class="confidence">
                        Support: ${rule.support}%
                    </div>

                    <div class="confidence">
                        Confidence: ${rule.confidence}%
                    </div>

                    <div class="confidence">
                        Lift: ${rule.lift}
                    </div>

                </div>
            `;

        });

        html += `
            </div>
        `;

        resultsDiv.innerHTML = html;

    } catch (error) {

        console.error(error);

        resultsDiv.innerHTML = `
            <div class="product-pair">

                <h3>❌ Connection Error</h3>

                <p>
                    Could not connect to the Java backend.
                    Make sure Spring Boot is running on port 8080.
                </p>

            </div>
        `;

    }
}