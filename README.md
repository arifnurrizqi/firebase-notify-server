# Firebase Notification Server API

This is a Express.js application that provides an API to send notifications via Firebase Cloud Messaging (FCM) to devices and topics. The application is designed to be deployed on Vercel.

## Features

- Send notifications to a specific device using its device token.
- Send notifications to a topic.
- Subscribe a device to a topic.

## Getting Started

### Prerequisites

- Node.js and npm installed on your local machine.
- Firebase project set up with Cloud Messaging enabled.
- Service account JSON file downloaded from your Firebase project settings.

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Place your Firebase service account JSON file in the project root and rename it to `firebaseServiceAccount.json`.

4. Create a `.env` file in the project root and add your Firebase database URL:
    ```plaintext
    DATABASE_URL=https://your-firebase-database-url
    ```

### Running the Server

To run the server locally:
```bash
node server.js
```

### Deployment
To deploy the server to Vercel:

### Install Vercel CLI:

```bash
npm install -g vercel
Login to Vercel:
```

```bash
vercel login
```

### Deploy the project:

```bash
vercel --prod
```

### API Endpoints
Send Notification to Device

#### URL: /sendNotificationToDevice
- Method: POST
- Request Body:
```json
{
  "title": "Notification Title",
  "body": "Notification Body",
  "token": "device_token"
}
```
Response:
200 OK on success,
500 Internal Server Error on failure
Send Notification to Topic

#### URL: /sendNotificationToTopic
- Method: POST
- Request Body:
```json
{
  "title": "Notification Title",
  "body": "Notification Body",
  "topic": "topic_name"
}
```
Response:
200 OK on success,
500 Internal Server Error on failure
Subscribe to Topic

#### URL: /subscribe
- Method: POST
- Request Body:
```json
{
  "token": "device_token"
}
```
Response:
200 OK on success,
500 Internal Server Error on failure

### Example Frontend Integration
Below is an example of how to request notification permission and subscribe a device to a topic using the frontend:

```javascript
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'your-vapid-key' });
      console.log('FCM Registration Token:', token);
      
      await fetch('https://your-vercel-url/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
      .then(response => response.text())
      .then(text => {
        console.log('Successfully subscribed to topic:', text);
      })
      .catch(error => {
        console.error('Error subscribing to topic:', error);
      });
    } else {
      console.error('Notification permission not granted');
    }
  } catch (error) {
    console.error('Error getting notification permission or token', error);
  }
};
```
Make sure to replace placeholders like `your-username`, `your-repo-name`, `your-firebase-database-url`, and `your-vapid-key` with your actual values. This `README.md` provides an overview of the project, instructions for setup, and usage examples for the API endpoints.

License
This project is licensed under the MIT License - see the LICENSE file for details.
