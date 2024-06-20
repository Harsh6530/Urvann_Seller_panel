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
def get_riders_with_product_count(seller_name):
    riders = df[df['Seller name'] == seller_name]['Rider code'].unique().tolist()
    riders_with_counts = []
    
    for rider_code in riders:
        products_count = len(df[(df['Seller name'] == seller_name) & (df['Rider code'] == rider_code)])
        riders_with_counts.append({
            'riderCode': rider_code,
            'productCount': products_count
        })
    
    return jsonify(riders_with_counts)

@app.route('/api/products', methods=['GET'])
def get_products():
    seller_name = request.args.get('seller_name')
    rider_code = request.args.get('rider_code')
    
    try:
        # Filter products based on seller_name and rider_code
        filtered_df = df[(df['Seller name'] == seller_name) & (df['Rider code'] == rider_code)]
        
        # Calculate the total quantity for each order code using the filtered DataFrame
        order_code_quantities = filtered_df.groupby('Order code')['Quantity'].sum().to_dict()
        
        # Convert the filtered DataFrame to a list of dictionaries
        products = filtered_df[['Order code', 'SKU', 'Name', 'Photolink', 'Quantity']].to_dict(orient='records')
        
        return jsonify({
            'orderCodeQuantities': order_code_quantities,
            'products': products
        })
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
