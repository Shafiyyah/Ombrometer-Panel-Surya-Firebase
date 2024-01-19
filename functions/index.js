/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {setGlobalOptions} = require("firebase-functions/v2");

setGlobalOptions({
  maxInstances: 5,
  timeoutSeconds: 120,
});

const functions = require('firebase-functions');
const cors = require('cors');

const express = require('express'); // Rest API

const moment = require('moment')

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  serviceAccountId:'firebase-adminsdk-f1t4w@ombrometerlora.iam.gserviceaccount.com',
});
const db = admin.firestore();

const Ombrometer = express();

var CRC32 = require("crc-32");

const { filesUpload } = require("./middleware");

const FieldValue = require('firebase-admin').firestore.FieldValue;


Ombrometer.post("/periodic/:id", async (req,res) => {
  await db.collection('Ombrometer').doc(req.params.id).update(req.body)
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()
  // await db.collection('Ombrometer').doc(req.params.id).update({
  //   resetDevice:0
  // })
  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD}`)

})

Ombrometer.post("/periodicOTA/:id", async (req,res) => {
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()
  await db.collection('Ombrometer').doc(req.params.id).update({
    resetDevice:0,
    ...req.body
  })
  
  if (parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("DD"))!=parseInt(moment.unix(req.body.Timestamp).utcOffset(7).format("DD"))) {
    await db.collection('Ombrometer').doc(req.params.id).collection('report').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM-DD")).set({
      RainRate:req.body.RainRateDay,
      day:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("DD")),
      month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    })
    await db.collection('Ombrometer').doc(req.params.id).collection('reportMonthly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM")).update({
      RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
      month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    }).catch(async()=> {
      await db.collection('Ombrometer').doc(req.params.id).collection('reportMonthly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM")).set({
        RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
        month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
        year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
      })
    })
    await db.collection('Ombrometer').doc(req.params.id).collection('reportYearly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY")).update({
      RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    }).catch(async()=> {
      await db.collection('Ombrometer').doc(req.params.id).collection('reportYearly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY")).set({
        RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
        year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
      })
    })
  }
  
  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD},${setting.data().resetDevice},${setting.data().newVersion}`)

})

Ombrometer.post("/periodicOTALoRa/:id", async (req,res) => {
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()
  await db.collection('Ombrometer').doc(req.params.id).update({
    resetDevice:0,
    ...req.body
  })
  
  if (parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("DD"))!=parseInt(moment.unix(req.body.Timestamp).utcOffset(7).format("DD"))) {
    await db.collection('Ombrometer').doc(req.params.id).collection('report').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM-DD")).set({
      RainRate:req.body.RainRateDay,
      day:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("DD")),
      month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    })
    await db.collection('Ombrometer').doc(req.params.id).collection('reportMonthly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM")).update({
      RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
      month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    }).catch(async()=> {
      await db.collection('Ombrometer').doc(req.params.id).collection('reportMonthly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY-MM")).set({
        RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
        month:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("MM")),
        year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
      })
    })
    await db.collection('Ombrometer').doc(req.params.id).collection('reportYearly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY")).update({
      RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
      year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
    }).catch(async()=> {
      await db.collection('Ombrometer').doc(req.params.id).collection('reportYearly').doc(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY")).set({
        RainRate:FieldValue.increment(parseFloat(req.body.RainRateDay)),
        year:parseInt(moment.unix(setting.data().Timestamp).utcOffset(7).format("YYYY"))
      })
    })
  }
  
  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD},${setting.data().resetDevice},${setting.data().newVersion},${setting.data().LoRa[0]},${setting.data().LoRa[1]},${setting.data().LoRa[2]},${setting.data().LoRa[3]},${setting.data().LoRa[4]},${setting.data().LoRa[5]},${setting.data().LoRa[6]}`)

})

Ombrometer.post("/Rain_start/:id", async (req,res) => {
  await db.collection('Ombrometer').doc(req.params.id).update(req.body)
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()

  let UIDs =[]
  await db.collection('user').where('ombrometerIDs','array-contains',req.params.id).get().then((snapshot)=> {
    snapshot.forEach((doc)=> {
      UIDs.push(doc.id)
    })
  })

  //Mengambil token notifikasi yang teregistrasi
  let registrationTokens=[]
  for (let i=0; i<UIDs.length; i++) {
    await db.collection('user').doc(UIDs[i]).collection('notifToken').get().then((snapshot)=>{
      snapshot.forEach((doc) => {
          registrationTokens.push(doc.data().token)
      })
    })
  }
  
  //Data yang dikirim sebagai notifikasi
  const message = {
    data: {
      title: `${setting.data().station}`, 
      body: `Hujan terjadi di ${setting.data().station}`, 
    },
    tokens: registrationTokens,
    webpush: {
      headers: {
        "Urgency": "high",
        "TTL":"4500"
      },
      fcmOptions: {
          link: "https://ombrometerlora.web.app/#/login"
      }
      },
    };

    //Mengirim Notifikasi
    admin.messaging().sendMulticast(message)
        .then((response) => {
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
            }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }
    });
  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD}`)
})

Ombrometer.post("/Rain_alert/:id", async (req,res) => {
  await db.collection('Ombrometer').doc(req.params.id).update(req.body)
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()
  let UIDs =[]
  await db.collection('user').where('ombrometerIDs','array-contains',req.params.id).get().then((snapshot)=> {
    snapshot.forEach((doc)=> {
      UIDs.push(doc.id)
    })
  })

  //Mengambil token notifikasi yang teregistrasi
  let registrationTokens=[]
  for (let i=0; i<UIDs.length; i++) {
    await db.collection('user').doc(UIDs[i]).collection('notifToken').get().then((snapshot)=>{
      snapshot.forEach((doc) => {
          registrationTokens.push(doc.data().token)
      })
    })
  }
  
  //Data yang dikirim sebagai notifikasi
  const message = {
    data: {
      title: `${setting.data().station}`, 
      body: `Hujan di ${setting.data().station} melebihi ${setting.data().alert} mm`, 
    },
    tokens: registrationTokens,
    webpush: {
      headers: {
        "Urgency": "high",
        "TTL":"4500"
      },
      fcmOptions: {
          link: "https://ombrometerlora.web.app/#/login"
      }
      },
    };

    //Mengirim Notifikasi
    admin.messaging().sendMulticast(message)
        .then((response) => {
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
            }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }
    });

  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD}`)
})

Ombrometer.post("/IO/:id", async (req,res) => {
  await db.collection('Ombrometer').doc(req.params.id).update(req.body)
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()

  let UIDs =[]
  await db.collection('user').where('ombrometerIDs','array-contains',req.params.id).get().then((snapshot)=> {
    snapshot.forEach((doc)=> {
      UIDs.push(doc.id)
    })
  })

  //Mengambil token notifikasi yang teregistrasi
  let registrationTokens=[]
  for (let i=0; i<UIDs.length; i++) {
    await db.collection('user').doc(UIDs[i]).collection('notifToken').get().then((snapshot)=>{
      snapshot.forEach((doc) => {
          registrationTokens.push(doc.data().token)
      })
    })
  }

  let waterLevel=0;
  for (let i=0; i<7; i++) {
    if  (req.body.IO[i]=="48" || req.body.IO[i]=="0") {
      waterLevel=i+1;
    }
  }
  
  
  //Data yang dikirim sebagai notifikasi
  const message = {
    data: {
      title: `${setting.data().station}`, 
      body: `Terjadi perubahan Water Level di ${setting.data().station} menjadi level ${waterLevel}`, 
    },
    tokens: registrationTokens,
    webpush: {
      headers: {
        "Urgency": "high",
        "TTL":"4500"
      },
        fcmOptions: {
            link: "https://ombrometerlora.web.app/#/login"
        }
      },
    };

    //Mengirim Notifikasi
    admin.messaging().sendMulticast(message)
        .then((response) => {
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
            }
            });
            console.log('List of tokens that caused failures: ' + failedTokens);
        }
    });

  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD}`)
})

Ombrometer.post("/IOLoRa/:id", async (req,res) => {
  await db.collection('Ombrometer').doc(req.params.id).update({
    TimeIOLoRa:req.body.TimeIO,
    IOLoRa:req.body.IOLoRa
  })
  let setting=await db.collection('Ombrometer').doc(req.params.id).get()

  // let UIDs =[]
  // await db.collection('user').where('ombrometerIDs','array-contains',req.params.id).get().then((snapshot)=> {
  //   snapshot.forEach((doc)=> {
  //     UIDs.push(doc.id)
  //   })
  // })

  // //Mengambil token notifikasi yang teregistrasi
  // let registrationTokens=[]
  // for (let i=0; i<UIDs.length; i++) {
  //   await db.collection('user').doc(UIDs[i]).collection('notifToken').get().then((snapshot)=>{
  //     snapshot.forEach((doc) => {
  //         registrationTokens.push(doc.data().token)
  //     })
  //   })
  // }

  // let waterLevel=0;
  // for (let i=0; i<5; i++) {
  //   if  (req.body.IO[i]=="48" || req.body.IO[i]=="0") {
  //     waterLevel=i+1;
  //   }
  // }
  
  
  //Data yang dikirim sebagai notifikasi
  // const message = {
  //   data: {
  //     title: `${setting.data().station}`, 
  //     body: `Terjadi perubahan Water Level di ${setting.data().station} menjadi level ${waterLevel}`, 
  //   },
  //   tokens: registrationTokens,
  //   webpush: {
  //     headers: {
  //       "Urgency": "high",
  //       "TTL":"4500"
  //     },
  //       fcmOptions: {
  //           link: "https://ombrometerlora.web.app/#/login"
  //       }
  //     },
  //   };

  //   //Mengirim Notifikasi
  //   admin.messaging().sendMulticast(message)
  //       .then((response) => {
  //       if (response.failureCount > 0) {
  //           const failedTokens = [];
  //           response.responses.forEach((resp, idx) => {
  //           if (!resp.success) {
  //               failedTokens.push(registrationTokens[idx]);
  //           }
  //           });
  //           console.log('List of tokens that caused failures: ' + failedTokens);
  //       }
  //   });

  res.status(200).send(`${setting.data().period},${setting.data().tipmm},${setting.data().alert},${setting.data().stopTime},${setting.data().periodSD}`)
})


function DecimalHexTwosComplement(decimal) {
  var size = 8;

  if (decimal >= 0) {
    var hexadecimal = decimal.toString(16);

    while ((hexadecimal.length % size) != 0) {
      hexadecimal = "" + 0 + hexadecimal;
    }

    return hexadecimal;
  } else {
    var hexadecimal = Math.abs(decimal).toString(16);
    while ((hexadecimal.length % size) != 0) {
      hexadecimal = "" + 0 + hexadecimal;
    }

    var output = '';
    for (i = 0; i < hexadecimal.length; i++) {
      output += (0x0F - parseInt(hexadecimal[i], 16)).toString(16);
    }

    output = (0x01 + parseInt(output, 16)).toString(16);
    return output;
  }
}

Ombrometer.post("/upload/:id", filesUpload, async (req, res) => {
  // will contain all text fields
  req.body;
  // will contain an array of file objects
  /*
    {
      fieldname: 'image',       String - name of the field used in the form
      originalname,             String - original filename of the uploaded image
      encoding,                 String - encoding of the image (e.g. "7bit")
      mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
      buffer,                   Buffer - buffer containing binary data
      size,                     Number - size of buffer in bytes
    }
  */
  console.log(req.files[0].buffer.toString());
  console.log(`CRC32: ${req.body.CRC32}`);

  console.log(`Server CRC32: ${DecimalHexTwosComplement(CRC32.buf(req.files[0].buffer, 0))}`)
  if (DecimalHexTwosComplement(CRC32.buf(req.files[0].buffer, 0))== req.body.CRC32) {
    await db.collection('Ombrometer').doc(req.params.id).update({
      CRC32SD:req.body.CRC32,
    })
    await db.collection('Ombrometer').doc(req.params.id).collection('SDFiles').add({
      data: req.files[0].buffer.toString(),
      CRC32: req.body.CRC32,
      time: Date.now(),
    })
    res.sendStatus(200).send('OK')
  } else {
    res.sendStatus(400).send('Error')
  }
});



exports.Ombrometer = functions.region('asia-east1').https.onRequest(Ombrometer);
