const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

// const admin = require('firebase-admin');
// const fileBucket='rainmonitor-b0968.appspot.com'
// const bucket = admin.storage().bucket(fileBucket);

exports.filesUpload = function (req, res, next) {
  console.log("HANDLE UPLOAD FILE")
  // See https://cloud.google.com/functions/docs/writing/http#multipart_data
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      // Cloud functions impose this restriction anyway
      fileSize: 10 * 1024 * 1024,
    },
  });

  const fields = {};
  const files = [];
  const fileWrites = [];
  // Note: os.tmpdir() points to an in-memory file system on GCF
  // Thus, any files in it must fit in the instance's memory.
  const tmpdir = os.tmpdir();

  busboy.on("field", (key, value) => {
    // You could do additional deserialization logic here, values will just be
    // strings
    fields[key] = value;
  });

  busboy.on("file", (fieldname, file, filename) => {
    
    let encoding = filename.encoding
    let mimetype = filename.mimeType

    const filepath = path.join(tmpdir, filename.filename);
    console.log(
      `Handling file upload field ${fieldname}: ${filename.filename} (${filepath})`
    );
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    fileWrites.push(
      new Promise((resolve, reject) => {
        file.on("end", () => writeStream.end());
        writeStream.on("finish", () => {
          fs.readFile(filepath, (err, buffer) => {
            const size = Buffer.byteLength(buffer);
            console.log(`${filename.filename} is ${size} bytes`);
            if (err) {
              console.log(err)
              return reject(err);
            }

            files.push({
              fieldname,
              originalname: filename.filename,
              encoding,
              mimetype,
              buffer,
              size,
            });
            
            // console.log(buffer.toString())

            // const FilePath = path.join();  
            
            // let contentType=mimetype

            // const metadata = { contentType: contentType };
            // console.log("upload")
            // bucket.upload(FilePath, {
            //   destination: FilePath,
            //   metadata: metadata,
            // }).then(res => {
            //   console.log(`THEN: ${res}`)
            // }).catch(err => {
            //   console.log(`ERROR:${err}`)
            // })

            try {
              fs.unlinkSync(filepath);
            } catch (error) {
              return reject(error);
            }

            resolve();
          });
        });
        writeStream.on("error", reject);
      })
    );
  });

  
  busboy.on("finish", () => {
    Promise.all(fileWrites)
      .then(() => {
        req.body = fields;
        req.files = files;
        return next();
      })
      .catch(next);
  });

  busboy.end(req.rawBody);
};