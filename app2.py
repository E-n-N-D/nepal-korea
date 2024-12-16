import imaplib
import email
from email.policy import default
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from bs4 import BeautifulSoup
import redis

from http.server import BaseHTTPRequestHandler, HTTPServer
import logging
from urllib.parse import parse_qs
import json
from flask import Flask, request

hostName = "localhost"
serverPort = 8333

app = Flask(__name__)

r = redis.Redis(
  host='redis-16505.c275.us-east-1-4.ec2.redns.redis-cloud.com',
  port=16505,
  password='ksO4AVeHb7zphyqOik3mrU3ht2LHptvj')

# r = redis.Redis(host='localhost', port=6379, db=0)

# checking redis connection
try:
    r.ping()
except redis.ConnectionError:
    print("Redis server is not reachable")

# Fetch OTP from Gmail
def fetch_otp_from_gmail(user, password):
    host = "imap.gmail.com"

    mail = imaplib.IMAP4_SSL(host)
    mail.login(user, password)
    mail.select("inbox")

    status, messages = mail.search(
        None,
        # "(UNSEEN)",
        "(FROM {0})".format("consul-rok@g4k.go.kr".strip()),
        '(SUBJECT "[Consular Services 24] Non-member Email Login Authentication.")',
    )
    email_ids = messages[0].split()

    for email_id in list(reversed(email_ids)):
        status, data = mail.fetch(email_id, "(RFC822)")
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email, policy=default)
        content = get_text_from_message(msg)
        otp = extract_otp(content)
        mail.logout()
        return otp

    mail.logout()
    return None

def get_text_from_message(msg):
    if msg.is_multipart():
        for part in msg.iter_parts():
            if part.get_content_type() == "text/plain":
                return part.get_payload(decode=True).decode()
    else:
        return msg.get_payload(decode=True).decode()
    return ""


def extract_otp(content):
    soup = BeautifulSoup(content.replace("\t", ""), "html.parser")
    parsed_text = soup.get_text()
    print(parsed_text)
    # Implement a more robust extraction logic
    otp = ""
    keyword = "below.Vertification number"
    start = parsed_text.find(keyword) + len(keyword)
    if start != -1:
        otp = parsed_text[start : start + 5]  # assuming OTP length is 6
    return otp


def post_actions(data):

    if "email" in data and "password" in data:
        print(data["email"])
        print(data["password"])

        # Fetch OTP from Gmail
        otp = fetch_otp_from_gmail(user=data["email"], password=data["password"])

        print("OTP is " + otp)

        if otp:
            return {
                "response": 200,
                "otp": otp,
                "success": True,
            }
        else:
            return {
                "response": 404,
                "error": "No OTP found.",
                "success": False,
            }
    else:
        return {
            "response": 400,
            "error": "Email & Password both required.",
            "success": False,
        }


@app.route("/redis/", methods=["DELETE"])
def redis_flush_all_data():
    try:
        r.flushdb()
        return {"success": True}
    except redis.ConnectionError:
        return {"error": "Could not connect to Redis"}, 500

@app.route("/redis/cookie/", methods=["POST"])
def redis_set_cookie():
    try:
        rcv_data = json.loads(request.data.decode(encoding="utf-8"))
        key = rcv_data["key"]
        full_key = f"cookie_{key}"
        value = rcv_data["value"]
        r.set(full_key, value)
        return {"success": True}
    except redis.ConnectionError:
        return {"error": "Could not connect to Redis"}, 500
    except Exception as e:
        return {"error": str(e)}, 400

@app.route("/redis/cookie/<key>", methods=["GET"])
def redis_get_cookie(key):
    try:
        full_key = f"cookie_{key}"
        if r.exists(full_key):
            value = r.get(full_key).decode("utf-8")
            return {"success": True, "key": key, "value": value}
        else:
            return {"success": False}, 404
    except redis.ConnectionError:
        return {"error": "Could not connect to Redis"}, 500

@app.route("/test-credentials", methods=["POST"])
def test_credentials():
    if request.data:
        rcv_data = json.loads(request.data.decode(encoding="utf-8"))
        user = rcv_data["email"]
        password = rcv_data["password"]
        try:
            host = "imap.gmail.com"
            mail = imaplib.IMAP4_SSL(host)
            mail.login(user, password)
            return {"success": True}
        except:
            return {"success": False}
    else:
        return "404"

@app.route("/fetch-gmail-otp", methods=["POST"])
def fetch_gmail_otp():
    if request.data:
        rcv_data = json.loads(request.data.decode(encoding="utf-8"))
        rsp = post_actions(rcv_data)

        if rsp:
            return rsp
        else:
            return "200"
    else:
        return "404"


if __name__ == "__main__":
    app.run(host=hostName, port=serverPort)
