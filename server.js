const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json"); // arahkan ke lokasi serviceAccountKey.json

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://imos-unwiku-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();
const api_key = "{api_key_here}";

// Daftar asal yang diizinkan
const allowedOrigins = [
  'http://localhost:9000',
  'https://xxx.web.app', // Tambahkan asal lain yang diizinkan
  'http://another-origin.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Untuk kompatibilitas dengan beberapa browser
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Endpoint untuk mengirim notifikasi via device token
app.post('/sendNotificationToDevice', (req, res) => {
  const { key, title, body, token } = req.body;

  if (key == api_key) {
    const message = {
    notification: {
      title: title,
      body: body
    },
    token: token // Device token yang akan menerima notifikasi
    };

    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
        res.status(200).send('Successfully sent message');
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
      });
  } else {
    console.error('Error sending message: wrong api_key');
    res.status(500).send('Wrong api key');
  }
  
});

// Endpoint untuk mengirim notifikasi via device token
app.post('/sendNotificationToTopic', (req, res) => {
  const {key, title, body, topic } = req.body;

  if (key == api_key) {
    const message = {
      notification: {
        title: title,
        body: body
      },
      topic: topic // Device token yang akan menerima notifikasi
    };

    admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
        res.status(200).send('Successfully sent message');
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message');
      });
  } else {
    console.error('Error sending message: wrong api_key');
    res.status(500).send('Wrong api key');
  }
});

// Endpoint untuk mengirim notifikasi via topic dan menyimpan ke Firestore
app.post('/sendNotificationToTopicSaveFirestore', (req, res) => {
  const {key, title, device_id, topic } = req.body;
  let body = "";

  if (key == api_key) {
    // Mendapatkan data dari collection 'patients' dengan device_id yang sesuai
    admin.firestore().collection('patient')
      .where('device_id', '==', device_id)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          throw new Error('No matching documents.');
        }
        
        // Ambil data dari dokumen pertama (asumsikan hanya ada satu pasien dengan device_id unik)
        const data = snapshot.docs[0].data();

        // Membuat pesan berdasarkan judul notifikasi
        if (title === "INFUS TERSUMBAT") {
          body = `Infus pada pasien bernama ${data.name} berada di ruangan ${data.room} nomor kasur ${data.bed_number}, Tersumbat!`;
        } else if (title === "INFUS SEGERA HABIS") {
          body = `Infus pada pasien bernama ${data.name} berada di ruangan ${data.room} nomor kasur ${data.bed_number}, Segera Habis!`;
        } else {
          body = `Infus pada pasien bernama ${data.name} berada di ruangan ${data.room} nomor kasur ${data.bed_number}`;
        }

        const message = {
          notification: {
            title: title,
            body: body
          },
          topic: topic
        };

        // Kirim pesan menggunakan Firebase Messaging
        return admin.messaging().send(message);
      })
      .then((response) => {
        // Simpan informasi notifikasi ke Firestore collection 'notifications'
        const notificationData = {
          status: 'unread',
          title: title,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          message: body,
          device_id: device_id
        };

        return admin.firestore().collection('notifications').add(notificationData);
      })
      .then((docRef) => {
        res.status(200).send('Successfully sent message and saved notification: ' + docRef.id);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        res.status(500).send('Error sending message: ' + error.message);
      });
  } else {
    console.error('Error sending message: wrong api_key');
    res.status(500).send('Wrong api key');
  }
});

// Endpoint untuk subscribe ke topic
app.post('/subscribe', async (req, res) => {
  const { key, token } = req.body;
  if (key == api_key) {
    try {
      await admin.messaging().subscribeToTopic(token, 'imos-alert');
      res.status(200).send('Successfully subscribed to topic');
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      res.status(500).send('Error subscribing to topic');
    }
  } else {
    console.error('Error sending message: wrong api_key');
    res.status(500).send('Wrong api key');
  }
});

// Endpoint root untuk memastikan server berjalan
app.get('/', (req, res) => {
  res.send('Error 403 <br> Directory access is forbidden.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
