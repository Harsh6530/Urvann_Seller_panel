from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import pandas as pd
import bcrypt
import logging

app = Flask(__name__)
CORS(app)

# Configure MongoDB connection
app.config['MONGO_URI'] = 'mongodb+srv://sharmaharsh634:urvann%401234@sellerlogin.cjywul3.mongodb.net/SellerLogin?retryWrites=true&w=majority'
mongo = PyMongo(app)

# Simple user schema for MongoDB
class User:
    def __init__(self, username, password):
        self.username = username
        self.password = password

# MongoDB collection
users_collection = mongo.db.Seller_login

@app.route('/api/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    # Check if username already exists
    if users_collection.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Insert new user into MongoDB
    user = User(username, hashed_password)
    users_collection.insert_one(user.__dict__)

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    # Find user by username
    user = users_collection.find_one({'username': username})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'token': str(user['_id'])}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# Load Excel data into pandas DataFrames from the correct sheets
df_seller = pd.read_excel('Seller.xlsx', sheet_name='Order data', engine='openpyxl')
df_products = pd.read_excel('Products.xlsx', sheet_name='Order data', engine='openpyxl')

# Simple user authentication data
user_data = {seller: f"{seller}@1234" for seller in df_seller['seller_name'].unique()}

@app.route('/api/sellers', methods=['GET'])
def get_sellers():
    unique_sellers = df_seller['seller_name'].unique().tolist()
    return jsonify(unique_sellers)

@app.route('/api/sellers/<seller_name>/riders', methods=['GET'])
def get_riders_with_product_count(seller_name):
    riders = df_seller[df_seller['seller_name'] == seller_name]['Driver Name'].unique().tolist()
    riders_with_counts = []
    
    for rider_code in riders:
        # Sum the quantities for each rider
        products_count = df_seller[(df_seller['seller_name'] == seller_name) & (df_seller['Driver Name'] == rider_code)]['total_item_quantity'].sum()
        
        # Convert products_count to int if it's an int64
        products_count = int(products_count)
        
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
        filtered_df = df_seller[(df_seller['seller_name'] == seller_name) & (df_seller['Driver Name'] == rider_code)]
        
        # Merge with df_products to get image1 based on SKU
        merged_df = pd.merge(filtered_df, df_products[['sku', 'image1']], left_on='line_item_sku', right_on='sku', how='left')
        
        # Calculate the total total_item_quantity for each Final using the filtered DataFrame
        order_code_quantities = merged_df.groupby('FINAL')['total_item_quantity'].sum().to_dict()
        
        # Convert the filtered DataFrame to a list of dictionaries
        products = merged_df[['FINAL', 'line_item_sku', 'line_item_name', 'image1', 'total_item_quantity']].to_dict(orient='records')
        
        return jsonify({
            'orderCodeQuantities': order_code_quantities,
            'products': products
        })
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
