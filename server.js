//  aya and sewar

const express = require("express");
const path = require("path");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const app = express();
const multer = require("multer");

const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Serve static HTML forms
app.get("/form1", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form1.html"));
});

app.get("/form2", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form2.html"));
});

app.get("/form3", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form3.html"));
});

app.get("/form4", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form4.html"));
});

app.get("/form5", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form5.html"));
});
// Handle form submission
app.post("/submit-form", (req, res) => {
  const num = parseInt(req.body.num);

  if (isNaN(num) || num < 1 || num > 50) {
    return res.status(400).send("Invalid input");
  }

  let table = "<table style='border-collapse: collapse;'>"; // Add CSS for border collapse

  for (let i = 1; i <= num; i++) {
    table += "<tr>";

    for (let j = 1; j <= num; j++) {
      if (j <= i) {
        table += `<td style='border: 1px solid black; padding: 8px;'>${j}</td>`; // Add padding
      } else {
        table += "<td></td>";
      }
    }

    table += "</tr>";
  }

  table += "</table>";

  res.send(`
    <html>
      <head>
        <title>Steps Draw</title>
      </head>
      <body>
        <p>Graded table with ${num} rows:</p>
        ${table}
      </body>
    </html>
  `);
});



// 
// Handle form2 submission
app.post("/TXTinput", (req, res) => {
  const text = req.body["input-text"];

  if (!text || text.length === 0) {
    return res.status(400).send("Enter a text.");
  }

  let output = '';
  for (let i = 0; i < 12; i++) {
    const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)},
     ${Math.floor(Math.random() * 256)})`;
    output += `<p style="color: ${randomColor}; font-size: ${i + 12}px;">${text}</p>`;
  }

  res.send(output);
});


// 3:
// Handle form3 submission
// Array to hold file names
let uploadedFiles = [];

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
    uploadedFiles.push(fileName);  // Add the new file name to the array
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));
app.post("/uploads", upload.single("imageUpload"), (req, res) => {
  let lastFile=null;
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
if(req.body.clearCheckbox && req.body.clearCheckbox ==='on'){
  clearUploadsExceptLatest('uploads',res,uploadedFiles);
}else{
  returnImages(res,uploadedFiles);
}



// Generate HTML to display all images from the array

});

function returnImages(_res,_uploadedFiles) {
  let imagesHtml = _uploadedFiles.map(file => `<div style="width: 70%; margin: auto;"><img src="/uploads/${file}" alt="${file}" style="width:100%;height: auto; margin: 10px;"></div>`).join('');
  const htmlResponse = `
    <html>
    <head>
      <title>Uploaded Images</title>
    </head>
    <body style="text-align: center;">
      <h1>Uploaded Images</h1>
      
        ${imagesHtml}
      
    </body>
    </html>
  `;

  _res.send(htmlResponse);
}
function getLastModifiedFile(dir) {
  const files = fs.readdirSync(dir)
      .map(file => ({
        file,
        time: fs.statSync(path.join(dir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

  return files.length ? files[0].file : null;
}

function clearUploadsExceptLatest(dir,_res,_uploadedFiles) {
  const latestFile = getLastModifiedFile(dir);

  if (!latestFile) {
    return;
  }

  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      if (file !== latestFile) {
        fs.unlink(path.join(dir, file), err => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          } else { 
            console.log(`Deleted file: ${file}`);
          }
        });
      }
    });
    returnImages(_res,[latestFile]);
  });
}






// 4:
// Handle form4 submission
app.post("/register", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.surname;
  const email = req.body.email;
  const gender = req.body.gender;
  const birthdate = req.body.birthdate;
  const agreedToTerms = req.body.termsCheckbox;
  const password = req.body.password;


  res.send(`
    <html>
    <head>
      <title>Registration Details</title>
    </head>
    <body>
      <h1>Registration Details</h1>
      <p><strong>First Name:</strong> ${firstName}</p>
      <p><strong>Last Name:</strong> ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Gender:</strong> ${gender}</p>
      <p><strong>Date of Birth:</strong> ${birthdate}</p>
      <p><strong>Agreed to Terms:</strong> ${agreedToTerms}</p>
      <p><strong>Password:</strong> ${password}</p>
    </body>
    </html>
  `);
});


// 5:

// Configure multer for file uploads
const uploadd = multer({ dest: path.join(__dirname, "public/") });
// Handle poem file upload and presentation
app.post("/present", uploadd.single("poemfile"), (req, res) => {
  const file = req.file;
  const filePath = file.path;

  if (!file || file.mimetype !== "text/plain") {
    return res.status(400).send("Invalid file format. Please upload a .txt file.");
  }

  try {
    const poemText = fs.readFileSync(filePath, "utf8");
    const poemLines = poemText.split(/\r?\n/).filter(line => line.trim() !== "");

    let poemHTML = "";
    poemHTML += `<h1>${poemLines[0]}</h1>`; // Title as H1
    poemHTML += `<h2>${poemLines[1]}</h2>`; // Author as H2
    for (let i = 2; i < poemLines.length; i++) {
      if (i === 2) {
        poemHTML += `<p>${poemLines[i]}</p>`; // First line as paragraph
      } else {
        poemHTML += `<p>${poemLines[i]}</p>`; // Subsequent lines with breaks
      }
    }
console.log(poemLines[0]);
    res.send(poemHTML);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing poem file.");
  } finally {
    // Remove uploaded file (optional)
    fs.unlinkSync(filePath);
  }
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

