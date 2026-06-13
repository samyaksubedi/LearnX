import requests

node_webhook_url = "http://localhost:3000/api/webhooks/conversation-status"

WEBHOOK_SECRET = "fuckyou6969"  # Placeholder for testing


def update_conversation_status(conversation_id, status, error_message=None):
    try:
        response = requests.post(
            node_webhook_url,
            json={
                "status": status,
                "conversationId": conversation_id,
                "errorMessage": error_message,
            },
            headers={
                "x-webhook-secret": WEBHOOK_SECRET,
            },
            timeout=10,
        )

        # print("Status:", response.status_code)
        # print("Response body:", response.text)

        response.raise_for_status()

        return response.json()

    except requests.exceptions.HTTPError:
        print("Status:", response.status_code)
        print("Response body:", response.text)

    except Exception as e:
        print("Error:", e)


# update_conversation_status("e2bbf1ae-9296-4104-8769-607620a56139", "ready")
