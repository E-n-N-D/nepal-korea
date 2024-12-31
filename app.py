import imaplib
import email
from email.policy import default
from bs4 import BeautifulSoup
import json
from flask import Flask, request

app = Flask(__name__)

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
    app.run()
