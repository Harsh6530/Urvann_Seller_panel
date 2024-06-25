from flask import Flask, request, jsonify
import pandas as pd
from pymongo import MongoClient

app = Flask(__name__)

def upload_excel_to_mongodb(file, mongo_url, database_name, collection_name):
    try:
        # Read the file into a pandas DataFrame
        df = pd.read_excel(file)
        
        # Convert DataFrame to a list of dictionaries
        data = df.to_dict(orient='records')
        
        # Connect to MongoDB
        client = MongoClient(mongo_url)
        db = client[database_name]
        collection = db[collection_name]
        
        # Insert data into MongoDB
        collection.insert_many(data)
        
        return {"message": "Data uploaded successfully!"}
    
    except Exception as e:
        return {"error": str(e)}

@app.route('/upload', methods=['POST'])
def upload_data():
    # Check if a file is in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    mongo_url = 'mongodb+srv://sambhav:UrvannGenie01@urvanngenie.u7r4o.mongodb.net/?retryWrites=true&w=majority&appName=UrvannGenie'  # Update this with your MongoDB connection string if needed
    database_name = 'UrvannSellerApp'
    collection_name = 'photos'
    
    result = upload_excel_to_mongodb(file, mongo_url, database_name, collection_name)
    
    if "error" in result:
        return jsonify(result), 500
    
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
