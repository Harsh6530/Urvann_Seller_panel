from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)

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
    
    products = df[(df['Seller name'] == seller_name) & (df['Rider code'] == rider_code)][['SKU', 'Name', 'Photolink']].to_dict(orient='records')
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)
