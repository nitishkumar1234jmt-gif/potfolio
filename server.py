from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Hardcoded stock prices
STOCKS = {
    "AAPL": {"name": "Apple Inc.", "price": 180},
    "TSLA": {"name": "Tesla", "price": 250},
    "GOOGL": {"name": "Alphabet", "price": 140},
    "MSFT": {"name": "Microsoft", "price": 420},
    "AMZN": {"name": "Amazon", "price": 190}
}

portfolio = {}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/stocks")
def get_stocks():
    return jsonify(STOCKS)


@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    result = []

    total = 0
    shares = 0

    for symbol, quantity in portfolio.items():

        stock = STOCKS[symbol]
        investment = stock["price"] * quantity

        result.append({
            "symbol": symbol,
            "name": stock["name"],
            "price": stock["price"],
            "quantity": quantity,
            "investment": investment
        })

        total += investment
        shares += quantity

    return jsonify({
        "portfolio": result,
        "total": total,
        "shares": shares
    })


@app.route("/api/portfolio", methods=["POST"])
def add_stock():

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "Invalid request body"
        }), 400

    symbol = data.get("symbol", "")
    if not isinstance(symbol, str):
        symbol = ""
    symbol = symbol.upper().strip()
    quantity = data.get("quantity", 0)

    if symbol not in STOCKS:
        return jsonify({
            "success": False,
            "message": "Stock not found"
        }), 400

    try:
        if isinstance(quantity, bool):
            raise ValueError
        quantity = int(quantity)

        if quantity <= 0:
            raise ValueError

    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Quantity must be greater than 0"
        }), 400

    if symbol in portfolio:
        portfolio[symbol] += quantity
    else:
        portfolio[symbol] = quantity

    return jsonify({
        "success": True,
        "message": "Stock added successfully"
    })


@app.route("/api/portfolio/<symbol>", methods=["DELETE"])
def remove_stock(symbol):

    symbol = symbol.upper()

    if symbol in portfolio:
        del portfolio[symbol]

        return jsonify({
            "success": True,
            "message": "Stock removed"
        })

    return jsonify({
        "success": False,
        "message": "Stock not found"
    }), 404


if __name__ == "__main__":

    print("========================================")
    print("      STOCKVAULT PORTFOLIO TRACKER")
    print("========================================")
    print("Server running at:")
    print("http://127.0.0.1:5000")
    print("========================================")

    app.run(debug=True)