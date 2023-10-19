import express from "express";
import bodyParser from "body-parser";
import mongoose, { get } from "mongoose";
import _ from 'lodash';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database configuration
const password = "Karthik123"
mongoose.connect(`mongodb+srv://Karthik_Shetty:${password}@cluster0.2s0dylw.mongodb.net/todoListDB`, { useNewUrlParser: true, useUnifiedTopology: true });

const todaySchema = new mongoose.Schema({
  name: String,
});

const workSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [todaySchema],
});

const Today = mongoose.model("Today", todaySchema);
const Work = mongoose.model("Work", workSchema);
const List = mongoose.model("List", listSchema);

const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const day = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getDate() {
  return (
    day[new Date().getDay()] +
    ", " +
    month[new Date().getMonth()] +
    " " +
    new Date().getDate()
  );
}

app.get("/", (req, res) => {
  Today.find()
    .then((result) => {
      res.render("today.ejs", {
        toDoTodayText: result,
        date: getDate(),
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/work", (req, res) => {
  Work.find()
    .then((result) => {
      res.render("work.ejs", {
        toDoWorkText: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/submitToday", (req, res) => {
  if (req.body.list === getDate()) {
    Today.create({ name: req.body["todoText"] })
      .then((result) => {
        console.log(
          "Sucessfully inserted the data into todays collection : \n" + result
        );
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    const todoText = req.body.todoText;
    const name = req.body.list;

    const todo = new Today({
      name: todoText,
    });

    List.findOneAndUpdate({name : name}, {$push : {items : todo}})
    .then(result => {
        console.log("Successfull in adding new item to custom list " + name +"\n" +result);
        res.redirect('/'+name);
    })
    .catch(err => {
        console.log(err);
    })
  }
});

app.post("/submitWork", (req, res) => {
  Work.create({ name: req.body["todoText"] })
    .then((result) => {
      console.log(
        "Sucessfully inserted the data into works collection : \n" + result
      );
      res.redirect("/work");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/deleteToday", (req, res) => {
  const listName = req.body.listName;
  const checkBoxId = req.body.checkbox;

  if(listName === getDate()) {
    Today.deleteOne({ _id: checkBoxId })
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  } else {
    List.updateOne({name : listName}, {$pull : {items : {_id : checkBoxId}}})
    .then(result => {
      console.log("Sucessfully removed item from " + listName + "\n" + result);
      res.redirect('/'+ listName);
    })
    .catch(err => {console.log(err)});
  }
  
});

app.post("/deleteWork", (req, res) => {
  Work.deleteOne({ _id: req.body.checkbox })
    .then((result) => {
      console.log(result);
      res.redirect("/work");
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/:customListName", (req, res) => {
  var customListName = req.params.customListName;
  customListName = _.capitalize(customListName);
  // console.log(customListName);

  List.findOne({ name: customListName }).then((result) => {
    if (result) {
      res.render("today.ejs", {
        toDoTodayText: result.items,
        date: result.name,
      });
    } else {
      List.create({
        name: customListName,
        items: [],
      })
        .then((newListRes) => {
          console.log(
            "Successfully created new custom todo list \n" + newListRes
          );
        })
        .catch((err) => console.log(err));

      res.redirect("/" + customListName);
    }
  });
});


let port = process.env.PORT;
if(port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server started on ${port}`);
});
