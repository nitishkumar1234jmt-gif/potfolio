/* ================================================
           HARD CODED STOCK PRICES
           ================================================ */

        const stockPrices = {};


        /* ================================================
           STOCK NAMES
           ================================================ */

        const stockNames = {};


        /* ================================================
           PORTFOLIO
           ================================================ */

        let portfolio = {};


        /* ================================================
           GET ELEMENTS
           ================================================ */

        const stockForm =
            document.getElementById(
                "stockForm"
            );

        const stockSelect =
            document.getElementById(
                "stockSelect"
            );

        const quantityInput =
            document.getElementById(
                "quantity"
            );

        const portfolioBody =
            document.getElementById(
                "portfolioBody"
            );

        const totalInvestment =
            document.getElementById(
                "totalInvestment"
            );

        const totalStocks =
            document.getElementById(
                "totalStocks"
            );

        const totalShares =
            document.getElementById(
                "totalShares"
            );

        const heroValue =
            document.getElementById(
                "heroValue"
            );

        const message =
            document.getElementById(
                "message"
            );

        const downloadBtn =
            document.getElementById(
                "downloadBtn"
            );


        /* ================================================
           ADD STOCK
           ================================================ */

        stockForm.addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                const stock =
                    stockSelect.value;


                const quantity =
                    parseInt(
                        quantityInput.value
                    );


                if (!stock) {

                    showMessage(
                        "Please select a stock.",
                        "error"
                    );

                    return;
                }


                if (
                    !quantity ||
                    quantity <= 0
                ) {

                    showMessage(
                        "Please enter a valid quantity.",
                        "error"
                    );

                    return;
                }


                try {
                    const response = await fetch("/api/portfolio", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ symbol: stock, quantity })
                    });
                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || "Unable to add stock.");
                    }

                    await refreshPortfolio();
                    showMessage(result.message, "success");
                    stockForm.reset();
                } catch (error) {
                    showMessage(error.message || "Could not reach the server.", "error");
                }

            }
        );


        /* ================================================
           UPDATE PORTFOLIO
           ================================================ */

        function updatePortfolio() {

            portfolioBody.innerHTML = "";


            let total = 0;

            let shares = 0;

            let stocks = 0;


            if (
                Object.keys(portfolio)
                .length === 0
            ) {

                portfolioBody.innerHTML = `

                    <tr>

                        <td colspan="5">

                            <div class="empty">

                                <div class="empty-icon">
                                    📊
                                </div>

                                <h3>
                                    Your portfolio is empty
                                </h3>

                                <p>
                                    Add stocks above to start
                                    tracking your investment.
                                </p>

                            </div>

                        </td>

                    </tr>

                `;


                updateSummary(
                    0,
                    0,
                    0
                );

                return;
            }


            for (
                let stock in portfolio
            ) {

                const quantity =
                    portfolio[stock];


                const price =
                    stockPrices[stock];


                const investment =
                    price * quantity;


                total += investment;

                shares += quantity;

                stocks++;


                const row =
                    document.createElement(
                        "tr"
                    );


                row.classList.add(
                    "fade-in"
                );


                row.innerHTML = `

                    <td>

                        <span class="stock-name">
                            ${stockNames[stock]}
                        </span>

                        <span class="stock-symbol">
                            ${stock}
                        </span>

                    </td>


                    <td>
                        ₹${price.toLocaleString()}
                    </td>


                    <td>
                        ${quantity}
                    </td>


                    <td class="value">
                        ₹${investment.toLocaleString()}
                    </td>


                    <td>

                        <button
                            class="delete-btn"
                            onclick="
                                removeStock('${stock}')
                            "
                        >

                            Remove

                        </button>

                    </td>

                `;


                portfolioBody.appendChild(
                    row
                );

            }


            updateSummary(
                total,
                stocks,
                shares
            );

        }


        /* ================================================
           UPDATE SUMMARY
           ================================================ */

        function updateSummary(
            total,
            stocks,
            shares
        ) {

            animateNumber(
                totalInvestment,
                total
            );


            animateNumber(
                heroValue,
                total
            );


            totalStocks.textContent =
                stocks;


            totalShares.textContent =
                shares;

        }


        /* ================================================
           NUMBER ANIMATION
           ================================================ */

        function animateNumber(
            element,
            target
        ) {

            const duration = 500;

            const start = 0;

            const startTime =
                performance.now();


            function animation(
                currentTime
            ) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed /
                        duration,
                        1
                    );


                const value =
                    Math.floor(
                        start +
                        (target - start) *
                        progress
                    );


                element.textContent =
                    value.toLocaleString();


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        animation
                    );

                }

            }


            requestAnimationFrame(
                animation
            );

        }


        /* ================================================
           REMOVE STOCK
           ================================================ */

        async function removeStock(
            stock
        ) {
            try {
                const response = await fetch(
                    "/api/portfolio/" + encodeURIComponent(stock),
                    { method: "DELETE" }
                );
                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Unable to remove stock.");
                }

                await refreshPortfolio();
                showMessage(result.message, "success");
            } catch (error) {
                showMessage(error.message || "Could not reach the server.", "error");
            }

        }


        /* ================================================
           MESSAGE
           ================================================ */

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;


            message.className =
                "message " +
                type;


            setTimeout(
                function() {

                    message.textContent =
                        "";

                    message.className =
                        "message";

                },
                2500
            );

        }


        /* ================================================
           DOWNLOAD REPORT
           ================================================ */

        downloadBtn.addEventListener(
            "click",
            function() {


                if (
                    Object.keys(portfolio)
                    .length === 0
                ) {

                    showMessage(
                        "Add at least one stock before downloading.",
                        "error"
                    );

                    return;
                }


                let report = "";


                report +=
                    "====================================\n";

                report +=
                    "       STOCKVAULT PORTFOLIO\n";

                report +=
                    "====================================\n\n";


                report +=
                    "STOCK PORTFOLIO REPORT\n";

                report +=
                    "------------------------------------\n";


                let total = 0;


                for (
                    let stock in portfolio
                ) {

                    const quantity =
                        portfolio[stock];


                    const price =
                        stockPrices[stock];


                    const investment =
                        price *
                        quantity;


                    total +=
                        investment;


                    report +=
                        "Stock      : " +
                        stockNames[stock] +
                        " (" +
                        stock +
                        ")\n";


                    report +=
                        "Price      : ₹" +
                        price +
                        "\n";


                    report +=
                        "Quantity   : " +
                        quantity +
                        "\n";


                    report +=
                        "Investment : ₹" +
                        investment +
                        "\n";


                    report +=
                        "------------------------------------\n";

                }


                report +=
                    "\nTOTAL INVESTMENT: ₹" +
                    total +
                    "\n";


                report +=
                    "\nGenerated by StockVault\n";


                const blob =
                    new Blob(
                        [report],
                        {
                            type:
                                "text/plain"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    "stock-portfolio-report.txt";


                link.click();


                URL.revokeObjectURL(
                    url
                );


                showMessage(
                    "Report downloaded successfully!",
                    "success"
                );

            }
        );


        /* ================================================
           STOCK CARD CLICK
           ================================================ */

        const stockCards =
            document.querySelectorAll(
                ".stock-card"
            );


        stockCards.forEach(
            function(card) {

                card.addEventListener(
                    "click",
                    function() {

                        const stock =
                            card.dataset.stock;


                        stockSelect.value =
                            stock;


                        quantityInput.focus();


                        document
                            .querySelector(
                                ".workspace"
                            )
                            .scrollIntoView({
                                behavior:
                                    "smooth"
                            });

                    }
                );

            }
        );


        /* ================================================
           INITIALIZE
           ================================================ */

        async function refreshPortfolio() {
            const response = await fetch("/api/portfolio");
            if (!response.ok) {
                throw new Error("Unable to load your portfolio.");
            }

            const result = await response.json();
            portfolio = Object.fromEntries(
                result.portfolio.map(item => [item.symbol, item.quantity])
            );
            updatePortfolio();
        }

        async function initialize() {
            try {
                const response = await fetch("/api/stocks");
                if (!response.ok) {
                    throw new Error("Unable to load available stocks.");
                }

                const stocks = await response.json();
                Object.entries(stocks).forEach(([symbol, stock]) => {
                    stockPrices[symbol] = stock.price;
                    stockNames[symbol] = stock.name;
                });

                await refreshPortfolio();
            } catch (error) {
                showMessage(error.message || "Could not reach the server.", "error");
            }
        }

        initialize();