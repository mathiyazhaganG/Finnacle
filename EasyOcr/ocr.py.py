import matplotlib

matplotlib.use('Agg')  # Use the 'Agg' backend for server-side rendering
import matplotlib.pyplot as plt
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
import io
import base64
import easyocr
import os
import re
import torch
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId



@app.route('/ocrres', methods=['POST'])
def ocrres():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    
    import cv2
    img = cv2.imread(file_path)
    if img is None:
        return jsonify({"error": "Uploaded file is not a valid image or could not be read."}), 400

    user_id = request.form.get('user_id')
    user_object_id = ObjectId(user_id)

    reader = easyocr.Reader(['en'], gpu=True)
    result = reader.readtext(file_path)
    extracted_text = [text[1] for text in result]

    joined_text = ' '.join(extracted_text)

    # Extract date
    date_match = re.search(
        r"(?:DATE|DTE|Dale|Dt|Dat)?\s*[:\-]?\s*([0-9]{1,2})[\s\/\-]+([0-9]{1,2})[\s\/\-]+([0-9]{2,4})",
        joined_text, re.IGNORECASE)
    date = None
    if date_match:
        day, month, year = date_match.groups()
        day = day.zfill(2)
        month = month.zfill(2)
        year = '20' + year if len(year) == 2 else year
        date = f"{day}/{month}/{year}"

    # Extract amount
    amount_match = re.search(
        r"(Total|Tota1|Amount|Amouni|Amt)[\s:–-]*([\d\s,]*\.\s*\d{2})",
        joined_text, re.IGNORECASE)
    amount = None
    if amount_match:
        raw_amount = amount_match.group(2)
        amount = float(re.sub(r'[\s,]', '', raw_amount))

    if date_match:
        day, month, year = date_match.groups()
        day, month = day.zfill(2), month.zfill(2)
        year = '20' + year if len(year) == 2 else year
        parsed_date = datetime.strptime(f"{year}-{month}-{day}", "%Y-%m-%d")
    else:
        parsed_date = None

    return jsonify({
        "extracted_text": extracted_text,
        "date": parsed_date,
        "total_amount": amount,
        "user_id": user_id
    })
