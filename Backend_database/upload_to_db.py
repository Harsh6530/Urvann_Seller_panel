import os
from flask import Flask, request, jsonify
import pandas as pd
from pymongo import MongoClient

app = Flask(__name__)

# Connect to MongoDB
client = MongoClient('mongodb+srv://sambhav:UrvannGenie01@urvanngenie.u7r4o.mongodb.net/?retryWrites=true&w=majority&appName=UrvannGenie')  # Replace with your MongoDB connection URI
db = client['UrvannSellerApp']  # Connect to the database
collection = db['photos']  # Connect to the collection

@app.route('/photos/upload', methods=['POST'])
def upload_photos():
    # Specify the path to Products.xlsx
    excel_file_path = 'Products.xlsx'  # Replace with the actual path
    
    if not os.path.isfile(excel_file_path):
        return jsonify({'error': f"File not found: {excel_file_path}"}), 404
    
    # Read Excel file into a pandas DataFrame
    df = pd.read_excel(excel_file_path)
    
    # Iterate over each row in the DataFrame
    for index, row in df.iterrows():
        name = row['name']
        sku = row['sku']
        image_url = row['image1']
        
        # Insert photo data into MongoDB collection
        photo_data = {
            'name': name,
            'sku': sku,
            'image_url': image_url
        }
        collection.insert_one(photo_data)
    
    return jsonify({'message': 'Photos uploaded successfully'}), 200

if __name__ == '__main__':
    # Run Flask app
    app.run(debug=True)
