import imaplib
import email
from email.header import decode_header
from email.policy import default
from bs4 import BeautifulSoup

# Email server settings (adjust these based on your email provider)
IMAP_SERVER = "imap.gmail.com"  # Example for Gmail
IMAP_PORT = 993

# Your email credentials
# EMAIL_ACCOUNT = "kortest77@gmail.com"
# PASSWORD = "spgs qril pbvl hwzk"

EMAIL_ACCOUNT = "bookinga201@gmail.com"
PASSWORD = "hghg ccda uyim iroa"


# Connect to the IMAP server
def get_email_by_index(index):
    # Establish a connection to the mail server
    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
    
    # Login to the email account
    mail.login(EMAIL_ACCOUNT, PASSWORD)
    
    # Select the mailbox you want to check (in this case, INBOX)
    mail.select("inbox")

    # Search for all emails
    status, messages = mail.search(None, 'ALL')  # You can use 'UNSEEN' for unread messages only
    
    # Get the list of email IDs
    email_ids = messages[0].split()
    
    # Make sure the index is valid (i.e., there are enough emails in the inbox)
    if len(email_ids) < index:
        print(f"There are not enough emails in your inbox to fetch the {index}th one.")
        mail.logout()
        return

    # Get the email ID at the specified index (index - 1 because lists are 0-indexed)
    email_id = email_ids[-index]

    # Fetch the email by ID
    status, msg_data = mail.fetch(email_id, "(RFC822)")

    # Process the email content
    for response_part in msg_data:
        if isinstance(response_part, tuple):
            msg = email.message_from_bytes(response_part[1])

            # Decode email subject
            subject, encoding = decode_header(msg["Subject"])[0]
            if isinstance(subject, bytes):
                subject = subject.decode(encoding if encoding else "utf-8")

            # Get the email date
            date = msg.get("Date")
            
            # Print the email details
            print(f"Subject: {subject}")
            print(f"Date: {date}")
        

    # Logout and close the connection
    mail.close()
    mail.logout()

# Call the function to fetch the 2nd email (you can change the number to 3 for the 3rd email)

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
        print(f"OTP: {otp}")
        break

    mail.logout()

fetch_otp_from_gmail(EMAIL_ACCOUNT, PASSWORD)

# for i in range(5):
#     get_email_by_index(i)
# get_email_by_index(1)
