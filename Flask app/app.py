from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)

# Load data from Excel file
df = pd.read_excel('Seller.xlsx', sheet_name='Inputs', engine='openpyxl')

@app.route('/api/sellers', methods=['GET'])
def get_sellers():
    unique_sellers = df['Seller name'].unique().tolist()
    return jsonify(unique_sellers)

@app.route('/api/sellers/<seller_name>/riders', methods=['GET'])
def get_rider_codes(seller_name):
    filtered_df = df[df['Seller name'] == seller_name]
    unique_riders = filtered_df['Rider code'].unique().tolist()
    return jsonify(unique_riders)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
