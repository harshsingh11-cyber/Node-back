import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';


const SECRET_KEY = "NOTESAPI";
const app = express();
const port = 4000;

dotenv.config();
app.use(cors());



const pass = process.env.MONGO_PASS;
app.use(express.json());


mongoose
    .connect(`mongodb+srv://harsh:${pass}@harsh-singh.yo9whrd.mongodb.net/Images?retryWrites=true&w=majority`)
    .then(() => console.log(`Connected to The MongoDB`))
    .catch((err) => console.log("error found", err));

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    }
});
const userModel = mongoose.model('user', userSchema);
const ImageSchema = new mongoose.Schema({
    data: String
});
const ImageModel = mongoose.model('image', ImageSchema);


// Sign up function ---------------------------------------------------------------------------------
async function signup(req, res) {
    const { username, email, pass } = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(pass, 10);
        const result = await userModel.create({
            email: email,
            password: hashPassword,
            username: username,
        });
        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
        res.status(200).json({ user: result, token: token });
    }
    catch (error) {
        console.log("error");
        alert("some problem with mongoDb");
        res.status(500).json({ message: "Somthing went wrong", error });
    }
}

// Login function ----------------------------------------------------------------------------
async function signin(req, res) {
    const { email, pass } = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const matchPassword = await bcrypt.compare(pass, existingUser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Credentials" });

        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY);
        res.status(200).json({ user: existingUser, token: token });
    }
    catch (error) {
        console.log("error");
        alert("some problem rise");
        res.status(500).json({ message: "Somthing went wrong" });
    }
}
//------------------------------------------------------------------------------------------------------------


//------Post Method---------Customer Registration -----------------------------------//
async function addImage(req, res) {
    console.log(req.body);
    const { data } = req.body;
    console.log(data);
    try {
        const result = await ImageModel.create({
            data: data
        });
        res.status(200).json(result);
    }
    catch (error) {
        console.log("Error found");
    }
}




//=========================Get Data ================== Costomer.................
async function getData(req, res) {
    try {
        const users = await ImageModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


//------------------------Pagination ------------------
async function getDataP(req, res) {
    const page = parseInt(req.query.page) || 1;
  const perPage = 4;
  try {
    const totalItems = await ImageModel.countDocuments();
    const totalPages = Math.ceil(totalItems / perPage);
    const skip = (page - 1) * perPage;

    const items = await ImageModel.find().skip(skip).limit(perPage);

    res.json({
      data: items,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'An error occurred while fetching data.' });
  }
};


app.get('/', (req, res) => {
    res.send("hello guys..");
})
app.post('/signup', signup);
app.post('/signin', signin);

app.post('/image', addImage);

app.get('/getimg', getData);
app.get('/items', getDataP);

app.listen(port, () => {
    console.log("server is started");
});