from flask import Flask, jsonify, request
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load Excel data into a pandas DataFrame
df = pd.read_excel('Seller.xlsx', sheet_name='Inputs', engine='openpyxl')

@app.route('/api/sellers', methods=['GET'])
def get_sellers():
    unique_sellers = df['Seller name'].unique().tolist()
    return jsonify(unique_sellers)

@app.route('/api/sellers/<seller_name>/riders', methods=['GET'])
def get_rider_codes(seller_name):
    rider_codes = df[df['Seller name'] == seller_name]['Rider code'].unique().tolist()
    return jsonify(rider_codes)

@app.route('/api/products', methods=['GET'])
def get_products():
    seller_name = request.args.get('seller_name')
    rider_code = request.args.get('rider_code')
    
    print(f"Received request for seller_name: {seller_name}, rider_code: {rider_code}")
    
    try:
        # Filter products based on seller_name and rider_code
        products = df[(df['Seller name'] == seller_name) & (df['Rider code'] == rider_code)][['SKU', 'Name', 'Photolink', 'Quantity']].to_dict(orient='records')
        
        if not products:
            print(f"No products found for seller_name: {seller_name}, rider_code: {rider_code}")
            return jsonify({'error': 'Products not found for the given seller_name and rider_code'}), 404
        
        return jsonify(products)
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
